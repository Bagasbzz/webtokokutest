'use client'

import { useState, useEffect } from 'react'
import { getMyStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { 
  Loader2, 
  Upload, 
  QrCode, 
  Check, 
  Trash2, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react'
import styles from './page.module.css'

const ALLOWED_QRIS_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

type MethodType = 'bank_transfer' | 'ewallet' | 'pickup'

type MethodForm = {
  bank_name: string
  account_number: string
  account_name: string
}

const EMPTY_METHOD: MethodForm = {
  bank_name: '',
  account_number: '',
  account_name: '',
}

export default function PaymentSettingsPage() {
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [qrisImage, setQrisImage] = useState<File | null>(null)
  const [qrisPreview, setQrisPreview] = useState<string | null>(null)
  const [currentQrisUrl, setCurrentQrisUrl] = useState<string | null>(null)
  const [methodIds, setMethodIds] = useState<Partial<Record<MethodType, string>>>({})
  const [bankForm, setBankForm] = useState<MethodForm>(EMPTY_METHOD)
  const [ewalletForm, setEwalletForm] = useState<MethodForm>(EMPTY_METHOD)
  const [pickupForm, setPickupForm] = useState<MethodForm>(EMPTY_METHOD)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Confirmation States
  const [showQrisConfirm, setShowQrisConfirm] = useState(false)
  const [methodToDelete, setMethodToDelete] = useState<{ type: MethodType; reset: () => void } | null>(null)

  useEffect(() => {
    loadStoreData()
  }, [])

  const loadStoreData = async () => {
    try {
      const myStore = await getMyStore()
      if (myStore) {
        setStore(myStore)
        const supabase = createClient()
        const { data } = await supabase
          .from('payment_methods')
          .select('id, type, bank_name, account_number, account_name, qr_image_url')
          .eq('store_id', myStore.id)
          .eq('is_active', true)
        
        const nextIds: Partial<Record<MethodType, string>> = {}
        for (const method of data || []) {
          if (method.type === 'qris' && method.qr_image_url) {
            setCurrentQrisUrl(method.qr_image_url)
          }
          if (method.type === 'bank_transfer') {
            nextIds.bank_transfer = method.id
            setBankForm({
              bank_name: method.bank_name || '',
              account_number: method.account_number || '',
              account_name: method.account_name || '',
            })
          }
          if (method.type === 'ewallet') {
            nextIds.ewallet = method.id
            setEwalletForm({
              bank_name: method.bank_name || '',
              account_number: method.account_number || '',
              account_name: method.account_name || '',
            })
          }
          if (method.type === 'pickup') {
            nextIds.pickup = method.id
            setPickupForm({
              bank_name: method.bank_name || 'Ambil di toko',
              account_number: method.account_number || '',
              account_name: method.account_name || '',
            })
          }
        }
        setMethodIds(nextIds)
      }
    } catch (error) {
      console.error('Error loading store:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!ALLOWED_QRIS_TYPES[file.type]) {
        setMessage({ type: 'error', text: 'Hanya file JPG, PNG, atau WEBP yang diperbolehkan' })
        return
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran file maksimal 2MB' })
        return
      }
      
      setQrisImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setQrisPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setMessage(null)
    }
  }

  const handleSave = async () => {
    if (!store || !qrisImage) return
    
    setSaving(true)
    setMessage(null)
    
    try {
      const formData = new FormData()
      formData.append('file', qrisImage)
      formData.append('store_id', store.id)

      const response = await fetch('/api/upload/qris', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Gagal upload QRIS')
      }
      
      setCurrentQrisUrl(result.url)
      setQrisImage(null)
      setQrisPreview(null)
      setMessage({ type: 'success', text: 'QRIS berhasil disimpan!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!store || !currentQrisUrl) return
    setShowQrisConfirm(true)
  }

  const executeQrisDelete = async () => {
    setShowQrisConfirm(false)
    setSaving(true)
    const supabase = createClient()
    try {
      // Delete from payment_methods
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('store_id', store.id)
        .eq('type', 'qris')
      
      if (error) throw error
      
      setCurrentQrisUrl(null)
      setMessage({ type: 'success', text: 'QRIS berhasil dihapus' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const saveManualMethod = async (type: MethodType, form: MethodForm) => {
    if (!store) return

    const hasRequiredData = type === 'pickup'
      ? Boolean(form.account_name.trim())
      : Boolean(form.bank_name.trim() && form.account_number.trim() && form.account_name.trim())

    if (!hasRequiredData) {
      setMessage({ type: 'error', text: 'Lengkapi data metode pembayaran dulu.' })
      return
    }

    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const payload = {
      store_id: store.id,
      type,
      bank_name: type === 'pickup' ? (form.bank_name || 'Ambil di toko') : form.bank_name,
      account_number: form.account_number,
      account_name: form.account_name,
      is_active: true,
    }

    try {
      const existingId = methodIds[type]
      const result = existingId
        ? await supabase.from('payment_methods').update(payload).eq('id', existingId).select('id').single()
        : await supabase.from('payment_methods').insert(payload).select('id').single()

      if (result.error) throw result.error

      setMethodIds(prev => ({ ...prev, [type]: result.data.id }))
      setMessage({ type: 'success', text: 'Metode pembayaran berhasil disimpan.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const deleteManualMethod = async (type: MethodType, reset: () => void) => {
    if (!store || !methodIds[type]) return
    setMethodToDelete({ type, reset })
  }

  const executeDeleteManualMethod = async () => {
    if (!methodToDelete) return
    const { type, reset } = methodToDelete
    setMethodToDelete(null)

    setSaving(true)
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodIds[type])

      if (error) throw error

      setMethodIds(prev => ({ ...prev, [type]: undefined }))
      reset()
      setMessage({ type: 'success', text: 'Metode pembayaran berhasil dihapus.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 size={32} className={styles.spinner} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pengaturan Pembayaran</h1>
          <p className={styles.subtitle}>Atur metode bayar yang akan tampil di checkout dan pesan WhatsApp.</p>
        </div>
      </header>

      {message && (
        <div className={`${styles.alert} ${styles[message.type]}`}>
          <AlertCircle size={18} />
          <span>{message.text}</span>
        </div>
      )}

      <div className={styles.content}>
        {/* Current QRIS */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <QrCode size={20} />
            QRIS Aktif
          </h2>
          
          {currentQrisUrl ? (
            <div className={styles.qrisCard}>
              <div className={styles.qrisPreview}>
                <img 
                  src={currentQrisUrl} 
                  alt="QRIS Payment" 
                  className={styles.qrisImage}
                />
              </div>
              <div className={styles.qrisInfo}>
                <p className={styles.qrisStatus}>
                  <Check size={16} className={styles.checkIcon} />
                  QRIS aktif dan siap digunakan
                </p>
                <p className={styles.qrisDesc}>
                  Pembeli akan melihat QRIS ini saat checkout dan dapat membayar 
                  melalui GoPay, OVO, DANA, ShopeePay, atau aplikasi pembayaran lainnya.
                </p>
                <button 
                  onClick={handleDelete}
                  className={styles.btnDelete}
                  disabled={saving}
                >
                  <Trash2 size={16} />
                  Hapus QRIS
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <ImageIcon size={48} className={styles.emptyIcon} />
              <p>Belum ada QRIS yang diupload</p>
              <span>Upload QRIS Anda di bawah ini</span>
            </div>
          )}
        </section>

        {/* Upload New QRIS */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Upload size={20} />
            Upload QRIS Baru
          </h2>
          
          <div className={styles.uploadArea}>
            <label className={styles.fileInput}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={saving}
              />
              <div className={styles.uploadPlaceholder}>
                {qrisPreview ? (
                  <img 
                    src={qrisPreview} 
                    alt="Preview" 
                    className={styles.previewImage}
                  />
                ) : (
                  <>
                    <Upload size={32} className={styles.uploadIcon} />
                    <span>Klik atau drag gambar QRIS ke sini</span>
                    <small>Format: JPG, PNG (Max 2MB)</small>
                  </>
                )}
              </div>
            </label>
            
            {qrisImage && (
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{qrisImage.name}</span>
                <button 
                  onClick={() => {
                    setQrisImage(null)
                    setQrisPreview(null)
                  }}
                  className={styles.btnClear}
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!qrisImage || saving}
            className={styles.btnSave}
          >
            {saving ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                Menyimpan...
              </>
            ) : (
              <>
                <Check size={18} />
                Simpan QRIS
              </>
            )}
          </button>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Transfer Bank</h2>
          <div className={styles.methodGrid}>
            <label>
              <span>Bank</span>
              <input value={bankForm.bank_name} onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })} placeholder="BCA, BRI, Mandiri" />
            </label>
            <label>
              <span>Nomor rekening</span>
              <input value={bankForm.account_number} onChange={e => setBankForm({ ...bankForm, account_number: e.target.value.replace(/\D/g, '') })} placeholder="1234567890" />
            </label>
            <label>
              <span>Nama rekening</span>
              <input value={bankForm.account_name} onChange={e => setBankForm({ ...bankForm, account_name: e.target.value })} placeholder="Nama pemilik rekening" />
            </label>
          </div>
          <div className={styles.methodActions}>
            <button type="button" onClick={() => saveManualMethod('bank_transfer', bankForm)} className={styles.btnSaveInline} disabled={saving}>Simpan transfer bank</button>
            {methodIds.bank_transfer && <button type="button" onClick={() => deleteManualMethod('bank_transfer', () => setBankForm(EMPTY_METHOD))} className={styles.btnDeleteInline} disabled={saving}>Hapus</button>}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>E-Wallet</h2>
          <div className={styles.methodGrid}>
            <label>
              <span>Provider</span>
              <input value={ewalletForm.bank_name} onChange={e => setEwalletForm({ ...ewalletForm, bank_name: e.target.value })} placeholder="DANA, OVO, GoPay, ShopeePay" />
            </label>
            <label>
              <span>Nomor akun</span>
              <input value={ewalletForm.account_number} onChange={e => setEwalletForm({ ...ewalletForm, account_number: e.target.value.replace(/\D/g, '') })} placeholder="081234567890" />
            </label>
            <label>
              <span>Nama akun</span>
              <input value={ewalletForm.account_name} onChange={e => setEwalletForm({ ...ewalletForm, account_name: e.target.value })} placeholder="Nama pemilik akun" />
            </label>
          </div>
          <div className={styles.methodActions}>
            <button type="button" onClick={() => saveManualMethod('ewallet', ewalletForm)} className={styles.btnSaveInline} disabled={saving}>Simpan e-wallet</button>
            {methodIds.ewallet && <button type="button" onClick={() => deleteManualMethod('ewallet', () => setEwalletForm(EMPTY_METHOD))} className={styles.btnDeleteInline} disabled={saving}>Hapus</button>}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ambil di Toko</h2>
          <div className={styles.methodGrid}>
            <label>
              <span>Judul metode</span>
              <input value={pickupForm.bank_name} onChange={e => setPickupForm({ ...pickupForm, bank_name: e.target.value })} placeholder="Ambil di toko" />
            </label>
            <label>
              <span>Kode awalan</span>
              <input value={pickupForm.account_number} onChange={e => setPickupForm({ ...pickupForm, account_number: e.target.value.toUpperCase() })} placeholder="PICKUP" />
            </label>
            <label className={styles.fullSpan}>
              <span>Instruksi ambil</span>
              <textarea value={pickupForm.account_name} onChange={e => setPickupForm({ ...pickupForm, account_name: e.target.value })} placeholder="Contoh: Ambil pukul 10.00-20.00. Tunjukkan kode order ke kasir." rows={3} />
            </label>
          </div>
          <div className={styles.methodActions}>
            <button type="button" onClick={() => saveManualMethod('pickup', pickupForm)} className={styles.btnSaveInline} disabled={saving}>Simpan ambil di toko</button>
            {methodIds.pickup && <button type="button" onClick={() => deleteManualMethod('pickup', () => setPickupForm(EMPTY_METHOD))} className={styles.btnDeleteInline} disabled={saving}>Hapus</button>}
          </div>
        </section>

        {/* Info */}
        <section className={styles.infoSection}>
          <h3>Cara kerja pembayaran manual</h3>
          <ol className={styles.infoList}>
            <li>Pembeli memilih metode bayar saat checkout.</li>
            <li>Detail pembayaran masuk ke pesan WhatsApp bersama kode order.</li>
            <li>Untuk transfer, QRIS, dan e-wallet, pembeli bisa upload bukti pembayaran.</li>
            <li>Untuk ambil di toko, pembeli mendapat kode order untuk ditunjukkan saat pengambilan.</li>
          </ol>
        </section>
      </div>
      {/* MODAL KONFIRMASI HAPUS QRIS */}
      {showQrisConfirm && (
        <div className={styles.modalOverlay} style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className={styles.modalContent} style={{ background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: 600, color: '#ef4444' }}>Hapus QRIS?</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus gambar QRIS yang aktif? Pembeli tidak akan bisa membayar via QRIS sampai Anda mengunggah QRIS baru.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setShowQrisConfirm(false)}
                style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={executeQrisDelete}
                style={{ border: 'none', background: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Hapus QRIS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS METODE MANUAL */}
      {methodToDelete && (
        <div className={styles.modalOverlay} style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className={styles.modalContent} style={{ background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: 600, color: '#ef4444' }}>Hapus Metode Pembayaran?</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus metode pembayaran ini dari website Anda?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setMethodToDelete(null)}
                style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={executeDeleteManualMethod}
                style={{ border: 'none', background: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Hapus Metode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
