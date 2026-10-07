'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getMyStore } from '@/lib/store'
import { 
  Loader2, 
  ChevronRight, 
  Truck, 
  Save,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Package,
  Zap,
  Send,
  Building,
  FastForward
} from 'lucide-react'
import styles from '../page.module.css'

const COURIERS = [
  { id: 'jne', name: 'JNE', icon: <Truck size={24} /> },
  { id: 'jnt', name: 'J&T Express', icon: <Package size={24} /> },
  { id: 'sicepat', name: 'SiCepat', icon: <FastForward size={24} /> },
  { id: 'tiki', name: 'TIKI', icon: <Send size={24} /> },
  { id: 'pos', name: 'POS Indonesia', icon: <Building size={24} /> },
  { id: 'anteraja', name: 'AnterAja', icon: <Zap size={24} /> },
]

export default function PengirimanPage() {
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Settings states
  const [autoShipping, setAutoShipping] = useState(false)
  const [platformAutoShipping, setPlatformAutoShipping] = useState(false)
  const [pickupEnabled, setPickupEnabled] = useState(true)
  const [codEnabled, setCodEnabled] = useState(false)
  const [freeShippingMin, setFreeShippingMin] = useState(0)
  const [allowedCouriers, setAllowedCouriers] = useState<string[]>(['jne', 'jnt', 'sicepat'])

  useEffect(() => {
    async function fetchData() {
      try {
        const storeData = await getMyStore()
        if (storeData) {
          setStore(storeData)
          // Load existing settings
          const supabase = createClient()
          const { data: flag } = await supabase
            .from('feature_flags')
            .select('enabled_globally')
            .eq('key', 'auto_shipping')
            .single()

          setPlatformAutoShipping(Boolean(flag?.enabled_globally))

          const { data: settings } = await supabase
            .from('shipping_settings')
            .select('*')
            .eq('store_id', storeData.id)
            .single()
          
          if (settings) {
            setAutoShipping(Boolean(settings.auto_shipping_enabled))
            setPickupEnabled(settings.pickup_enabled !== false)
            setCodEnabled(settings.cod_enabled || false)
            setFreeShippingMin(settings.free_shipping_minimum || 0)
            if (settings.allowed_couriers) {
              setAllowedCouriers(settings.allowed_couriers)
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

  const toggleCourier = (courierId: string) => {
    setAllowedCouriers(prev => 
      prev.includes(courierId) 
        ? prev.filter(c => c !== courierId)
        : [...prev, courierId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return
    
    setIsSubmitting(true)
    setSuccess(false)
    setError(null)

    try {
      if (allowedCouriers.length === 0 && !pickupEnabled) {
        throw new Error('Pilih minimal 1 kurir atau aktifkan pickup')
      }

      const supabase = createClient()
      
      const { error: upsertError } = await supabase
        .from('shipping_settings')
        .upsert({
          store_id: store.id,
          auto_shipping_enabled: autoShipping,
          pickup_enabled: pickupEnabled,
          cod_enabled: codEnabled,
          allowed_couriers: allowedCouriers,
          free_shipping_minimum: freeShippingMin
        }, {
          onConflict: 'store_id'
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
        <span className={styles.current}>Pengaturan Pengiriman</span>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Pengaturan Pengiriman</h1>
        <p className={styles.subtitle}>Konfigurasi kurir, metode pengiriman, dan promo gratis ongkir.</p>
      </div>

      {success && (
        <div className={styles.alertSuccess}>
          <CheckCircle2 size={18} />
          <span>Pengaturan pengiriman berhasil disimpan!</span>
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
              <div className={styles.cardIcon}><Truck size={18} /></div>
              <h3 className={styles.cardTitle}>Metode Pengiriman</h3>
            </div>
            <div className={styles.cardBody}>
              {/* Toggle Ongkir Otomatis */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '16px',
                background: autoShipping ? '#f0fdf4' : '#f8fafc',
                borderRadius: '12px',
                marginBottom: '20px',
                border: `1px solid ${autoShipping ? '#16a34a' : '#e2e8f0'}`
              }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Ongkir Otomatis (RajaOngkir)</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Hitung ongkir otomatis saat checkout. Jika dimatikan admin, toko memakai konfirmasi WhatsApp.
                  </div>
                  {!platformAutoShipping && (
                    <div style={{ fontSize: '12px', color: '#b45309', marginTop: '6px', fontWeight: 600 }}>
                      Fitur global sedang dimatikan admin platform.
                    </div>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => setAutoShipping(!autoShipping)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {autoShipping ? (
                    <ToggleRight size={40} color="#16a34a" />
                  ) : (
                    <ToggleLeft size={40} color="#94a3b8" />
                  )}
                </button>
              </div>

              {/* Toggle Pickup */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '16px',
                background: pickupEnabled ? '#f0fdf4' : '#f8fafc',
                borderRadius: '12px',
                marginBottom: '20px',
                border: `1px solid ${pickupEnabled ? '#16a34a' : '#e2e8f0'}`
              }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Pickup / Ambil Sendiri</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Customer bisa ambil pesanan di lokasi toko
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setPickupEnabled(!pickupEnabled)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {pickupEnabled ? (
                    <ToggleRight size={40} color="#16a34a" />
                  ) : (
                    <ToggleLeft size={40} color="#94a3b8" />
                  )}
                </button>
              </div>

              {/* Toggle COD */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '16px',
                background: codEnabled ? '#f0fdf4' : '#f8fafc',
                borderRadius: '12px',
                marginBottom: '20px',
                border: `1px solid ${codEnabled ? '#16a34a' : '#e2e8f0'}`
              }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Bayar di Tempat (COD)</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Terima pembayaran saat pengiriman
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setCodEnabled(!codEnabled)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {codEnabled ? (
                    <ToggleRight size={40} color="#16a34a" />
                  ) : (
                    <ToggleLeft size={40} color="#94a3b8" />
                  )}
                </button>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}><Truck size={18} /></div>
              <h3 className={styles.cardTitle}>Kurir Yang Tersedia</h3>
            </div>
            <div className={styles.cardBody}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px'
              }}>
                {COURIERS.map(courier => (
                  <button
                    key={courier.id}
                    type="button"
                    onClick={() => toggleCourier(courier.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${allowedCouriers.includes(courier.id) ? '#16a34a' : '#e2e8f0'}`,
                      background: allowedCouriers.includes(courier.id) ? '#f0fdf4' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ marginBottom: '8px' }}>{courier.icon}</div>
                    <div style={{ 
                      fontWeight: allowedCouriers.includes(courier.id) ? 600 : 400,
                      color: allowedCouriers.includes(courier.id) ? '#16a34a' : '#334155'
                    }}>
                      {courier.name}
                    </div>
                    {allowedCouriers.includes(courier.id) && (
                      <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
                        <CheckCircle2 size={14} style={{ display: 'inline' }} /> Aktif
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Promo Gratis Ongkir</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>Minimum Belanja Gratis Ongkir</label>
                <div className={styles.inputIconWrapper}>
                  <span style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    color: '#64748b',
                    fontSize: '14px'
                  }}>Rp</span>
                  <input 
                    type="text" 
                    value={freeShippingMin.toLocaleString('id-ID')} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      setFreeShippingMin(parseInt(val) || 0)
                    }} 
                    style={{ paddingLeft: '40px' }}
                    placeholder="0"
                  />
                </div>
                <p className={styles.hint}>Customer mendapat gratis ongkir jika total belanja mencapai nominal ini. Kosongkan atau 0 untuk nonaktif.</p>
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
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Save size={18} /> Simpan Pengaturan</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
