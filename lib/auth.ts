import { createClient } from './supabase/client';

export async function signUp(email: string, password: string, sellerData: { nama_lengkap: string; no_wa: string }) {
  const supabase = createClient();
  
  // 1. Register with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { data: null, error };
  }

  // 2. Insert into sellers table
  if (data.user) {
    const { error: insertError } = await supabase
      .from('sellers')
      .insert({
        user_id: data.user.id,
        email: email,
        nama_lengkap: sellerData.nama_lengkap,
        no_wa: sellerData.no_wa,
      });

    if (insertError) {
      console.error('Error inserting seller profile:', insertError);
      // Depending on the use case, you might want to return this error or handle it 
      // but the auth account is already created.
      return { data, error: new Error('Gagal menyimpan profil seller: ' + insertError.message) };
    }
  }

  return { data, error: null };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  const supabase = createClient();
  return await supabase.auth.signOut();
}

export async function getSession() {
  const supabase = createClient();
  return await supabase.auth.getSession();
}
