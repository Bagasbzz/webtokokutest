'use server'

import { revalidatePath } from 'next/cache'
import { adminGuard } from '@/lib/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function setSellerRole(sellerId: string, role: 'admin' | 'seller') {
  const { user, seller } = await adminGuard()

  if (seller.id === sellerId && role !== 'admin') {
    throw new Error('Admin tidak bisa menurunkan role akun sendiri.')
  }

  const supabase = createAdminClient()
  const { data: targetSeller, error: fetchError } = await supabase
    .from('sellers')
    .select('id, user_id, email')
    .eq('id', sellerId)
    .single()

  if (fetchError || !targetSeller) {
    throw new Error('Seller tidak ditemukan.')
  }

  const { error } = await supabase
    .from('sellers')
    .update({ role })
    .eq('id', sellerId)

  if (error) throw new Error(error.message)

  if (role === 'admin') {
    const { error: adminError } = await supabase
      .from('platform_admins')
      .upsert({
        user_id: targetSeller.user_id,
        seller_id: targetSeller.id,
        email: targetSeller.email,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (adminError) throw new Error(adminError.message)
  } else {
    const { error: adminError } = await supabase
      .from('platform_admins')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', targetSeller.user_id)

    if (adminError) throw new Error(adminError.message)
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: role === 'admin' ? 'PROMOTE_ADMIN' : 'DEMOTE_SELLER',
    target_type: 'user',
    target_id: sellerId,
    description: `Admin changed seller role to ${role}`,
  })

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${sellerId}`)
}

/**
 * Permanently delete a user account from Supabase Auth and all related DB data.
 * All stores, products, orders, and customizations cascade-delete automatically.
 * The email will be freed for new registration immediately.
 */
export async function deleteUserAccount(sellerId: string) {
  const { user, seller: adminSeller } = await adminGuard()

  if (adminSeller.id === sellerId) {
    throw new Error('Admin tidak bisa menghapus akun sendiri.')
  }

  const supabase = createAdminClient()

  // 1. Fetch seller profile to get auth user_id
  const { data: targetSeller, error: fetchError } = await supabase
    .from('sellers')
    .select('id, user_id, email, nama_lengkap')
    .eq('id', sellerId)
    .single()

  if (fetchError || !targetSeller) {
    throw new Error('Seller tidak ditemukan di database.')
  }

  // 1.5. Clean up order items beforehand to avoid product FK constraint violations.
  // Since order_items.product_id lacks ON DELETE CASCADE, we delete the order_items first.
  try {
    const { data: stores } = await supabase
      .from('stores')
      .select('id')
      .eq('seller_id', sellerId)

    if (stores && stores.length > 0) {
      const storeIds = stores.map(s => s.id)
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .in('store_id', storeIds)

      if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id)
        await supabase
          .from('order_items')
          .delete()
          .in('order_id', orderIds)
      }
    }
  } catch (cleanError) {
    console.error('Error cleaning up order_items:', cleanError)
  }

  // 2. Nullify foreign key references to auth.users that are NOT cascade-deleted
  //    to prevent FK constraint violations when auth user is deleted.
  if (targetSeller.user_id) {
    await Promise.allSettled([
      supabase.from('admin_logs').update({ admin_id: null }).eq('admin_id', targetSeller.user_id),
      supabase.from('notifications').update({ created_by: null }).eq('created_by', targetSeller.user_id),
      supabase.from('template_revisions').update({ created_by: null }).eq('created_by', targetSeller.user_id),
    ])

    // 3. Delete from Supabase Auth — this cascades to sellers table (ON DELETE CASCADE)
    //    which further cascades to stores → products → orders → customizations etc.
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetSeller.user_id)

    if (authDeleteError) {
      // Fallback: if auth deletion fails (e.g., user not found in auth), delete sellers row directly
      const { error: dbError } = await supabase.from('sellers').delete().eq('id', sellerId)
      if (dbError) {
        throw new Error(`Gagal menghapus akun: ${authDeleteError.message}. DB fallback: ${dbError.message}`)
      }
    }
  } else {
    // No auth user_id — delete sellers row directly (data-only cleanup)
    const { error: dbError } = await supabase.from('sellers').delete().eq('id', sellerId)
    if (dbError) throw new Error(`Gagal menghapus profil seller: ${dbError.message}`)
  }

  // 4. Log the deletion action
  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'DELETE_USER_ACCOUNT',
    target_type: 'user',
    target_id: sellerId,
    description: `Admin permanently deleted account: ${targetSeller.nama_lengkap} (${targetSeller.email})`,
  })

  revalidatePath('/admin694')
  revalidatePath('/admin')

  return { success: true, email: targetSeller.email }
}
