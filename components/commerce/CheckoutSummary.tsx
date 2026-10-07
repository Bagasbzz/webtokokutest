'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useCartStore } from '@/store/useCartStore'
import { formatRupiah } from '@/lib/checkout-formatter'
import { ShoppingBag, Search, Truck, Check, Upload, ChevronLeft, Loader2 } from 'lucide-react'
import { useStoreData } from './StoreContext'

type CheckoutStep = 'cart' | 'address' | 'shipping' | 'payment' | 'success'
type RegionOption = { code: string; name: string }

export function CheckoutSummary() {
  const { items, orderNote, setOrderNote, getCartTotal, clearCart } = useCartStore()
  const store = useStoreData()
  
  const isDemoStore = useMemo(() => {
    if (typeof window === 'undefined') return false
    const isDemoSlug = ['glow', 'dapur', 'butik', 'luxe', 'herba', 'demo', 'default'].includes(store.slug?.toLowerCase())
    const isEditor = window.location.pathname.includes('/dashboard/editor') || window.location.pathname.includes('/preview')
    return isDemoSlug || isEditor
  }, [store.slug])
  
  const [step, setStep] = useState<CheckoutStep>('cart')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [customerData, setCustomerData] = useState({
    name: '',
    whatsapp: '',
    address: '',
    provinceName: '',
    regencyName: '',
    districtName: '',
    villageName: '',
  })

  const [provinces, setProvinces] = useState<RegionOption[]>([])
  const [regencies, setRegencies] = useState<RegionOption[]>([])
  const [districts, setDistricts] = useState<RegionOption[]>([])
  const [villages, setVillages] = useState<RegionOption[]>([])
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedRegencyCode, setSelectedRegencyCode] = useState('')
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('')
  const [selectedVillageCode, setSelectedVillageCode] = useState('')
  
  // Shipping states
  const [destinationSearch, setDestinationSearch] = useState('')
  const [destinationResults, setDestinationResults] = useState<any[]>([])
  const [selectedDestination, setSelectedDestination] = useState<any>(null)
  const [isSearchingLocation, setIsSearchingLocation] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShipping, setSelectedShipping] = useState<any>(null)
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)

  // Payment states
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const [orderCode, setOrderCode] = useState<string | null>(null)
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null)

  const cartTotal = getCartTotal()
  const paymentMethods = useMemo(() => store.paymentMethods || [], [store.paymentMethods])
  const qris = paymentMethods.find((m: any) => m.type === 'qris')
  const availablePaymentMethods = useMemo(
    () => buildPaymentOptions(paymentMethods, Boolean(store.shippingSettings?.cod_enabled)),
    [paymentMethods, store.shippingSettings?.cod_enabled],
  )
  const [selectedPaymentId, setSelectedPaymentId] = useState('')
  const selectedPayment = availablePaymentMethods.find(method => method.id === selectedPaymentId) || availablePaymentMethods[0]
  const needsPaymentProof = selectedPayment && !['pickup', 'cod', 'manual_whatsapp'].includes(selectedPayment.type)
  const [skipAutoShipping, setSkipAutoShipping] = useState(false)
  const hasAutoShipping = Boolean(
    store.featureFlags?.['auto_shipping'] &&
    store.shippingSettings?.auto_shipping_enabled
  )
  const autoShippingActive = hasAutoShipping && !skipAutoShipping
  const freeShippingMinimum = Number(store.shippingSettings?.free_shipping_minimum || 0)
  const getsFreeShipping = freeShippingMinimum > 0 && cartTotal >= freeShippingMinimum

  useEffect(() => {
    if (!selectedPaymentId && availablePaymentMethods[0]) {
      setSelectedPaymentId(availablePaymentMethods[0].id)
    }
  }, [availablePaymentMethods, selectedPaymentId])

  useEffect(() => {
    fetch('/api/regions/provinces')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setProvinces(Array.isArray(data) ? data : []))
      .catch(() => setProvinces([]))
  }, [])

  useEffect(() => {
    if (!selectedProvinceCode) {
      setRegencies([])
      return
    }
    fetch(`/api/regions/regencies?province_code=${encodeURIComponent(selectedProvinceCode)}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setRegencies(Array.isArray(data) ? data : []))
      .catch(() => setRegencies([]))
  }, [selectedProvinceCode])

  useEffect(() => {
    if (!selectedRegencyCode) {
      setDistricts([])
      return
    }
    fetch(`/api/regions/districts?regency_code=${encodeURIComponent(selectedRegencyCode)}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setDistricts(Array.isArray(data) ? data : []))
      .catch(() => setDistricts([]))
  }, [selectedRegencyCode])

  useEffect(() => {
    if (!selectedDistrictCode) {
      setVillages([])
      return
    }
    fetch(`/api/regions/villages?district_code=${encodeURIComponent(selectedDistrictCode)}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setVillages(Array.isArray(data) ? data : []))
      .catch(() => setVillages([]))
  }, [selectedDistrictCode])

  const handleNext = async () => {
    setError(null)
    if (step === 'cart') setStep('address')
    else if (step === 'address') {
      if (!customerData.name || !customerData.whatsapp || !customerData.address || !customerData.provinceName || !customerData.regencyName || !customerData.districtName) {
        setError('Mohon lengkapi nama, WhatsApp, alamat, provinsi, kota, dan kecamatan.')
        return
      }
      if (autoShippingActive) {
        if (!selectedDestination) {
          setError('Mohon cari dan pilih area ongkir RajaOngkir, atau centang \'Lewati cek ongkir otomatis\'.')
          return
        }
        await calculateShipping()
      } else {
        setStep('payment')
      }
    }
    else if (step === 'shipping') setStep('payment')
    else if (step === 'payment') {
      await submitOrder()
    }
  }

  const calculateShipping = async () => {
    setIsLoadingShipping(true)
    try {
      const totalWeight = items.reduce((sum, item) => sum + ((item.weightGram || 200) * item.quantity), 0)
      const res = await fetch('/api/shipping/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.id,
          destination_id: selectedDestination.id,
          total_weight: totalWeight
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.shipping_note || data?.error || 'Gagal menghitung ongkir.')
      }
      
      const costs = data.data || data.results || []
      const options: any[] = []
      costs.forEach((courier: any) => {
        if (courier.service && courier.cost) {
          options.push({
            courier: courier.code || courier.name || 'KURIR',
            service: courier.service || 'REG',
            description: courier.description || '',
              cost: getsFreeShipping ? 0 : courier.cost || 0,
              originalCost: courier.cost || 0,
            etd: courier.etd || '-'
          })
          return
        }
        (courier.costs || courier.services || []).forEach((cost: any) => {
          options.push({
            courier: courier.code || courier.name || 'KURIR',
            service: cost.service || cost.name || 'REG',
            description: cost.description || '',
            cost: getsFreeShipping ? 0 : cost.cost?.[0]?.value || cost.price || cost.cost || 0,
            originalCost: cost.cost?.[0]?.value || cost.price || cost.cost || 0,
            etd: cost.cost?.[0]?.etd || cost.etd || cost.estimation || '-'
          })
        })
      })
      if (options.length === 0) {
        throw new Error('Tidak ada pilihan kurir RajaOngkir yang tersedia untuk area ini. Ongkir akan dikonfirmasi manual via WhatsApp.')
      }
      setShippingOptions(options)
      setSelectedShipping(options[0])
      setStep('shipping')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Gagal menghitung ongkir. Anda bisa lanjut dan ongkir akan dikonfirmasi via WA.')
      setSelectedShipping(null)
      setStep('payment')
    } finally {
      setIsLoadingShipping(false)
    }
  }

  const searchDestination = async () => {
    if (destinationSearch.length < 3) return
    setIsSearchingLocation(true)
    setError(null)
    try {
      const res = await fetch(`/api/shipping/search?q=${encodeURIComponent(destinationSearch)}`)
      if (!res.ok) {
        throw new Error('Gagal memuat area pengiriman karena masalah server. Silakan centang opsi "Lewati cek ongkir otomatis" di bawah untuk melanjutkan.')
      }
      const data = await res.json()
      if (data.error) {
        throw new Error(data.error)
      }
      const items = data.data || data.results || []
      if (items.length === 0) {
        setError('Kecamatan/kota tidak ditemukan. Ketik nama kecamatan dengan benar atau centang "Lewati cek ongkir otomatis".')
      }
      const results = items.map((r: any) => ({
        id: r.code || r.subdistrict_id || r.id,
        name: r.name || r.subdistrict_name,
        full_name: r.label || r.full_name || `${r.name}, ${r.district}, ${r.city}`
      }))
      setDestinationResults(results)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Pencarian lokasi gagal karena gangguan koneksi. Silakan centang "Lewati cek ongkir otomatis" untuk melanjutkan checkout.')
    } finally {
      setIsSearchingLocation(false)
    }
  }

  const fullAddress = useMemo(() => {
    return [
      customerData.address,
      customerData.villageName,
      customerData.districtName,
      customerData.regencyName,
      customerData.provinceName,
    ].filter(Boolean).join(', ')
  }, [customerData])

  const submitOrder = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.id,
          customer: {
            ...customerData,
            address: fullAddress,
            subdistrict_id: selectedDestination?.id
          },
          cart: items.map(i => ({
            id: i.productId,
            nama: formatCartItemName(i),
            harga: i.price,
            quantity: i.quantity,
            berat_gram: i.weightGram || 200,
            variant_id: i.variant?.id || null,
            addon_ids: i.addons?.map(addon => addon.id) || [],
            addon_selections: i.addons?.map(addon => ({
              id: addon.id,
              quantity: addon.quantity || 1,
            })) || [],
          })),
          shipping: selectedShipping,
          bukti_url: null,
          payment_method: selectedPayment?.type || 'manual_whatsapp'
        })
      })
      
      const data = await res.json()
      if (data.order_code) {
        let buktiUrl = null
        if (paymentProof) {
          const formData = new FormData()
          formData.append('file', paymentProof)
          formData.append('store_id', store.id)
          formData.append('order_code', data.order_code)
          formData.append('customer_whatsapp', customerData.whatsapp)
          const uploadRes = await fetch('/api/upload/payment-proof', {
            method: 'POST',
            body: formData
          })

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json()
            buktiUrl = uploadData.url
          } else {
            const uploadData = await uploadRes.json().catch(() => null)
            setError(uploadData?.error || 'Order dibuat, tapi bukti pembayaran gagal diupload.')
          }
        }

        setOrderCode(data.order_code)
        // WhatsApp Redirect
        const totalFinal = data.total || cartTotal + (selectedShipping?.cost || 0)
        const shippingFinal = Math.max(totalFinal - cartTotal, 0)
        const proofUrlForMessage = buktiUrl && /^https?:\/\//.test(buktiUrl) ? buktiUrl : ''
        const paymentStatus = buktiUrl ? 'Bukti bayar sudah diupload, mohon dicek di dashboard' : 'Belum ada bukti bayar di sistem'
        const shippingLabel = selectedShipping
          ? `${selectedShipping.courier} ${selectedShipping.service}${selectedShipping.etd ? `, estimasi ${selectedShipping.etd} hari` : ''}${getsFreeShipping ? ', gratis ongkir' : ''}`
          : 'Ongkir dikonfirmasi seller lewat WhatsApp'
        const pickupCode = selectedPayment?.type === 'pickup'
          ? `${selectedPayment.method.account_number || 'PICKUP'}-${data.order_code}`
          : null
        const waMsg = `Halo ${store.nama_toko}, saya mau konfirmasi pesanan.\n\n` +
          `Kode order: ${data.order_code}\n` +
          `Tanggal: ${new Date().toLocaleString('id-ID')}\n` +
          (pickupCode ? `Kode ambil: ${pickupCode}\n` : '') +
          `Status pesanan: Menunggu konfirmasi seller\n` +
          `Status pembayaran: ${paymentStatus}\n\n` +
          `Produk:\n${items.map(i => `- ${formatCartItemName(i)} x${i.quantity} = ${formatRupiah(i.price * i.quantity)}`).join('\n')}\n\n` +
          `Subtotal: ${formatRupiah(cartTotal)}\n` +
          `Ongkir: ${formatRupiah(shippingFinal)} (${shippingLabel})\n` +
          `Total: ${formatRupiah(totalFinal)}\n\n` +
          `Metode bayar:\n${formatPaymentForWhatsApp(selectedPayment)}\n\n` +
          `Instruksi: jika sudah transfer atau bayar QRIS, saya akan kirim ulang bukti bayar di chat ini.\n\n` +
          `Data pembeli:\n` +
          `Nama: ${customerData.name}\n` +
          `WA: ${customerData.whatsapp}\n` +
          `Alamat: ${fullAddress}` +
          (orderNote ? `\nCatatan: ${orderNote}` : '') +
          (proofUrlForMessage ? `\n\nBukti bayar: ${proofUrlForMessage}` : '')
        
        setWhatsAppUrl(`https://wa.me/${normalizeWaNumber(store.wa_nomor)}?text=${encodeURIComponent(waMsg)}`)
        clearCart()
        setStep('success')
      }
    } catch (err) {
      console.error(err)
      setError('Gagal mengirim pesanan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentProof(file)
      const reader = new FileReader()
      reader.onloadend = () => setPaymentProofPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  if (items.length === 0 && step !== 'success') return null

  if (step === 'success') {
    return (
      <div className="p-10 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <Check size={32} />
        </div>
        <h2 className="text-xl font-bold">Pesanan Terkirim!</h2>
        <p className="text-gray-500 text-sm">Kode Order: <span className="font-mono font-bold text-black">{orderCode}</span></p>
        <p className="text-gray-500 text-sm">Pesanan sudah tercatat. Buka WhatsApp untuk mengirim konfirmasi ke seller.</p>
        {whatsAppUrl && (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 px-6 py-3 bg-black text-white rounded-md text-sm font-medium"
          >
            Buka WhatsApp
          </a>
        )}
        <button onClick={() => window.location.reload()} className="mt-2 px-6 py-2 border border-black rounded-md text-sm font-medium">Tutup</button>
      </div>
    )
  }

  return (
    <div className="bg-white border-t border-gray-100 p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
      {step !== 'cart' && (
        <button onClick={() => setStep(
          step === 'address' ? 'cart' : 
          step === 'shipping' ? 'address' : 
          autoShippingActive ? 'shipping' : 'address'
        )} className="flex items-center gap-1 text-xs text-gray-500 hover:text-black">
          <ChevronLeft size={14} /> Kembali
        </button>
      )}

      {step === 'cart' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Catatan Pesanan (Opsional)</label>
            <textarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Cth: Ukuran L ya."
              className="w-full text-sm p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black resize-none min-h-[60px]"
            />
          </div>
          <div className="flex justify-between items-end">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="text-lg font-bold text-gray-900">{formatRupiah(cartTotal)}</span>
          </div>
        </>
      )}

      {step === 'address' && (
        <div className="flex flex-col gap-4">
          <input 
            type="text" placeholder="Nama Lengkap" 
            value={customerData.name} onChange={e => setCustomerData({...customerData, name: e.target.value})}
            className="w-full p-3 border rounded-md text-sm"
          />
          <input 
            type="tel" placeholder="WhatsApp (Cth: 0812...)" 
            value={customerData.whatsapp} onChange={e => setCustomerData({...customerData, whatsapp: e.target.value})}
            className="w-full p-3 border rounded-md text-sm"
          />
          <select
            value={selectedProvinceCode}
            onChange={(e) => {
              const option = provinces.find((item) => item.code === e.target.value)
              setSelectedProvinceCode(e.target.value)
              setSelectedRegencyCode('')
              setSelectedDistrictCode('')
              setSelectedVillageCode('')
              setRegencies([])
              setDistricts([])
              setVillages([])
              setCustomerData({ ...customerData, provinceName: option?.name || '', regencyName: '', districtName: '', villageName: '' })
            }}
            className="w-full p-3 border rounded-md text-sm bg-white"
          >
            <option value="">Pilih provinsi</option>
            {provinces.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
          <select
            value={selectedRegencyCode}
            onChange={(e) => {
              const option = regencies.find((item) => item.code === e.target.value)
              setSelectedRegencyCode(e.target.value)
              setSelectedDistrictCode('')
              setSelectedVillageCode('')
              setDistricts([])
              setVillages([])
              setCustomerData({ ...customerData, regencyName: option?.name || '', districtName: '', villageName: '' })
            }}
            disabled={!selectedProvinceCode}
            className="w-full p-3 border rounded-md text-sm bg-white disabled:bg-gray-50"
          >
            <option value="">Pilih kota/kabupaten</option>
            {regencies.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
          <select
            value={selectedDistrictCode}
            onChange={(e) => {
              const option = districts.find((item) => item.code === e.target.value)
              setSelectedDistrictCode(e.target.value)
              setSelectedVillageCode('')
              setVillages([])
              setCustomerData({ ...customerData, districtName: option?.name || '', villageName: '' })
              if (!destinationSearch && option?.name) setDestinationSearch(option.name)
            }}
            disabled={!selectedRegencyCode}
            className="w-full p-3 border rounded-md text-sm bg-white disabled:bg-gray-50"
          >
            <option value="">Pilih kecamatan</option>
            {districts.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
          <select
            value={selectedVillageCode}
            onChange={(e) => {
              const option = villages.find((item) => item.code === e.target.value)
              setSelectedVillageCode(e.target.value)
              setCustomerData({ ...customerData, villageName: option?.name || '' })
            }}
            disabled={!selectedDistrictCode}
            className="w-full p-3 border rounded-md text-sm bg-white disabled:bg-gray-50"
          >
            <option value="">Pilih kelurahan/desa (opsional)</option>
            {villages.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
          {hasAutoShipping && (
            <label className="flex items-center gap-2 cursor-pointer py-1 select-none">
              <input
                type="checkbox"
                checked={skipAutoShipping}
                onChange={(e) => {
                  setSkipAutoShipping(e.target.checked)
                  if (e.target.checked) {
                    setSelectedDestination(null)
                    setDestinationSearch('')
                  }
                }}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-xs text-gray-600 font-medium">Lewati cek ongkir otomatis (hubungi seller via WA)</span>
            </label>
          )}
          {autoShippingActive ? (
            <>
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="Area ongkir RajaOngkir (Min 3 huruf)" 
                  value={destinationSearch} onChange={e => setDestinationSearch(e.target.value)}
                  className="flex-1 p-3 border rounded-md text-sm"
                />
                <button onClick={searchDestination} disabled={isSearchingLocation} className="p-3 bg-gray-100 rounded-md">
                  {isSearchingLocation ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>
              {destinationResults.length > 0 && (
                <div className="border rounded-md max-h-32 overflow-y-auto">
                  {destinationResults.map(r => (
                    <button key={r.id} onClick={() => { setSelectedDestination(r); setDestinationSearch(r.full_name); setDestinationResults([]) }} className="w-full text-left p-2 text-xs hover:bg-gray-50 border-b">
                      {r.full_name}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
              <Truck size={18} className="text-blue-500" />
              <p className="text-[10px] text-blue-700 font-medium leading-tight">
                {skipAutoShipping 
                  ? 'Cek ongkir otomatis dilewati. Pesanan tetap bisa masuk, ongkir dikonfirmasi lewat WhatsApp.'
                  : 'Ongkir otomatis sedang dinonaktifkan oleh admin atau seller. Pesanan tetap bisa masuk, ongkir dikonfirmasi lewat WhatsApp.'}
              </p>
            </div>
          )}
          <textarea 
            placeholder="Detail alamat: jalan, no rumah, RT/RW, patokan" 
            value={customerData.address} onChange={e => setCustomerData({...customerData, address: e.target.value})}
            className="w-full p-3 border rounded-md text-sm min-h-[80px]"
          />
        </div>
      )}

      {step === 'shipping' && (
        <div className="flex flex-col gap-3">
          {isLoadingShipping ? <div className="text-center py-10 text-sm text-gray-500">Menghitung ongkir...</div> : (
            shippingOptions.map((opt, i) => (
              <label key={i} className={`flex justify-between p-4 border rounded-xl cursor-pointer ${selectedShipping === opt ? 'border-black bg-gray-50' : 'border-gray-100'}`}>
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase">{opt.courier} - {opt.service}</span>
                  <span className="text-xs text-gray-500">Estimasi {opt.etd} hari</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">
                    {opt.originalCost && opt.originalCost > opt.cost ? (
                      <span className="flex flex-col items-end">
                        <span className="text-[11px] font-medium text-gray-400 line-through">{formatRupiah(opt.originalCost)}</span>
                        <span>{formatRupiah(opt.cost)}</span>
                      </span>
                    ) : formatRupiah(opt.cost)}
                  </span>
                  <input type="radio" checked={selectedShipping === opt} onChange={() => setSelectedShipping(opt)} />
                </div>
              </label>
            ))
          )}
        </div>
      )}

      {step === 'payment' && (
        <div className="flex flex-col gap-4 text-center">
          {isDemoStore && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left flex gap-2 items-start">
              <span className="text-amber-500 text-base leading-none">⚠️</span>
              <div>
                <p className="text-xs font-bold text-amber-800">Ini adalah toko demo</p>
                <p className="text-xs text-amber-700 mt-0.5">Pesanan tidak akan diproses. Checkout hanya untuk melihat alur pemesanan.</p>
              </div>
            </div>
          )}
          <p className="text-sm font-bold">Total Pembayaran: {formatRupiah(cartTotal + (selectedShipping?.cost || 0))}</p>

          <div className="flex flex-col gap-2 text-left">
            <p className="text-xs font-bold text-gray-700">Pilih metode bayar</p>
            {availablePaymentMethods.map(method => (
              <label key={method.id} className={`flex gap-3 p-3 border rounded-xl cursor-pointer ${selectedPayment?.id === method.id ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="payment-method"
                  checked={selectedPayment?.id === method.id}
                  onChange={() => setSelectedPaymentId(method.id)}
                  className="mt-1"
                />
                <span className="flex flex-col gap-1">
                  <strong className="text-sm text-gray-900">{method.label}</strong>
                  <span className="text-xs text-gray-500 leading-relaxed">{method.detail}</span>
                </span>
              </label>
            ))}
          </div>

          {selectedPayment?.type === 'qris' && qris ? (
            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-500 mb-3">Scan QRIS untuk membayar:</p>
              <img src={qris.qr_image_url} alt="QRIS" className="mx-auto w-40 rounded-lg shadow-sm" />
              <p className="text-[10px] text-gray-400 mt-2">Dukung semua aplikasi pembayaran QRIS</p>
            </div>
          ) : null}
          
          {needsPaymentProof && (
          <div className="mt-2 text-left">
            <label className="text-xs font-bold text-gray-700 block mb-2">Upload Bukti Bayar</label>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {paymentProofPreview ? (
                <img src={paymentProofPreview} alt="Preview" className="h-20 rounded-md" />
              ) : (
                <>
                  <Upload size={24} className="text-gray-300 mb-2" />
                  <span className="text-xs text-gray-400">Klik untuk upload bukti bayar</span>
                </>
              )}
            </label>
          </div>
          )}
        </div>
      )}

      {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-md">{error}</div>}

      <button
        onClick={handleNext}
        disabled={isSubmitting || isLoadingShipping}
        className="w-full bg-black text-white py-4 rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors mt-2"
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
        {step === 'cart' && 'Lanjut ke Pengiriman'}
        {step === 'address' && (autoShippingActive ? 'Cek Ongkir & Lanjut' : 'Lanjut ke Pembayaran')}
        {step === 'shipping' && 'Pilih Pembayaran'}
        {step === 'payment' && 'Kirim Pesanan ke WhatsApp'}
      </button>
    </div>
  )
}

function formatCartItemName(item: { title: string; variant?: { value?: string }; addons?: Array<{ name: string; quantity?: number }> }) {
  const details = [
    item.variant?.value,
    item.addons && item.addons.length > 0
      ? `Tambahan: ${item.addons.map(addon => `${addon.name}${addon.quantity && addon.quantity > 1 ? ` x${addon.quantity}` : ''}`).join(', ')}`
      : '',
  ].filter(Boolean)

  return details.length > 0 ? `${item.title} (${details.join('; ')})` : item.title
}

function buildPaymentOptions(paymentMethods: any[], codEnabled: boolean) {
  const options = paymentMethods
    .filter(method => method.is_active !== false)
    .map(method => {
      if (method.type === 'qris') {
        return {
          id: method.id || 'qris',
          type: 'qris',
          label: 'QRIS',
          detail: 'Scan kode QR, lalu upload bukti bayar.',
          method,
        }
      }
      if (method.type === 'bank_transfer') {
        return {
          id: method.id || `bank-${method.account_number}`,
          type: 'bank_transfer',
          label: `Transfer ${method.bank_name || 'bank'}`,
          detail: `${method.account_number || '-'} a.n. ${method.account_name || '-'}`,
          method,
        }
      }
      if (method.type === 'ewallet') {
        return {
          id: method.id || `ewallet-${method.account_number}`,
          type: 'ewallet',
          label: method.bank_name || 'E-wallet',
          detail: `${method.account_number || '-'} a.n. ${method.account_name || '-'}`,
          method,
        }
      }
      if (method.type === 'pickup') {
        return {
          id: method.id || 'pickup',
          type: 'pickup',
          label: method.bank_name || 'Ambil di toko',
          detail: method.account_name || 'Ambil pesanan di toko dan tunjukkan kode order.',
          method,
        }
      }
      return null
    })
    .filter(Boolean) as Array<{ id: string; type: string; label: string; detail: string; method: any }>

  if (codEnabled && !options.some(option => option.type === 'cod')) {
    options.push({
      id: 'cod',
      type: 'cod',
      label: 'Bayar di Tempat (COD)',
      detail: 'Pembayaran dilakukan saat pesanan diterima, sesuai kebijakan seller.',
      method: {},
    })
  }

  if (options.length === 0) {
    options.push({
      id: 'manual_whatsapp',
      type: 'manual_whatsapp',
      label: 'Konfirmasi via WhatsApp',
      detail: 'Seller akan mengirim detail pembayaran lewat WhatsApp.',
      method: {},
    })
  }

  return options
}

function formatPaymentForWhatsApp(option: ReturnType<typeof buildPaymentOptions>[number] | undefined) {
  if (!option) return 'Konfirmasi via WhatsApp'

  const method = option.method || {}
  if (option.type === 'qris') return 'QRIS. Bukti bayar terlampir jika sudah diupload.'
  if (option.type === 'bank_transfer') {
    return `Transfer ${method.bank_name || 'bank'}\nNo rek: ${method.account_number || '-'}\nNama: ${method.account_name || '-'}`
  }
  if (option.type === 'ewallet') {
    return `${method.bank_name || 'E-wallet'}\nNomor: ${method.account_number || '-'}\nNama: ${method.account_name || '-'}`
  }
  if (option.type === 'pickup') {
    return `${method.bank_name || 'Ambil di toko'}\nInstruksi: ${method.account_name || 'Tunjukkan kode order saat mengambil pesanan.'}`
  }
  if (option.type === 'cod') return 'Bayar di Tempat (COD). Pembayaran dilakukan saat pesanan diterima.'

  return 'Konfirmasi via WhatsApp'
}

function normalizeWaNumber(value: string | null | undefined) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return digits
}
