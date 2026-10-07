'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMyStore, updateStore } from '@/lib/store'
import { uploadCroppedImage } from '@/lib/editor-upload'
import { ImageCropperModal } from '@/components/editor/ImageCropperModal'
import { getStorefrontDisplayHost, getStorefrontDisplayUrl } from '@/lib/storefront-url'
import { 
  Loader2, 
  ChevronRight, 
  Store, 
  MapPin, 
  Phone, 
  Palette, 
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  X,
  Upload
} from 'lucide-react'
import styles from './page.module.css'

const PRESET_COLOR_PAIRS = [
  { name: 'Skincare Emerald', primary: '#059669', secondary: '#10B981' },
  { name: 'Kuliner Orange', primary: '#EA580C', secondary: '#F97316' },
  { name: 'Butik Rose Gold', primary: '#C5A059', secondary: '#E5C483' },
  { name: 'Luxe Violet', primary: '#7C3AED', secondary: '#A78BFA' },
  { name: 'Herba Green', primary: '#2D6A4F', secondary: '#40916C' },
  { name: 'Blue Flash', primary: '#3B82F6', secondary: '#60A5FA' },
]

export default function PengaturanPage() {
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Form states
  const [namaToko, setNamaToko] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [noWa, setNoWa] = useState('')
  const [warnaPrimary, setWarnaPrimary] = useState('#008060')
  const [warnaSecondary, setWarnaSecondary] = useState('#10b981')
  const [kota, setKota] = useState('')
  const [alamat, setAlamat] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    async function fetchStore() {
      try {
        const data = await getMyStore()
        if (data) {
          setStore(data)
          setNamaToko(data.nama_toko)
          setDeskripsi(data.deskripsi || '')
          setNoWa(data.no_wa)
          const rawColor = data.warna_tema || '#008060'
          const [pColor, sColor] = rawColor.split(',')
          setWarnaPrimary(pColor || '#008060')
          setWarnaSecondary(sColor || pColor || '#10b981')
          setKota(data.kota || '')
          setAlamat(data.alamat || '')
          setLogoUrl(data.logo_url || null)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStore()
  }, [])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !store?.id) return

    const objectUrl = URL.createObjectURL(file)
    setCropImageSrc(objectUrl)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!store?.id) return
    setCropImageSrc(null)
    setUploadingLogo(true)
    setError(null)
    try {
      // Gunakan uploadCroppedImage (bukan uploadImage) agar masking bulat/oval/segilima tetap terjaga
      const res = await uploadCroppedImage(croppedBlob, store.id, 'brand')
      if (res.error) {
        setError(res.error)
      } else if (res.url) {
        setLogoUrl(res.url)
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleCopyLink = () => {
    const link = getStorefrontDisplayUrl(store?.slug || '')
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess(false)
    setError(null)

    try {
      if (!noWa.startsWith('62')) {
        throw new Error('Nomor WhatsApp harus diawali dengan 62 (contoh: 6281234567890)')
      }

      await updateStore(store.id, {
        nama_toko: namaToko,
        deskripsi,
        no_wa: noWa,
        warna_tema: `${warnaPrimary},${warnaSecondary}`,
        kota,
        alamat,
        logo_url: logoUrl
      })
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard" className={styles.link}>Dashboard</Link>
        <ChevronRight size={14} />
        <span className={styles.current}>Pengaturan Toko</span>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Pengaturan Toko</h1>
        <p className={styles.subtitle}>Kelola informasi dasar dan tampilan toko publik Anda.</p>
      </div>

      {success && (
        <div className={styles.alertSuccess}>
          <CheckCircle2 size={18} />
          <span>Pengaturan toko berhasil disimpan!</span>
        </div>
      )}

      {error && (
        <div className={styles.alertError}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        <div className={styles.mainColumn}>
          {/* Informasi Dasar */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}><Store size={18} /></div>
              <h3 className={styles.cardTitle}>Informasi Dasar</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>Logo Toko</label>
                <div className={styles.logoUploadWrapper}>
                  <div className={styles.logoPreviewContainer}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Toko" className={styles.logoPreview} />
                    ) : (
                      <div className={styles.logoPlaceholder}>
                        <Store size={24} />
                        <span>Tanpa Logo</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.logoActions}>
                    <button 
                      type="button" 
                      className={styles.btnUpload} 
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Upload size={16} />
                      )}
                      <span>{uploadingLogo ? 'Mengunggah...' : 'Pilih Foto'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        disabled={uploadingLogo} 
                      />
                    </button>
                    {logoUrl && (
                      <button 
                        type="button" 
                        onClick={() => setLogoUrl(null)} 
                        className={styles.btnRemoveLogo}
                      >
                        <X size={14} />
                        <span>Hapus Logo</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className={styles.hint}>Rekomendasi ukuran logo berbentuk persegi dengan background transparan (PNG).</p>
              </div>
              <div className={styles.formGroup}>
                <label>Nama Toko <span className={styles.required}>*</span></label>
                <input 
                  type="text" 
                  value={namaToko} 
                  onChange={e => setNamaToko(e.target.value)} 
                  required 
                  placeholder="Nama Toko Anda"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Deskripsi Toko</label>
                <textarea 
                  value={deskripsi} 
                  onChange={e => setDeskripsi(e.target.value)} 
                  placeholder="Ceritakan sedikit tentang toko Anda..."
                  rows={3}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Kota</label>
                  <div className={styles.inputIconWrapper}>
                    <MapPin size={16} className={styles.inputIcon} />
                    <input 
                      type="text" 
                      value={kota} 
                      onChange={e => setKota(e.target.value)} 
                      placeholder="Contoh: Jakarta Selatan"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Nomor WhatsApp <span className={styles.required}>*</span></label>
                  <div className={styles.inputIconWrapper}>
                    <Phone size={16} className={styles.inputIcon} />
                    <input 
                      type="text" 
                      value={noWa} 
                      onChange={e => setNoWa(e.target.value.replace(/\D/g, ''))} 
                      required 
                      placeholder="628xxxxxxxxxx"
                    />
                  </div>
                  <p className={styles.hint}>Gunakan kode negara (62). Contoh: 6281234567890</p>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Alamat Lengkap</label>
                <textarea 
                  value={alamat} 
                  onChange={e => setAlamat(e.target.value)} 
                  placeholder="Alamat fisik toko (opsional)..."
                  rows={2}
                />
              </div>
            </div>
          </section>

          {/* Tampilan Toko */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}><Palette size={18} /></div>
              <h3 className={styles.cardTitle}>Tampilan Toko</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>Pilihan Warna Tema Toko (Ganda)</label>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Warna Utama (Primary)</span>
                    <div className={styles.colorPickerWrapper}>
                      <input 
                        type="color" 
                        value={warnaPrimary} 
                        onChange={e => setWarnaPrimary(e.target.value)}
                        className={styles.colorPicker}
                      />
                      <span className={styles.colorValue}>{warnaPrimary.toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Warna Aksen (Secondary)</span>
                    <div className={styles.colorPickerWrapper}>
                      <input 
                        type="color" 
                        value={warnaSecondary} 
                        onChange={e => setWarnaSecondary(e.target.value)}
                        className={styles.colorPicker}
                      />
                      <span className={styles.colorValue}>{warnaSecondary.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.colorSection}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>Preset Warna Cepat:</span>
                  <div className={styles.presetsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                    {PRESET_COLOR_PAIRS.map(pair => (
                      <button
                        key={pair.name}
                        type="button"
                        className={styles.presetBtn}
                        style={{ 
                          background: `linear-gradient(135deg, ${pair.primary} 50%, ${pair.secondary} 50%)`,
                          height: '40px',
                          borderRadius: '8px',
                          border: warnaPrimary === pair.primary && warnaSecondary === pair.secondary ? '2px solid #0f172a' : '1px solid rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '0 8px'
                        }}
                        onClick={() => {
                          setWarnaPrimary(pair.primary)
                          setWarnaSecondary(pair.secondary)
                        }}
                        title={`${pair.name}: ${pair.primary} & ${pair.secondary}`}
                      >
                        {pair.name}
                      </button>
                    ))}
                  </div>
                </div>
                <p className={styles.hint} style={{ marginTop: '12px' }}>Warna utama dan aksen akan disesuaikan secara dinamis pada elemen visual halaman toko publik Anda untuk memunculkan ciri khas yang unik.</p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Domain dan Hosting</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.domainBlock}>
                <span className={styles.domainLabel}>Domain bawaan</span>
                <strong>{store?.slug ? getStorefrontDisplayHost(store.slug) : 'nama-toko.webtokoku.id'}</strong>
                <p>Link ini langsung aktif setelah toko dibuat. Bisa dipakai untuk bio, katalog, dan chat pelanggan.</p>
              </div>

              <div className={styles.domainBlock}>
                <span className={styles.domainLabel}>Domain sendiri</span>
                <strong>{store?.custom_domain || 'contoh: namatoko.id'}</strong>
                <p>Domain sendiri membuat alamat toko lebih pendek dan mudah diingat. Hosting toko tetap dikelola oleh webtokoku.</p>
              </div>

              <div className={styles.domainSteps}>
                <p>Beli domain di penyedia seperti Hostinger, IDWebHost, Niagahoster, atau Rumahweb.</p>
                <p>Setelah domain aktif, buka DNS manager lalu arahkan domain ke webtokoku.</p>
                <p>Untuk domain utama, gunakan A record ke <code>76.76.21.21</code>. Untuk subdomain seperti <code>shop.namatoko.id</code>, gunakan CNAME ke <code>cname.vercel-dns.com</code>.</p>
                <p>Kirim nama domain ke admin webtokoku untuk verifikasi dan pemasangan ke toko.</p>
              </div>

              <div className={styles.providerLinks}>
                <a href="https://www.hostinger.co.id/domain-murah" target="_blank" rel="noopener noreferrer">Hostinger</a>
                <a href="https://idwebhost.com/domain-murah" target="_blank" rel="noopener noreferrer">IDWebHost</a>
                <a href="https://www.niagahoster.co.id/domain-murah" target="_blank" rel="noopener noreferrer">Niagahoster</a>
                <a href="https://www.rumahweb.com/domain/" target="_blank" rel="noopener noreferrer">Rumahweb</a>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.sideColumn}>
          {/* Link Toko */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Link Toko Anda</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.slugDisplay}>
                <span className={styles.slugValue}>{store?.slug ? getStorefrontDisplayHost(store.slug) : 'webtokoku.id'}</span>
              </div>
              <div className={styles.linkActions}>
                <button type="button" onClick={handleCopyLink} className={styles.btnSecondary}>
                  {copied ? <><CheckCircle2 size={16} /> Tersalin</> : <><Copy size={16} /> Salin Link</>}
                </button>
                <Link href={store?.slug ? getStorefrontDisplayUrl(store.slug) : '#'} target="_blank" className={styles.btnSecondary}>
                  <ExternalLink size={16} /> Buka Toko
                </Link>
              </div>
            </div>
          </section>

          <div className={styles.stickyAction}>
            <button 
              type="submit" 
              className={styles.btnPrimary} 
              disabled={isSubmitting}
            >
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </form>

      {cropImageSrc && (
        <ImageCropperModal
          src={cropImageSrc}
          aspectRatio={1}
          cropShape="circle"
          onClose={() => setCropImageSrc(null)}
          onCrop={handleCropComplete}
          title="Sesuaikan Logo Toko"
        />
      )}
    </div>
  )
}
