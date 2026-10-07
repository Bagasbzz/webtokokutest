'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getMyStore } from '@/lib/store'
import { 
  Loader2, 
  ChevronRight, 
  MapPin, 
  Save,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react'
import styles from '../page.module.css'

interface LocationResult {
  id: string
  name: string
  type: string
  full_name: string
}

export default function AlamatPage() {
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [namaPengirim, setNamaPengirim] = useState('')
  const [noTelp, setNoTelp] = useState('')
  const [alamatLengkap, setAlamatLengkap] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const storeData = await getMyStore()
        if (storeData) {
          setStore(storeData)
          // Load existing address
          const supabase = createClient()
          const { data: address } = await supabase
            .from('store_addresses')
            .select('*')
            .eq('store_id', storeData.id)
            .eq('is_default', true)
            .single()
          
          if (address) {
            setNamaPengirim(address.nama_pengirim || '')
            setNoTelp(address.no_telp || '')
            setAlamatLengkap(address.alamat_lengkap || '')
            setPostalCode(address.postal_code || '')
            if (address.subdistrict_id) {
              const locationLabel = address.village_name && address.district_name && address.regency_name
                ? `${address.village_name}, ${address.district_name}, ${address.regency_name}`
                : address.district_name || address.label || 'Lokasi tersimpan'
              
              setSelectedLocation({
                id: address.subdistrict_id,
                name: locationLabel,
                type: 'subdistrict',
                full_name: address.alamat_lengkap
              })
              setSearchQuery(locationLabel)
            }
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) return
    
    setIsSearching(true)
    try {
      const res = await fetch(`/api/shipping/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      
      if (data?.data || data?.results) {
        const items = data.data || data.results || []
        const results = items.map((r: any) => ({
          id: r.code || r.subdistrict_id || r.id,
          name: r.name || r.subdistrict_name,
          type: 'subdistrict',
          full_name: r.label || r.full_name || `${r.name || r.subdistrict_name}, ${r.district || r.district_name}, ${r.city || r.city_name}, ${r.province || r.province_name}`
        }))
        setSearchResults(results)
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectLocation = (loc: LocationResult) => {
    setSelectedLocation(loc)
    setSearchQuery(loc.full_name)
    setSearchResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return
    
    setIsSubmitting(true)
    setSuccess(false)
    setError(null)

    try {
      if (!namaPengirim || !noTelp || !alamatLengkap) {
        throw new Error('Nama pengirim, no telepon, dan alamat lengkap wajib diisi')
      }

      const supabase = createClient()
      
      // Upsert address
      const { error: upsertError } = await supabase
        .from('store_addresses')
        .upsert({
          store_id: store.id,
          label: 'Utama',
          nama_pengirim: namaPengirim,
          no_telp: noTelp,
          alamat_lengkap: alamatLengkap,
          subdistrict_id: selectedLocation?.id || null,
          postal_code: postalCode,
          is_default: true
        }, {
          onConflict: 'store_id,label'
        })

      if (upsertError) throw upsertError

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
        <Link href="/dashboard/pengaturan" className={styles.link}>Pengaturan</Link>
        <ChevronRight size={14} />
        <span className={styles.current}>Alamat Toko</span>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Alamat Pengiriman</h1>
        <p className={styles.subtitle}>Atur alamat asal pengiriman untuk kalkulasi ongkir otomatis.</p>
      </div>

      {success && (
        <div className={styles.alertSuccess}>
          <CheckCircle2 size={18} />
          <span>Alamat toko berhasil disimpan!</span>
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
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}><MapPin size={18} /></div>
              <h3 className={styles.cardTitle}>Alamat Asal Pengiriman</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>Nama Pengirim <span className={styles.required}>*</span></label>
                <input 
                  type="text" 
                  value={namaPengirim} 
                  onChange={e => setNamaPengirim(e.target.value)} 
                  required 
                  placeholder="Nama toko atau pengirim"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Nomor Telepon <span className={styles.required}>*</span></label>
                <input 
                  type="tel" 
                  value={noTelp} 
                  onChange={e => setNoTelp(e.target.value.replace(/\D/g, ''))} 
                  required 
                  placeholder="08123456789"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Cari Lokasi (Kecamatan/Kelurahan) <span className={styles.required}>*</span></label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    placeholder="Ketik minimal 3 karakter..."
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={handleSearch}
                    disabled={isSearching || searchQuery.length < 3}
                    className={styles.btnSecondary}
                  >
                    {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    marginTop: '8px',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    {searchResults.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px',
                          border: 'none',
                          borderBottom: '1px solid #f1f5f9',
                          background: selectedLocation?.id === loc.id ? '#f0fdf4' : 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: 500 }}>{loc.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{loc.full_name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Kode Pos</label>
                <input 
                  type="text" 
                  value={postalCode} 
                  onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))} 
                  placeholder="10110"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Alamat Lengkap <span className={styles.required}>*</span></label>
                <textarea 
                  value={alamatLengkap} 
                  onChange={e => setAlamatLengkap(e.target.value)} 
                  placeholder="Jalan, No. Rumah, RT/RW, dll"
                  rows={3}
                  required
                />
              </div>
            </div>
          </section>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.stickyAction}>
            <button 
              type="submit" 
              className={styles.btnPrimary} 
              disabled={isSubmitting}
            >
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Save size={18} /> Simpan Alamat</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
