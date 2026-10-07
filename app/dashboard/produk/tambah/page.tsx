'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMyStoreId, addProduct, uploadProductPhoto, uploadCroppedProductPhoto, ensureProductCategory, getProductCategories, getProducts } from '@/lib/product'
import { getMyStore } from '@/lib/store'
import { isProPlan, FREE_PLAN_LIMITS } from '@/lib/plan'
import { UpgradeProButton } from '@/components/plan/UpgradeProButton'
import { ChevronRight, UploadCloud, X, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { ImageCropperModal } from '@/components/editor/ImageCropperModal'
import { ProductOptionsBuilder } from '@/components/dashboard/ProductOptionsBuilder'
import { IMAGE_UPLOAD } from '@/lib/upload-limits'
import { compactDetails } from '@/lib/product-form-helpers'
import { normalizeAddons, normalizeOptionGroups } from '@/lib/product-options'
import type { ProductAddon, ProductCategory, ProductOptionGroup, ProductType } from '@/lib/types'
import styles from './page.module.css'

export default function TambahProdukPage() {
  const router = useRouter()
  const [storeId, setStoreId] = useState<string | null>(null)
  const [store, setStore] = useState<any>(null)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [checkingLimit, setCheckingLimit] = useState(true)
  
  const [nama, setNama] = useState('')
  const [harga, setHarga] = useState('')
  const [kategori, setKategori] = useState('')
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [deskripsi, setDeskripsi] = useState('')
  const [stok, setStok] = useState('')
  const [beratGram, setBeratGram] = useState('')
  const [optionGroups, setOptionGroups] = useState<ProductOptionGroup[]>([])
  const [addons, setAddons] = useState<ProductAddon[]>([])
  const [details, setDetails] = useState({
    unit: '',
    portion_detail: '',
    contents: '',
    ingredients: '',
    usage: '',
    material: '',
    size_chart: '',
    expiry_info: '',
    storage: '',
    shipping_note: '',
  })
  
  const [file, setFile] = useState<File | null>(null)
  const [croppedBlob, setCroppedBlobState] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadStoreAndLimit() {
      try {
        const myStore = await getMyStore()
        if (!myStore) {
          router.push('/dashboard')
          return
        }
        setStore(myStore)
        setStoreId(myStore.id)
        
        const [prodList, catList] = await Promise.all([
          getProducts(myStore.id),
          getProductCategories(myStore.id)
        ])
        setCategories(catList)

        const isPro = isProPlan(myStore)
        if (!isPro && prodList.length >= FREE_PLAN_LIMITS.products) {
          setIsLimitReached(true)
        }
      } catch (err) {
        console.error('Error loading store data:', err)
      } finally {
        setCheckingLimit(false)
      }
    }
    loadStoreAndLimit()
  }, [router])

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    setHarga(val)
  }



  const formatRp = (val: string) => {
    if (!val) return ''
    return 'Rp ' + parseInt(val).toLocaleString('id-ID')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      if (selected.size > IMAGE_UPLOAD.maxOriginalBytes) {
        setError(`Ukuran foto maksimal ${IMAGE_UPLOAD.maxOriginalLabel}. Foto akan dikompres otomatis sampai sekitar ${IMAGE_UPLOAD.maxStoredLabel}.`)
        return
      }
      if (!IMAGE_UPLOAD.allowedTypes.includes(selected.type)) {
        setError('Format file harus JPG, PNG, atau WEBP')
        return
      }
      setError(null)
      const objectUrl = URL.createObjectURL(selected)
      setCropSrc(objectUrl)
    }
  }

  const handleCropComplete = (blob: Blob) => {
    setCropSrc(null)
    // Simpan blob asli agar upload tidak dikompresi ulang (menjaga bentuk masking)
    setCroppedBlobState(blob)
    const croppedFile = new File([blob], 'product.webp', { type: 'image/webp' })
    setFile(croppedFile)
    setPreviewUrl(URL.createObjectURL(blob))
  }

  const removeFile = () => {
    setFile(null)
    setCroppedBlobState(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId) return
    if (!nama || !harga) {
      setError('Nama dan harga produk wajib diisi')
      return
    }
    if ((parseInt(harga) || 0) <= 0) {
      setError('Harga produk harus lebih dari 0')
      return
    }

    let safeOptionGroups: ProductOptionGroup[] = []
    let safeAddons: ProductAddon[] = []
    try {
      safeOptionGroups = normalizeOptionGroups(optionGroups)
      safeAddons = normalizeAddons(addons)
    } catch (err: any) {
      setError(err.message || 'Variasi produk belum valid')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let foto_url = null
      if (croppedBlob) {
        // Pakai uploadCroppedProductPhoto agar bentuk masking (bulat/oval/dll) tidak hilang
        foto_url = await uploadCroppedProductPhoto(croppedBlob, storeId)
      } else if (file) {
        foto_url = await uploadProductPhoto(file, storeId)
      }

      const category = await ensureProductCategory(storeId, kategori)

      await addProduct(storeId, {
        nama,
        harga: parseInt(harga),
        deskripsi,
        kategori: category?.name || kategori,
        category_id: category?.id || null,
        option_groups: safeOptionGroups,
        addons: safeAddons,
        product_details: compactDetails(details),
        stok: parseInt(stok) || 0,
        berat_gram: parseInt(beratGram) || 0,
        foto_url: foto_url || undefined
      })

      router.push('/dashboard/produk')
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan produk')
      setIsSubmitting(false)
    }
  }

  if (checkingLimit) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard" className={styles.link}>Dashboard</Link>
        <ChevronRight size={16} />
        <Link href="/dashboard/produk" className={styles.link}>Produk</Link>
        <ChevronRight size={16} />
        <span className={styles.current}>Tambah Produk</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Tambah Produk Baru</h2>
        </div>

        {isLimitReached ? (
          <div style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf4', border: '1px solid #bfe8cf', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#247a52' }}>
              <Sparkles size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Batas Jumlah Produk Tercapai ({FREE_PLAN_LIMITS.products}/{FREE_PLAN_LIMITS.products})</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '400px', lineHeight: 1.5 }}>
                Kamu menggunakan Paket Gratis yang membatasi maksimal {FREE_PLAN_LIMITS.products} produk aktif. Upgrade ke Paket Pro untuk mengaktifkan produk unlimited!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <Link href="/dashboard/produk" className={styles.btnGhost} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 16px', fontWeight: 600 }}>
                Kembali
              </Link>
              <UpgradeProButton
                store={store}
                className={styles.btnPrimary} 
                style={{ background: 'linear-gradient(135deg, #247a52, #145c39)', borderColor: '#247a52', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, color: '#fff' }}
              >
                <Sparkles size={16} /> Upgrade ke Pro
              </UpgradeProButton>
            </div>
          </div>
        ) : (
          <>
            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
          {/* Foto Area */}
          <div className={styles.formGroup}>
            <label>Foto Produk</label>
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              className={styles.hiddenInput} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            {previewUrl ? (
              <div className={styles.previewContainer}>
                <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                <button type="button" onClick={removeFile} className={styles.btnRemove}>
                  <X size={16} /> Hapus Foto
                </button>
              </div>
            ) : (
              <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                <UploadCloud size={40} color="#94a3b8" />
                <p>Klik atau drag file ke sini untuk upload</p>
                <span>File awal maksimal {IMAGE_UPLOAD.maxOriginalLabel}; disimpan terkompres sekitar {IMAGE_UPLOAD.maxStoredLabel}. JPG/PNG/WEBP.</span>
              </div>
            )}
          </div>

          {/* Form Input */}
          <div className={styles.formGroup}>
            <label htmlFor="nama">Nama Produk <span className={styles.required}>*</span></label>
            <input 
              id="nama"
              type="text" 
              className={styles.input} 
              placeholder="Contoh: Kemeja Flanel Kotak-kotak"
              value={nama}
              onChange={e => setNama(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="harga">Harga <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <span className={styles.prefix}>Rp</span>
              <input 
                id="harga"
                type="text" 
                className={`${styles.input} ${styles.inputWithPrefix}`} 
                placeholder="150000"
                value={harga}
                onChange={handleHargaChange}
                required
              />
            </div>
            {harga && <p className={styles.hargaPreview}>{formatRp(harga)}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="kategori">Kategori (opsional)</label>
            <input
              id="kategori"
              type="text"
              className={styles.input}
              list="product-categories"
              placeholder="Pilih atau ketik kategori baru"
              value={kategori}
              onChange={e => setKategori(e.target.value)}
            />
            <datalist id="product-categories">
              {categories.map(category => (
                <option key={category.id} value={category.name} />
              ))}
            </datalist>
            <small style={{color:'#64748b',fontSize:'12px'}}>
              Kategori baru otomatis dibuat saat produk disimpan.
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="stok">Stok tersedia <span className={styles.required}>*</span></label>
            <input
              id="stok"
              type="number"
              min="0"
              className={styles.input}
              placeholder="Contoh: 25"
              value={stok}
              onChange={e => setStok(e.target.value)}
              required
            />
            <small style={{color:'#64748b',fontSize:'12px'}}>
              Isi 0 kalau produk belum tersedia. Stok dipakai untuk membatasi jumlah checkout.
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="berat">Berat Produk (gram) <span className={styles.required}>*</span></label>
            <input 
              id="berat"
              type="number" 
              min="1"
              className={styles.input} 
              placeholder="Contoh: 500"
              value={beratGram}
              onChange={e => setBeratGram(e.target.value)}
              required
            />
            <small style={{color:'#64748b',fontSize:'12px'}}>
              Wajib diisi untuk kalkulasi ongkir otomatis
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="deskripsi">Deskripsi (opsional)</label>
            <textarea 
              id="deskripsi"
              className={`${styles.input} ${styles.textarea}`} 
              placeholder="Jelaskan detail produkmu (bahan, ukuran, cara pakai, dll)..."
              value={deskripsi}
              onChange={e => setDeskripsi(e.target.value)}
              maxLength={500}
            />
            <span className={styles.charCount}>{deskripsi.length}/500</span>
          </div>

          <div className={styles.sectionBox}>
            <ProductOptionsBuilder
              optionGroups={optionGroups}
              onOptionGroupsChange={setOptionGroups}
              addons={addons}
              onAddonsChange={setAddons}
            />
          </div>

          <div className={styles.sectionBox}>
            <h3>Detail produk</h3>
            <p>Isi yang relevan saja. Contoh makanan: porsi dan masa simpan. Fashion: bahan dan panduan ukuran. Skincare: bahan utama dan cara pakai.</p>
            <div className={styles.gridTwo}>
              {[
                ['unit', 'Satuan', 'pcs / box / botol'],
                ['portion_detail', 'Porsi / ukuran', '250g, 2-3 orang'],
                ['contents', 'Isi paket', '1 serum + 1 pouch'],
                ['ingredients', 'Bahan utama', 'Niacinamide, ceramide'],
                ['usage', 'Cara pakai', 'Gunakan pagi dan malam'],
                ['material', 'Bahan', 'Cotton twill'],
                ['size_chart', 'Panduan ukuran', 'S: 90cm, M: 96cm'],
                ['expiry_info', 'Masa simpan', '3 hari chiller'],
                ['storage', 'Penyimpanan', 'Simpan di tempat sejuk'],
                ['shipping_note', 'Catatan pengiriman', 'Dikirim dengan bubble wrap'],
              ].map(([key, label, placeholder]) => (
                <label key={key} className={styles.compactField}>
                  <span>{label}</span>
                  <input
                    className={styles.input}
                    value={(details as any)[key]}
                    onChange={e => setDetails(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className={styles.cardFooter}>
            <Link href="/dashboard/produk" className={styles.btnGhost}>Batal</Link>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
              ) : (
                'Simpan Produk'
              )}
            </button>
          </div>
        </form>
          </>
        )}
      </div>

      {cropSrc && (
        <ImageCropperModal
          src={cropSrc}
          aspectRatio={1} // Square is ideal for products
          cropShape="rect"
          onClose={() => setCropSrc(null)}
          onCrop={handleCropComplete}
          title="Sesuaikan Foto Produk"
        />
      )}
    </div>
  )
}
