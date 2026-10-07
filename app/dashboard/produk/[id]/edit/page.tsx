'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProduct, updateProduct, uploadProductPhoto, uploadCroppedProductPhoto, getMyStoreId, ensureProductCategory, getProductCategories } from '@/lib/product'
import { ChevronRight, UploadCloud, X, Loader2 } from 'lucide-react'
import { ImageCropperModal } from '@/components/editor/ImageCropperModal'
import { ProductOptionsBuilder } from '@/components/dashboard/ProductOptionsBuilder'
import { IMAGE_UPLOAD } from '@/lib/upload-limits'
import { compactDetails } from '@/lib/product-form-helpers'
import { normalizeAddons, normalizeOptionGroups } from '@/lib/product-options'
import type { ProductAddon, ProductCategory, ProductOptionGroup, ProductType } from '@/lib/types'
import styles from './page.module.css'

export default function EditProdukPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [storeId, setStoreId] = useState<string | null>(null)
  
  const [nama, setNama] = useState('')
  const [harga, setHarga] = useState('')
  const [kategori, setKategori] = useState('')
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [productType, setProductType] = useState<ProductType>('general')
  const [showCategory, setShowCategory] = useState(true)
  const [showOnHomepage, setShowOnHomepage] = useState(false)
  const [homepageRank, setHomepageRank] = useState('0')
  const [badgeLabel, setBadgeLabel] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
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
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const sid = await getMyStoreId()
        if (!sid) {
          router.push('/dashboard')
          return
        }
        setStoreId(sid)
        setCategories(await getProductCategories(sid))

        const product = await getProduct(params.id)
        if (!product) {
          setError('Produk tidak ditemukan atau Anda tidak memiliki akses ke produk ini.')
          setTimeout(() => router.push('/dashboard/produk'), 3000)
          return
        }

        setNama(product.nama)
        setHarga(product.harga.toString())
        setKategori(product.kategori || '')
        setProductType(product.product_type || 'general')
        setShowCategory(product.show_category ?? true)
        setShowOnHomepage(product.show_on_homepage ?? false)
        setHomepageRank(String(product.homepage_rank ?? 0))
        setBadgeLabel(product.badge_label || '')
        setCompareAtPrice(product.compare_at_price ? String(product.compare_at_price) : '')
        setDeskripsi(product.deskripsi || '')
        setStok(product.stok?.toString() || '0')
        setBeratGram(product.berat_gram?.toString() || '')
        setOptionGroups(Array.isArray(product.option_groups) ? product.option_groups : [])
        setAddons(Array.isArray(product.addons) ? product.addons : [])
        setDetails(prev => ({ ...prev, ...(product.product_details || {}) }))
        if (product.foto_url) {
          setPreviewUrl(product.foto_url)
          setOriginalPhotoUrl(product.foto_url)
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data produk')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [params.id, router])

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    setHarga(val)
  }

  const handleCompareAtPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompareAtPrice(e.target.value.replace(/\D/g, ''))
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
      let foto_url = originalPhotoUrl
      if (croppedBlob) {
        // Pakai uploadCroppedProductPhoto agar bentuk masking (bulat/oval/dll) tidak hilang
        foto_url = await uploadCroppedProductPhoto(croppedBlob, storeId)
      } else if (file) {
        foto_url = await uploadProductPhoto(file, storeId)
      } else if (!previewUrl) {
        foto_url = null // User removed the photo
      }

      const category = await ensureProductCategory(storeId, kategori)

      await updateProduct(params.id, {
        nama,
        harga: parseInt(harga),
        deskripsi,
        kategori: category?.name || kategori,
        category_id: category?.id || null,
        product_type: productType,
        show_category: showCategory,
        show_on_homepage: showOnHomepage,
        homepage_rank: parseInt(homepageRank) || 0,
        badge_label: badgeLabel.trim() || null,
        compare_at_price: parseInt(compareAtPrice) || null,
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

  if (isLoadingData) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin text-emerald-600" size={32} />
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
        <span className={styles.current}>Edit Produk</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Edit Produk</h2>
        </div>

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
            <label htmlFor="productType">Jenis produk</label>
            <select
              id="productType"
              className={styles.input}
              value={productType}
              onChange={e => setProductType(e.target.value as ProductType)}
            >
              <option value="general">Umum</option>
              <option value="fashion">Fashion</option>
              <option value="food">Makanan / minuman</option>
              <option value="skincare">Skincare</option>
              <option value="beauty">Beauty / kosmetik</option>
              <option value="health">Kesehatan</option>
            </select>
          </div>

          <div className={styles.sectionBox}>
            <h3>Tampilan di halaman utama</h3>
            <p>Opsional. Halaman utama toko hanya menampilkan maksimal 6 produk. Produk lain tetap muncul di halaman semua produk.</p>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={showOnHomepage} onChange={e => setShowOnHomepage(e.target.checked)} />
              Tampilkan produk ini di halaman utama
            </label>
            <div className={styles.gridTwo}>
              <label className={styles.compactField}>
                <span>Urutan tampil</span>
                <input
                  type="number"
                  className={styles.input}
                  value={homepageRank}
                  onChange={e => setHomepageRank(e.target.value)}
                  placeholder="0"
                />
              </label>
              <label className={styles.compactField}>
                <span>Label produk</span>
                <input
                  className={styles.input}
                  value={badgeLabel}
                  onChange={e => setBadgeLabel(e.target.value)}
                  placeholder="Best seller / Terlaris / Promo"
                />
              </label>
              <label className={styles.compactField}>
                <span>Harga sebelum diskon</span>
                <div className={styles.inputWrapper}>
                  <span className={styles.prefix}>Rp</span>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.inputWithPrefix}`}
                    value={compareAtPrice}
                    onChange={handleCompareAtPriceChange}
                    placeholder="180000"
                  />
                </div>
                {compareAtPrice && <small style={{color:'#64748b',fontSize:'12px'}}>{formatRp(compareAtPrice)}</small>}
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="kategori">Kategori (opsional)</label>
            <input
              id="kategori"
              type="text"
              className={styles.input}
              list="product-categories"
              placeholder="Pilih kategori atau tulis kategori baru"
              value={kategori}
              onChange={e => setKategori(e.target.value)}
            />
            <datalist id="product-categories">
              {categories.map(category => (
                <option key={category.id} value={category.name} />
              ))}
            </datalist>
            <small style={{color:'#64748b',fontSize:'12px'}}>
              Kategori baru otomatis dibuat saat produk disimpan. Kategori kosong tidak tampil di website.
            </small>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={showCategory} onChange={e => setShowCategory(e.target.checked)} />
              Tampilkan kategori produk di toko
            </label>
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
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
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
