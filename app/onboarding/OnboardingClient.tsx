'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getStorefrontDisplayHost } from '@/lib/storefront-url'
import { TEMPLATES } from '@/lib/templates'
import type { TemplateId } from '@/lib/types'
import type { PublicProduct, PublicStore } from '@/lib/public-store'
import { ButikTemplate } from '@/components/templates/ButikTemplate'
import { DapurTemplate } from '@/components/templates/DapurTemplate'
import { GlowTemplate } from '@/components/templates/GlowTemplate'
import { HerbaTemplate } from '@/components/templates/HerbaTemplate'
import { LuxeTemplate } from '@/components/templates/LuxeTemplate'
import styles from './page.module.css'
import { ImageCropperModal } from '@/components/editor/ImageCropperModal'
import { Store, Layout, Phone, Eye, ArrowRight, ArrowLeft, Check, Loader2, PlusCircle, ExternalLink, CheckCircle, XCircle, Globe, MapPin, Lightbulb } from 'lucide-react'

const WARNA_PRESETS = [
  { hex: '#be185d', label: 'Rose' }, { hex: '#c2410c', label: 'Orange' },
  { hex: '#059669', label: 'Emerald' }, { hex: '#7c3aed', label: 'Violet' },
  { hex: '#1d4ed8', label: 'Blue' }, { hex: '#b45309', label: 'Amber' },
  { hex: '#16a34a', label: 'Hijau' }, { hex: '#0f172a', label: 'Slate' },
]

const FONT_OPTIONS = ['Outfit', 'Inter', 'Poppins', 'Playfair Display', 'Montserrat']
const BUSINESS_CATEGORY_OPTIONS = [
  'Fashion & Hijab',
  'Makanan & Minuman',
  'Skincare',
  'Kosmetik',
  'Kesehatan & Apotek',
  'Elektronik',
  'Aksesoris',
  'Perlengkapan Rumah',
  'Produk Digital',
  'Jasa',
  'Otomotif',
  'Hobi & Koleksi',
  'Umum / Serba Ada',
]

interface DraftProduct { id: string; nama: string; harga: string; foto_url: string; deskripsi: string; kategori: string }

const SAMPLE_PRODUCTS: Record<TemplateId, PublicProduct[]> = {
  butik: sampleSet('butik', 'fashion', ['Dress', 'Outer', 'Kemeja', 'Celana', 'Hijab'], ['Ready to Wear', 'Atasan', 'Bawahan'], ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=900&auto=format&fit=crop', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=900&auto=format&fit=crop', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop']),
  dapur: sampleSet('dapur', 'food', ['Rendang', 'Rice Bowl', 'Ayam Bakar', 'Sate', 'Sambal'], ['Menu harian', 'Paket keluarga', 'Frozen food'], ['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=900&auto=format&fit=crop', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=900&auto=format&fit=crop', 'https://images.unsplash.com/photo-1627042633145-b780d842ba45?q=80&w=900&auto=format&fit=crop']),
  glow: sampleSet('glow', 'skincare', ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'], ['Cleanser', 'Treatment', 'Daily care'], ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=900&auto=format&fit=crop', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=900&auto=format&fit=crop', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=900&auto=format&fit=crop']),
  luxe: sampleSet('luxe', 'beauty', ['Lip Tint', 'Cushion', 'Brow Pencil', 'Blush', 'Palette'], ['Lip', 'Base', 'Eye'], ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=900&auto=format&fit=crop', 'https://images.unsplash.com/photo-1596462502277-27bfdc40334a?q=80&w=900&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=900&auto=format&fit=crop']),
  herba: sampleSet('herba', 'health', ['Vitamin C', 'Madu Herbal', 'Omega 3', 'Probiotik', 'Masker Medis'], ['Vitamin', 'Herbal', 'Alat kesehatan'], ['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=900&auto=format&fit=crop', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=900&auto=format&fit=crop', 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?q=80&w=900&auto=format&fit=crop']),
}

function sampleSet(prefix: string, type: string, names: string[], categories: string[], images: string[]): PublicProduct[] {
  return Array.from({ length: 15 }, (_, index) => {
    const category = categories[index % categories.length]
    const name = `${names[index % names.length]} ${index + 1}`
    return product(
      `sample-${prefix}-${index + 1}`,
      name,
      25000 + (index + 1) * 9000,
      category,
      `Detail ${name.toLowerCase()} lengkap dengan stok, berat, dan pilihan varian.`,
      images[index % images.length],
      type,
      index,
    )
  })
}

function product(id: string, nama: string, harga: number, kategori: string, deskripsi: string, foto_url: string, product_type = 'general', index = 0): PublicProduct {
  const isFood = product_type === 'food'
  const isWear = product_type === 'fashion'
  const isCare = product_type === 'skincare' || product_type === 'beauty'
  return {
    id,
    nama,
    harga,
    kategori,
    deskripsi,
    foto_url,
    berat_gram: isFood ? 500 : 250,
    stok: 25,
    product_type,
    show_category: true,
    show_on_homepage: index < 6,
    homepage_rank: index,
    badge_label: index === 0 ? 'Best seller' : index === 1 ? 'Terlaris' : index === 2 ? 'Promo' : null,
    compare_at_price: index === 2 ? harga + 18000 : null,
    option_groups: isFood
      ? [{ id: 'portion', name: 'Porsi', type: 'portion', required: true, values: [{ id: 'regular', label: 'Reguler' }, { id: 'large', label: 'Large', price_delta: 12000 }] }]
      : isWear
        ? [{ id: 'size', name: 'Ukuran', type: 'size', required: true, values: [{ id: 's', label: 'S' }, { id: 'm', label: 'M' }, { id: 'l', label: 'L' }] }, { id: 'color', name: 'Warna', type: 'color', required: true, values: [{ id: 'black', label: 'Hitam', color_hex: '#111111' }, { id: 'cream', label: 'Cream', color_hex: '#e7d7bd' }] }]
        : [{ id: 'size', name: 'Isi', type: isCare ? 'shade' : 'custom', required: true, values: [{ id: 'small', label: isCare ? 'Natural' : '1 pcs' }, { id: 'bundle', label: 'Bundle', price_delta: 25000 }] }],
    addons: isFood ? [{ id: 'sambal', name: 'Extra sambal', price: 5000, max_qty: 3 }] : [],
    product_details: {
      unit: isFood ? 'porsi' : 'pcs',
      portion_detail: isFood ? 'Reguler dan large' : undefined,
      contents: isCare ? '1 produk utama' : undefined,
      material: isWear ? 'Bahan nyaman untuk harian' : undefined,
      usage: isCare ? 'Gunakan sesuai kebutuhan' : undefined,
      shipping_note: 'Dikemas sebelum dikirim',
    },
  }
}

function TemplatePreview({
  template,
  namaToko,
  slug,
  deskripsi,
  warnaTema,
  heroImageUrl,
  fontHeading,
  heroTitle,
  heroSubtitle,
  draftProducts,
}: {
  template: TemplateId
  namaToko: string
  slug: string
  deskripsi: string
  warnaTema: string
  heroImageUrl: string
  fontHeading: string
  heroTitle: string
  heroSubtitle: string
  draftProducts: DraftProduct[]
}) {
  const store: PublicStore = {
    id: 'preview-store',
    nama_toko: namaToko || 'Nama Toko',
    slug: slug || 'nama-toko',
    deskripsi: deskripsi || null,
    template,
    warna_tema: warnaTema,
    logo_url: null,
    no_wa: '6281234567890',
    kota: 'Indonesia',
    alamat: null,
    hero_image_url: heroImageUrl || null,
    font_heading: fontHeading || 'Outfit',
    font_body: 'Inter',
    hero_title: heroTitle || null,
    hero_subtitle: heroSubtitle || null,
  }

  const products = draftProducts.length > 0
    ? draftProducts.map((item, index) => product(
        item.id || `draft-${index}`,
        item.nama || `Produk ${index + 1}`,
        parseInt(item.harga) || 0,
        item.kategori || 'Produk',
        item.deskripsi || 'Produk dari toko ini.',
        item.foto_url || SAMPLE_PRODUCTS[template][index % SAMPLE_PRODUCTS[template].length].foto_url || ''
      ))
    : SAMPLE_PRODUCTS[template]

  const customizations = {
    'hero.title': heroTitle || namaToko || '',
    'hero.subtitle': heroSubtitle || deskripsi || '',
    'hero.image_url': heroImageUrl || '',
  }

  let preview

  switch (template) {
    case 'dapur':
      preview = <DapurTemplate store={store} products={products} customizations={customizations} />
      break
    case 'glow':
      preview = <GlowTemplate store={store} products={products} customizations={customizations} />
      break
    case 'luxe':
      preview = <LuxeTemplate store={store} products={products} customizations={customizations} />
      break
    case 'herba':
      preview = <HerbaTemplate store={store} products={products} customizations={customizations} />
      break
    case 'butik':
    default:
      preview = <ButikTemplate store={store} products={products} customizations={customizations} />
  }

  return <div className={styles.templatePreviewViewport}>{preview}</div>
}

interface RegionValue {
  code: string
  name: string
  postal_code?: string
}

interface RegionComboboxProps {
  label: string
  placeholder: string
  value: RegionValue
  options: RegionValue[]
  disabled?: boolean
  emptyText?: string
  onSelect: (value: RegionValue) => void
  onManual: (name: string) => void
}

function RegionCombobox({
  label,
  placeholder,
  value,
  options,
  disabled,
  emptyText = 'Tidak ada pilihan yang cocok',
  onSelect,
  onManual,
}: RegionComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const query = value.name.trim().toLowerCase()
  const startsWith = query.length >= 2
    ? options.filter(option => option.name.toLowerCase().startsWith(query))
    : []
  const contains = query.length >= 2
    ? options.filter(option =>
        !option.name.toLowerCase().startsWith(query) &&
        option.name.toLowerCase().includes(query)
      )
    : []
  const results = [...startsWith, ...contains].slice(0, 8)

  return (
    <div className={styles.comboWrap}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        placeholder={placeholder}
        disabled={disabled}
        value={value.name}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        onChange={(e) => {
          const name = e.target.value
          const found = options.find(option => option.name.toLowerCase() === name.toLowerCase())
          if (found) onSelect(found)
          else onManual(name)
          setIsOpen(true)
        }}
      />

      {isOpen && !disabled && (
        <div className={styles.comboMenu}>
          {query.length < 2 ? (
            <div className={styles.comboHint}>Ketik minimal 2 huruf</div>
          ) : results.length > 0 ? (
            results.map(option => (
              <button
                key={option.code}
                type="button"
                className={styles.comboOption}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(option)
                  setIsOpen(false)
                }}
              >
                <span>{option.name}</span>
                {option.postal_code && <small>{option.postal_code}</small>}
              </button>
            ))
          ) : (
            <div className={styles.comboHint}>{emptyText}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function OnboardingClient({ featureFlags }: { featureFlags: Record<string, boolean> }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'tampilan' | 'teks'>('tampilan')
  const [showModal, setShowModal] = useState(false)

  // Step 1 fields
  const [namaToko, setNamaToko] = useState('')
  const [slug, setSlug] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [noWa, setNoWa] = useState('')
  const [kategoriUsaha, setKategoriUsaha] = useState('')
  
  // Regional Address State
  const [provinces, setProvinces] = useState<any[]>([])
  const [regencies, setRegencies] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [villages, setVillages] = useState<any[]>([])

  const [selectedProvince, setSelectedProvince] = useState({ code: '', name: '' })
  const [selectedRegency, setSelectedRegency] = useState({ code: '', name: '' })
  const [selectedDistrict, setSelectedDistrict] = useState({ code: '', name: '' })
  const [selectedVillage, setSelectedVillage] = useState({ code: '', name: '', postal_code: '' })
  
  const [alamatDetail, setAlamatDetail] = useState('')
  const [locationNotes, setLocationNotes] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  
  const [slugStatus, setSlugStatus] = useState<'idle'|'checking'|'available'|'taken'>('idle')

  // Step 2
  const [template, setTemplate] = useState<TemplateId>('butik')

  // Step 3 customization
  const [warnaTema, setWarnaTema] = useState('#16a34a')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [fontHeading, setFontHeading] = useState('Outfit')
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [draftProducts, setDraftProducts] = useState<DraftProduct[]>([])


  const generateSlug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 30)
  const formatNoWA = (s: string) => { const d = s.replace(/\D/g, ''); return d.startsWith('0') ? '62' + d.slice(1) : d.startsWith('62') ? d : '62' + d }
  const storefrontHost = slug ? getStorefrontDisplayHost(slug) : 'nama-toko.webtokoku.id'

  useEffect(() => { if (namaToko) setSlug(generateSlug(namaToko)) }, [namaToko])

  useEffect(() => {
    if (!slug || slug.length < 3) { setSlugStatus('idle'); return }
    const t = setTimeout(async () => {
      setSlugStatus('checking')
      const { data } = await supabase.from('stores').select('id').eq('slug', slug).maybeSingle()
      setSlugStatus(data ? 'taken' : 'available')
    }, 500)
    return () => clearTimeout(t)
  }, [slug, supabase])

  // Fetch regions
  useEffect(() => {
    fetch('/api/regions/provinces').then(res => res.json()).then(setProvinces)
  }, [])

  useEffect(() => {
    if (selectedProvince.code && selectedProvince.code !== 'manual') {
      fetch(`/api/regions/regencies?province_code=${selectedProvince.code}`)
        .then(res => res.json())
        .then(setRegencies)
    } else {
      setRegencies([]); setSelectedRegency({ code: '', name: '' })
    }
  }, [selectedProvince.code])

  useEffect(() => {
    if (selectedRegency.code && selectedRegency.code !== 'manual') {
      fetch(`/api/regions/districts?regency_code=${selectedRegency.code}`)
        .then(res => res.json())
        .then(setDistricts)
    } else {
      setDistricts([]); setSelectedDistrict({ code: '', name: '' })
    }
  }, [selectedRegency.code])

  useEffect(() => {
    if (selectedDistrict.code && selectedDistrict.code !== 'manual') {
      fetch(`/api/regions/villages?district_code=${selectedDistrict.code}`)
        .then(res => res.json())
        .then(setVillages)
    } else {
      setVillages([]); setSelectedVillage({ code: '', name: '', postal_code: '' })
    }
  }, [selectedDistrict.code])

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    const name = provinces.find(p => p.code === code)?.name || ''
    setSelectedProvince({ code, name })
    setSelectedRegency({ code: '', name: '' })
    setSelectedDistrict({ code: '', name: '' })
    setSelectedVillage({ code: '', name: '', postal_code: '' })
  }

  const handleRegencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    const name = regencies.find(r => r.code === code)?.name || ''
    setSelectedRegency({ code, name })
    setSelectedDistrict({ code: '', name: '' })
    setSelectedVillage({ code: '', name: '', postal_code: '' })
  }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    const name = districts.find(d => d.code === code)?.name || ''
    setSelectedDistrict({ code, name })
    setSelectedVillage({ code: '', name: '', postal_code: '' })
  }

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    const item = villages.find(v => v.code === code)
    setSelectedVillage({ code, name: item?.name || '', postal_code: item?.postal_code || '' })
  }

  // Set default color when template changes
  useEffect(() => {
    const tpl = TEMPLATES.find(t => t.id === template)
    if (tpl) { setWarnaTema(tpl.warna_default); setFontHeading(tpl.font_heading_default) }
  }, [template])

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setCropImageSrc(objectUrl)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropImageSrc(null)
    setIsLoading(true)
    try {
      const croppedFile = new File([croppedBlob], 'hero.webp', { type: 'image/webp' })
      const form = new FormData()
      form.append('file', croppedFile)
      form.append('store_id', 'temp-onboarding')
      form.append('purpose', 'onboarding')
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (json.url) setHeroImageUrl(json.url)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      if (featureFlags?.['email_verification'] && !user.email_confirmed_at) {
        router.push('/auth/verify-email')
        return
      }
    }
    checkUser()
  }, [router, supabase])

  const handleSubmit = async () => {
    setIsLoading(true); setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sesi habis, silakan login ulang')
      const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single()
      if (!seller) throw new Error('Data seller tidak ditemukan')

      if (!selectedVillage.code) throw new Error('Silakan pilih wilayah sampai Kelurahan/Desa')

      const res = await fetch('/api/stores/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_toko: namaToko,
          slug,
          deskripsi: deskripsi || null,
          template,
          no_wa: formatNoWA(noWa),
          business_category: kategoriUsaha || null,
          warna_tema: warnaTema,
          hero_image_url: heroImageUrl || null,
          font_heading: fontHeading,
          hero_title: heroTitle || null,
          hero_subtitle: heroSubtitle || null,
          address: {
            alamat_detail: alamatDetail,
            province_code: selectedProvince.code,
            province_name: selectedProvince.name,
            regency_code: selectedRegency.code,
            regency_name: selectedRegency.name,
            district_code: selectedDistrict.code,
            district_name: selectedDistrict.name,
            village_code: selectedVillage.code,
            village_name: selectedVillage.name,
            postal_code: selectedVillage.postal_code,
            location_notes: locationNotes,
            map_url: mapUrl
          },
          products: draftProducts
        })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal membuat toko')

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.')
    } finally {
      setIsLoading(false)
    }
  }

  const STEPS = [
    { icon: <Store size={14} />, label: 'Info Toko' },
    { icon: <Layout size={14} />, label: 'Template' },
    { icon: <Globe size={14} />, label: 'Kustomisasi' },
    { icon: <Eye size={14} />, label: 'Terbit' },
  ]

  return (
    <div className={styles.container}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>webtokoku</Link>
        <span className={styles.beta}>Setup toko</span>
      </nav>

      <main className={styles.main}>
        {/* Step Indicator */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={`${styles.stepBulat} ${step >= i + 1 ? styles.stepBulatActive : ''}`}>
                  {step > i + 1 ? <Check size={14} /> : i + 1}
                </div>
              </div>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className={styles.card}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.header}>
              <div className={styles.headerIcon}><Store size={22} /></div>
              <h1>Data toko</h1>
              <p>Isi informasi yang akan tampil di halaman toko.</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Store size={13} />Nama Toko</label>
              <input className={styles.input} placeholder="cth: Butik Hana, Dapur Nusantara" value={namaToko} onChange={e => setNamaToko(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Globe size={13} />URL Toko</label>
              <div className={styles.inputWrapper}>
                <span className={styles.prefix}>https://</span>
                <input className={`${styles.input} ${styles.inputWithPrefix}`} value={slug} onChange={e => setSlug(generateSlug(e.target.value))} />
              </div>
              <p className={styles.hint}>{storefrontHost}</p>
              {slugStatus !== 'idle' && (
                <p className={`${styles.slugStatus} ${styles[slugStatus]}`}>
                  {slugStatus === 'checking' && <><Loader2 size={12} /> Mengecek URL...</>}
                  {slugStatus === 'available' && <><CheckCircle size={12} /> URL tersedia</>}
                  {slugStatus === 'taken' && <><XCircle size={12} /> URL sudah dipakai</>}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Kategori Usaha</label>
              <input
                className={styles.input}
                list="business-category-options"
                placeholder="Pilih atau tulis sendiri, contoh: Frozen Food"
                value={kategoriUsaha}
                onChange={e => setKategoriUsaha(e.target.value)}
              />
              <datalist id="business-category-options">
                {BUSINESS_CATEGORY_OPTIONS.map(option => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <p className={styles.hint}>Dipakai untuk pengelompokan toko dan SEO agar toko lebih mudah dikenali mesin pencari.</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Deskripsi singkat (opsional)</label>
              <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Contoh: Kue rumahan pre-order dari Bandung." value={deskripsi} onChange={e => setDeskripsi(e.target.value)} maxLength={200} />
              <span className={styles.charCount}>{deskripsi.length}/200</span>
            </div>
            <div className={styles.formRow}>
              <div>
                <label className={styles.label}><Phone size={13} />Nomor WhatsApp</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.prefix}>+62</span>
                  <input className={`${styles.input} ${styles.inputWithPrefix}`} placeholder="81234567890" value={noWa} onChange={e => setNoWa(e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>
              <div style={{ flex: 1 }} />
            </div>

            <div className={styles.header} style={{ marginTop: '20px', textAlign: 'left', alignItems: 'flex-start' }}>
              <div className={styles.headerIcon} style={{ width: '32px', height: '32px' }}><MapPin size={16} /></div>
              <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Alamat toko</h2>
              <p style={{ fontSize: '12px' }}>Dipakai untuk info toko dan pengiriman.</p>
            </div>

            <div className={styles.formRow}>
              <div>
                <RegionCombobox
                  label="Provinsi"
                  placeholder="Ketik min. 2 huruf, contoh: su"
                  value={selectedProvince}
                  options={provinces}
                  onSelect={(province) => {
                    setSelectedProvince(province)
                    setSelectedRegency({ code: '', name: '' })
                    setSelectedDistrict({ code: '', name: '' })
                    setSelectedVillage({ code: '', name: '', postal_code: '' })
                  }}
                  onManual={(name) => {
                    setSelectedProvince({ code: 'manual', name })
                    setSelectedRegency({ code: '', name: '' })
                    setSelectedDistrict({ code: '', name: '' })
                    setSelectedVillage({ code: '', name: '', postal_code: '' })
                  }}
                />
              </div>
              <div>
                <RegionCombobox
                  label="Kota / Kabupaten"
                  placeholder="Ketik kota/kabupaten..."
                  disabled={!selectedProvince.name}
                  value={selectedRegency}
                  options={regencies}
                  onSelect={(regency) => {
                    setSelectedRegency(regency)
                    setSelectedDistrict({ code: '', name: '' })
                    setSelectedVillage({ code: '', name: '', postal_code: '' })
                  }}
                  onManual={(name) => {
                    setSelectedRegency({ code: 'manual', name })
                    setSelectedDistrict({ code: '', name: '' })
                    setSelectedVillage({ code: '', name: '', postal_code: '' })
                  }}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div>
                <RegionCombobox
                  label="Kecamatan"
                  placeholder="Ketik kecamatan..."
                  disabled={!selectedRegency.name}
                  value={selectedDistrict}
                  options={districts}
                  onSelect={(district) => {
                    setSelectedDistrict(district)
                    setSelectedVillage({ code: '', name: '', postal_code: '' })
                  }}
                  onManual={(name) => {
                    setSelectedDistrict({ code: 'manual', name })
                    setSelectedVillage({ code: '', name: '', postal_code: '' })
                  }}
                />
              </div>
              <div>
                <RegionCombobox
                  label="Desa / Kelurahan"
                  placeholder="Ketik desa/kelurahan..."
                  disabled={!selectedDistrict.name}
                  value={selectedVillage}
                  options={villages}
                  onSelect={(village) => setSelectedVillage({
                    code: village.code,
                    name: village.name,
                    postal_code: village.postal_code || '',
                  })}
                  onManual={(name) => setSelectedVillage({ code: 'manual', name, postal_code: '' })}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Alamat lengkap</label>
              <textarea 
                className={`${styles.input} ${styles.textarea}`} 
                placeholder="Nama jalan, nomor, RT/RW, patokan singkat"
                value={alamatDetail} 
                onChange={e => setAlamatDetail(e.target.value)} 
              />
            </div>

            <div className={styles.formRow}>
              <div>
                <label className={styles.label}>Patokan / Catatan (opsional)</label>
                <input className={styles.input} placeholder="cth: Samping Masjid Al-Ikhlas" value={locationNotes} onChange={e => setLocationNotes(e.target.value)} />
              </div>
              <div>
                <label className={styles.label}>Google Maps URL (opsional)</label>
                <input className={styles.input} placeholder="https://goo.gl/maps/..." value={mapUrl} onChange={e => setMapUrl(e.target.value)} />
              </div>
            </div>

            <div className={styles.footer}>
              <button 
                className={styles.btnPrimary} 
                disabled={
                  !namaToko || 
                  !slug || 
                  slugStatus !== 'available' || 
                  !noWa ||
                  !kategoriUsaha.trim() ||
                  !selectedProvince.name || 
                  !selectedRegency.name ||
                  !alamatDetail
                } 
                onClick={() => setStep(2)}
              >
                Lanjut <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className={styles.card} style={{ maxWidth: '620px' }}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.header}>
              <div className={styles.headerIcon}><Layout size={22} /></div>
              <h1>Pilih template</h1>
              <p>Pilih gaya awal. Setelah toko dibuat, tampilannya masih bisa diedit.</p>
            </div>
            <div className={styles.templateGrid}>
              {TEMPLATES.map(tpl => (
                <div key={tpl.id} className={`${styles.templateCard} ${template === tpl.id ? styles.templateActive : ''}`} onClick={() => setTemplate(tpl.id)}>
                  <div className={styles.templateCheck}><Check size={12} color="#fff" /></div>
                  <img src={tpl.preview_image} alt={tpl.nama} className={styles.templatePreviewImg} onError={e => { (e.currentTarget as HTMLImageElement).style.display='none' }} />
                  <div className={styles.templateInfo}>
                    <div className={styles.templateName}>{tpl.nama}</div>
                    <div className={styles.templateKat}>{tpl.kategori}</div>
                    <a href={tpl.demo_url} target="_blank" rel="noopener noreferrer" className={styles.templateDemoLink} onClick={e => e.stopPropagation()}>
                      Lihat Demo <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className={`${styles.footer} ${styles.footerBetween}`}>
              <button className={styles.btnGhost} onClick={() => setStep(1)}><ArrowLeft size={16} /> Kembali</button>
              <button className={styles.btnPrimary} onClick={() => setStep(3)}>Lanjut <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className={styles.card} style={{ maxWidth: '560px' }}>
            <div className={styles.header}>
              <div className={styles.headerIcon}><Globe size={22} /></div>
              <h1>Kustomisasi tampilan</h1>
              <p>Pilih warna dan gambar awal. Semua masih bisa diubah setelah toko jadi.</p>
            </div>

            <div className={styles.customizeTabs}>
              {(['tampilan', 'teks'] as const).map(tab => (
                <button key={tab} className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab === 'tampilan' ? 'Tampilan' : 'Teks Hero'}
                </button>
              ))}
            </div>

            <div className={styles.customizeBody}>
              {activeTab === 'tampilan' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Gambar utama</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input className={styles.input} style={{ flex: 1 }} placeholder="https://... (URL gambar)" value={heroImageUrl} onChange={e => setHeroImageUrl(e.target.value)} />
                      <label className={styles.btnGhost} style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PlusCircle size={14} /> Upload
                        <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleHeroUpload} />
                      </label>
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>Gunakan foto produk, toko, atau suasana usaha.</p>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Warna utama</label>
                    <div className={styles.colorGrid}>
                      {WARNA_PRESETS.map(c => (
                        <div key={c.hex} className={`${styles.colorChip} ${warnaTema === c.hex ? styles.colorChipActive : ''}`}
                          style={{ backgroundColor: c.hex, borderColor: warnaTema === c.hex ? '#0f172a' : 'transparent' }}
                          onClick={() => setWarnaTema(c.hex)} title={c.label} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                      <input type="color" value={warnaTema} onChange={e => setWarnaTema(e.target.value)} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Custom: {warnaTema}</span>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'teks' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Judul utama</label>
                    <input className={styles.input} placeholder={namaToko || 'Nama toko (default)'} value={heroTitle} onChange={e => setHeroTitle(e.target.value)} />
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Teks besar di bagian atas toko.</p>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Kalimat pendukung</label>
                    <textarea className={`${styles.input} ${styles.textarea}`} placeholder={deskripsi || 'Deskripsi toko (default)'} value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} />
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Kalimat pendek yang mendeskripsikan tokomu.</p>
                  </div>
                </>
              )}
            </div>

            <div className={`${styles.footer} ${styles.footerBetween}`}>
              <button className={styles.btnGhost} onClick={() => setStep(2)}><ArrowLeft size={16} /> Kembali</button>
              <button className={styles.btnPrimary} onClick={() => setStep(4)}>Lanjut ke Preview <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* STEP 4 - Full Preview + Publish */}
        {step === 4 && (
          <div className={styles.fullPreviewWrap}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.publishBar}>
              <button className={styles.btnGhost} onClick={() => setStep(3)}><ArrowLeft size={16} /> Edit</button>
              <span className={styles.publishUrl}>{storefrontHost}</span>
              <button className={styles.btnPublish} disabled={isLoading} onClick={handleSubmit}>
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Terbitkan toko</>}
              </button>
            </div>
            <div className={styles.previewBrowser}>
              <div className={styles.previewBrowserBar}>
                <div className={styles.browserDot} style={{ background: '#f87171' }} />
                <div className={styles.browserDot} style={{ background: '#fbbf24' }} />
                <div className={styles.browserDot} style={{ background: '#4ade80' }} />
                <div className={styles.previewBrowserUrl}>{storefrontHost}</div>
              </div>
              <div className={styles.previewBrowserContent}>
                <TemplatePreview
                  template={template}
                  namaToko={heroTitle || namaToko}
                  slug={slug}
                  deskripsi={heroSubtitle || deskripsi}
                  warnaTema={warnaTema}
                  heroImageUrl={heroImageUrl}
                  fontHeading={fontHeading}
                  heroTitle={heroTitle}
                  heroSubtitle={heroSubtitle}
                  draftProducts={draftProducts}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {cropImageSrc && (
        <ImageCropperModal
          src={cropImageSrc}
          aspectRatio={16 / 9} // Hero banner aspect ratio
          cropShape="rect"
          onClose={() => setCropImageSrc(null)}
          onCrop={handleCropComplete}
          title="Sesuaikan Foto Utama Toko"
        />
      )}
    </div>
  )
}
