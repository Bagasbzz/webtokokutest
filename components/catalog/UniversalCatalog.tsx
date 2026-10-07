'use client'

import React, { useState, useEffect } from 'react'
import { ShoppingCart, MessageCircle, X, Plus, Minus, Trash2, ChevronRight, Check, Search, Truck, MapPin, Upload } from 'lucide-react'
import { Product, ShippingOption } from '@/lib/types'

interface CartItem extends Product {
  quantity: number
}

interface UniversalCatalogProps {
  store: any
  products: Product[]
  themeColor?: string
}

export default function UniversalCatalog({ store, products, themeColor = '#16a34a' }: UniversalCatalogProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'shipping' | 'payment' | 'success'>('cart')
  const [customerData, setCustomerData] = useState({
    name: '',
    whatsapp: '',
    address: '',
    note: ''
  })
  
  // Shipping states
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [destinationSearch, setDestinationSearch] = useState('')
  const [destinationResults, setDestinationResults] = useState<any[]>([])
  const [selectedDestination, setSelectedDestination] = useState<any>(null)
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [orderCode, setOrderCode] = useState<string | null>(null)
  
  // Payment states
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const qrisUrl = store.paymentMethods?.find((method: any) => method.type === 'qris')?.qr_image_url || store.qris_url

  const handleCheckout = async () => {
    if (checkoutStep === 'cart') setCheckoutStep('address')
    else if (checkoutStep === 'address') {
      // Cek ongkir otomatis
      await calculateShipping()
    }
    else if (checkoutStep === 'shipping') setCheckoutStep('payment')
    else if (checkoutStep === 'payment') {
      await submitOrder()
    }
  }

  const submitOrder = async () => {
    setIsUploading(true)
    try {
      // 1. Simpan order ke DB via API
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.id,
          customer: {
            name: customerData.name,
            whatsapp: customerData.whatsapp,
            address: customerData.address,
            subdistrict_id: selectedDestination?.id
          },
          cart: cart.map(item => ({
            id: item.id,
            nama: item.nama,
            harga: item.harga,
            quantity: item.quantity,
            berat_gram: item.berat_gram || 200
          })),
          shipping: selectedShipping,
          bukti_url: null
        })
      })
      
      const data = await res.json()
      
      if (data.order_code) {
        // 2. Upload payment proof setelah order valid dibuat
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
          }
        }

        setOrderCode(data.order_code)
        
        // 3. Auto redirect ke WhatsApp dengan format lengkap
        const totalFinal = data.total || cartTotal + (selectedShipping?.cost || 0)
        const shippingFinal = Math.max(totalFinal - cartTotal, 0)
        const waMessage = encodeURIComponent(
          `Halo ${store.nama_toko}, saya mau konfirmasi pesanan.\n\n` +
          `Kode Order: ${data.order_code}\n` +
          `Tanggal: ${new Date().toLocaleString('id-ID')}\n` +
          `Status Pesanan: Menunggu konfirmasi seller\n` +
          `Status Pembayaran: ${buktiUrl ? 'Bukti bayar sudah diupload, mohon dicek' : 'Belum ada bukti bayar di sistem'}\n\n` +
          `Pesanan:\n${cart.map(item => `- ${item.nama} x${item.quantity} = Rp ${(item.harga * item.quantity).toLocaleString('id-ID')}`).join('\n')}\n\n` +
          `Subtotal: Rp ${cartTotal.toLocaleString('id-ID')}\n` +
          `Ongkir: Rp ${shippingFinal.toLocaleString('id-ID')}${selectedShipping ? ` (${selectedShipping.courier} ${selectedShipping.service})` : ' (dikonfirmasi seller lewat WhatsApp)'}\n` +
          `*Total: Rp ${totalFinal.toLocaleString('id-ID')}*\n\n` +
          `Instruksi: kalau sudah transfer atau bayar QRIS, saya akan kirim ulang bukti bayar di chat ini.\n\n` +
          `Data Pembeli:\n` +
          `Nama: ${customerData.name}\n` +
          `WA: ${customerData.whatsapp}\n` +
          `Alamat: ${customerData.address}\n` +
          (customerData.note ? `Catatan: ${customerData.note}\n` : '') +
          (buktiUrl ? `\nBukti Bayar: ${buktiUrl}` : '')
        )
        
        setCart([])
        localStorage.removeItem(`cart_${store.id}`)
        window.location.assign(`https://wa.me/${normalizeWaNumber(store.no_wa)}?text=${waMessage}`)
      }
    } catch (err) {
      console.error('Order submission error:', err)
      // Fallback: tetap kirim ke WA tanpa order code
      const waMessage = encodeURIComponent(
        `Halo ${store.nama_toko},\n\n` +
        `Saya ingin memesan:\n${cart.map(item => `- ${item.nama} (x${item.quantity})`).join('\n')}\n\n` +
        `Total: Rp ${cartTotal.toLocaleString('id-ID')}\n\n` +
        `Data Pembeli:\n` +
        `Nama: ${customerData.name}\n` +
        `WA: ${customerData.whatsapp}\n` +
        `Alamat: ${customerData.address}`
      )
      window.location.assign(`https://wa.me/${normalizeWaNumber(store.no_wa)}?text=${waMessage}`)
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentProof(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const calculateShipping = async () => {
    if (!selectedDestination) {
      setCheckoutStep('payment')
      return
    }
    
    setIsLoadingShipping(true)
    setShippingError(null)
    
    const totalWeight = cart.reduce((sum, item) => sum + ((item.berat_gram || 200) * item.quantity), 0)
    
    try {
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
      
      if (data?.data || data?.results) {
        const costs = data.data || data.results || []
        const options: ShippingOption[] = []
        costs.forEach((courier: any) => {
          (courier.costs || courier.services || []).forEach((cost: any) => {
            options.push({
              courier: courier.code || courier.name || 'KURIR',
              service: cost.service || cost.name || 'REG',
              description: cost.description || '',
              cost: cost.cost?.[0]?.value || cost.price || cost.cost || 0,
              etd: cost.cost?.[0]?.etd || cost.etd || cost.estimation || '-'
            })
          })
        })
        setShippingOptions(options)
        if (options.length > 0) {
          setSelectedShipping(options[0])
        }
        setCheckoutStep('shipping')
      } else {
        setShippingError('Cek ongkir otomatis tidak tersedia. Lanjutkan tanpa ongkir.')
        setCheckoutStep('payment')
      }
    } catch (err) {
      console.error('Shipping calculation error:', err)
      setShippingError('Cek ongkir otomatis tidak tersedia. Seller akan konfirmasi ongkir via WhatsApp.')
      setCheckoutStep('payment')
    } finally {
      setIsLoadingShipping(false)
    }
  }

  const searchDestination = async () => {
    if (!destinationSearch || destinationSearch.length < 3) return
    
    try {
      const res = await fetch(`/api/shipping/search?q=${encodeURIComponent(destinationSearch)}`)
      const data = await res.json()
      
      if (data?.data || data?.results) {
        const items = data.data || data.results || []
        const results = items.map((r: any) => ({
          id: r.code || r.subdistrict_id || r.id,
          name: r.name || r.subdistrict_name,
          full_name: r.label || r.full_name || `${r.name || r.subdistrict_name}, ${r.district || r.district_name}, ${r.city || r.city_name}, ${r.province || r.province_name}`
        }))
        setDestinationResults(results)
      }
    } catch (err) {
      console.error('Destination search error:', err)
    }
  }

  const selectDestination = (dest: any) => {
    setSelectedDestination(dest)
    setDestinationSearch(dest.full_name)
    setDestinationResults([])
  }

  const resetCheckout = () => {
    setCheckoutStep('cart')
    setIsCartOpen(false)
    if (checkoutStep === 'success') {
      setCart([])
      localStorage.removeItem(`cart_${store.id}`)
    }
  }

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${store.id}`)
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [store.id])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem(`cart_${store.id}`, JSON.stringify(cart))
  }, [cart, store.id])

  const categories = ['Semua', ...Array.from(new Set(products.map(p => p.kategori || 'Lainnya')))]
  
  const filteredProducts = activeCategory === 'Semua' 
    ? products 
    : products.filter(p => (p.kategori || 'Lainnya') === activeCategory)

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="universal-catalog">
      {/* Category Tabs */}
      <div className="categories-wrapper">
        <div className="categories-scroll">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              style={{
                backgroundColor: activeCategory === cat ? themeColor : 'transparent',
                color: activeCategory === cat ? '#fff' : 'inherit',
                borderColor: activeCategory === cat ? themeColor : '#e2e8f0'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="catalog-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-img">
              <img src={product.foto_url || '/template-previews/butik-desktop.jpg'} alt={product.nama} />
              {product.kategori && <span className="product-badge">{product.kategori}</span>}
            </div>
            <div className="product-info">
              <h3>{product.nama}</h3>
              <p className="product-price">Rp {product.harga.toLocaleString('id-ID')}</p>
              <button 
                className="btn-add" 
                onClick={() => addToCart(product)}
                style={{ backgroundColor: themeColor }}
              >
                <Plus size={18} /> Tambah ke Pesanan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Cart Bar */}
      {cartCount > 0 && (
        <div className="sticky-cart-bar" onClick={() => setIsCartOpen(true)}>
          <div className="cart-bar-inner" style={{ backgroundColor: themeColor }}>
            <div className="cart-bar-left">
              <div className="cart-icon-wrapper">
                <ShoppingCart size={20} />
                <span className="cart-badge">{cartCount}</span>
              </div>
              <div className="cart-summary">
                <span className="cart-label">Ringkasan Pesanan</span>
                <span className="cart-price">Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div className="cart-bar-right">
              Checkout <ChevronRight size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal Overlay */}
      {isCartOpen && (
        <div className="cart-modal-overlay" onClick={resetCheckout}>
          <div className="cart-modal" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <div className="header-left">
                {checkoutStep !== 'cart' && checkoutStep !== 'success' && (
                  <button className="btn-back" onClick={() => {
                    if (checkoutStep === 'payment') setCheckoutStep('shipping')
                    else if (checkoutStep === 'shipping') setCheckoutStep('address')
                    else setCheckoutStep('cart')
                  }}>
                    <Minus size={20} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                )}
                <h2>
                  {checkoutStep === 'cart' && 'Pesanan Saya'}
                  {checkoutStep === 'address' && 'Data Pengiriman'}
                  {checkoutStep === 'shipping' && 'Pilih Kurir'}
                  {checkoutStep === 'payment' && 'Konfirmasi Pembayaran'}
                  {checkoutStep === 'success' && 'Pesanan Terkirim'}
                </h2>
              </div>
              <button className="btn-close" onClick={resetCheckout}><X size={24} /></button>
            </div>

            <div className="cart-items">
              {checkoutStep === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="empty-cart">
                      <ShoppingCart size={48} className="empty-icon" />
                      <p>Keranjang masih kosong</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="cart-item">
                        <img src={item.foto_url || ''} alt={item.nama} className="item-img" />
                        <div className="item-info">
                          <h3>{item.nama}</h3>
                          <p>Rp {item.harga.toLocaleString('id-ID')}</p>
                          <div className="item-controls">
                            <div className="qty-picker">
                              <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                            </div>
                            <button className="btn-remove" onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {checkoutStep === 'address' && (
                <div className="checkout-form">
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={customerData.name}
                      onChange={e => setCustomerData({...customerData, name: e.target.value})}
                      placeholder="Masukkan nama Anda"
                    />
                  </div>
                  <div className="form-group">
                    <label>Nomor WhatsApp</label>
                    <input 
                      type="tel" 
                      value={customerData.whatsapp}
                      onChange={e => setCustomerData({...customerData, whatsapp: e.target.value})}
                      placeholder="Contoh: 08123456789"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cari Lokasi (Kecamatan/Kelurahan)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={destinationSearch}
                        onChange={e => setDestinationSearch(e.target.value)}
                        placeholder="Ketik minimal 3 karakter..."
                        style={{ flex: 1 }}
                      />
                      <button 
                        type="button" 
                        onClick={searchDestination}
                        disabled={destinationSearch.length < 3}
                        style={{ padding: '8px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Search size={16} />
                      </button>
                    </div>
                    {destinationResults.length > 0 && (
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '8px', maxHeight: '150px', overflow: 'auto' }}>
                        {destinationResults.map((dest) => (
                          <button
                            key={dest.id}
                            type="button"
                            onClick={() => selectDestination(dest)}
                            style={{ width: '100%', textAlign: 'left', padding: '10px', border: 'none', borderBottom: '1px solid #f1f5f9', background: selectedDestination?.id === dest.id ? '#f0fdf4' : 'white', cursor: 'pointer' }}
                          >
                            <div style={{ fontSize: '14px', fontWeight: 500 }}>{dest.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{dest.full_name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    <small style={{color:'#64748b',fontSize:'12px',marginTop:'4px',display:'block'}}>
                      Opsional - untuk cek ongkir otomatis
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Alamat Lengkap</label>
                    <textarea 
                      value={customerData.address}
                      onChange={e => setCustomerData({...customerData, address: e.target.value})}
                      placeholder="Jalan, No Rumah, RT/RW, Kelurahan, Kecamatan"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Catatan (Opsional)</label>
                    <input 
                      type="text" 
                      value={customerData.note}
                      onChange={e => setCustomerData({...customerData, note: e.target.value})}
                      placeholder="Warna, ukuran, atau instruksi khusus"
                    />
                  </div>
                  {shippingError && (
                    <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
                      {shippingError}
                    </div>
                  )}
                </div>
              )}

              {checkoutStep === 'shipping' && (
                <div className="shipping-step">
                  {isLoadingShipping ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ animation: 'spin 1s linear infinite', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: themeColor, borderRadius: '50%', margin: '0 auto 16px' }}></div>
                      <p>Menghitung ongkir...</p>
                    </div>
                  ) : shippingOptions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <Truck size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                      <p>Tidak ada opsi pengiriman tersedia</p>
                      <p style={{ fontSize: '13px', marginTop: '8px' }}>Lanjutkan ke pembayaran, seller akan konfirmasi ongkir via WhatsApp</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                        Pilih kurir pengiriman:
                      </p>
                      {shippingOptions.map((option) => (
                        <label
                          key={`${option.courier}-${option.service}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '16px',
                            border: `2px solid ${selectedShipping?.courier === option.courier && selectedShipping?.service === option.service ? themeColor : '#e2e8f0'}`,
                            borderRadius: '12px',
                            marginBottom: '12px',
                            cursor: 'pointer',
                            background: selectedShipping?.courier === option.courier && selectedShipping?.service === option.service ? '#f0fdf4' : 'white'
                          }}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShipping?.courier === option.courier && selectedShipping?.service === option.service}
                            onChange={() => setSelectedShipping(option)}
                            style={{ marginRight: '12px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{option.courier} - {option.service}</div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>{option.description} • Estimasi {option.etd} hari</div>
                          </div>
                          <div style={{ fontWeight: 700, color: themeColor }}>
                            Rp {option.cost.toLocaleString('id-ID')}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="payment-step">
                  <div className="payment-summary">
                    <div className="summary-row">
                      <span>Subtotal Pesanan</span>
                      <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                    {selectedShipping && (
                      <div className="summary-row">
                        <span>Ongkir ({selectedShipping.courier.toUpperCase()} {selectedShipping.service})</span>
                        <span>Rp {selectedShipping.cost.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="summary-row total">
                      <span>Total Tagihan</span>
                      <span style={{ color: themeColor }}>Rp {(cartTotal + (selectedShipping?.cost || 0)).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  
                  <div className="payment-methods-info">
                    <p className="info-title">Pembayaran via QRIS</p>
                    
                    {/* QRIS Image */}
                    {qrisUrl ? (
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                          Scan QRIS berikut untuk bayar:
                        </p>
                        <img 
                          src={qrisUrl}
                          alt="QRIS Payment" 
                          style={{ 
                            maxWidth: '200px', 
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0'
                          }}
                        />
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                          Dapat digunakan di GoPay, OVO, DANA, ShopeePay, dll
                        </p>
                      </div>
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '20px', 
                        background: '#f8fafc',
                        borderRadius: '12px',
                        marginBottom: '20px'
                      }}>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>
                          QRIS belum diatur oleh seller.
                        </p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                          Silakan hubungi seller via WhatsApp untuk konfirmasi pembayaran.
                        </p>
                      </div>
                    )}
                    
                    {/* Upload Bukti Pembayaran */}
                    <div style={{ marginTop: '20px' }}>
                      <p className="info-title" style={{ marginBottom: '12px' }}>
                        Upload Bukti Pembayaran
                      </p>
                      <label style={{
                        display: 'block',
                        padding: '16px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '12px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: paymentProofPreview ? '#f0fdf4' : '#f8fafc',
                        transition: 'all 0.2s'
                      }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                        {paymentProofPreview ? (
                          <div>
                            <img 
                              src={paymentProofPreview} 
                              alt="Payment Proof Preview" 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '150px',
                                borderRadius: '8px',
                                marginBottom: '8px'
                              }}
                            />
                            <p style={{ fontSize: '13px', color: themeColor }}>
                              {paymentProof?.name} ✓
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Upload size={32} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                            <p style={{ fontSize: '14px', color: '#64748b' }}>
                              Klik untuk upload screenshot bukti bayar
                            </p>
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                              Format: JPG, PNG (max 5MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="success-step">
                  <div className="success-icon" style={{ backgroundColor: themeColor }}>
                    <Check size={48} />
                  </div>
                  <h3>Pesanan Terkirim!</h3>
                  {orderCode && (
                    <div style={{ background: '#f0fdf4', padding: '12px 20px', borderRadius: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Kode Order:</span>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: themeColor }}>{orderCode}</div>
                    </div>
                  )}
                  <p>Pesanan Anda telah berhasil dikirim ke WhatsApp seller. Silakan tunggu konfirmasi selanjutnya.</p>
                  <button className="btn-finish" onClick={resetCheckout} style={{ borderColor: themeColor, color: themeColor }}>
                    Tutup
                  </button>
                </div>
              )}
            </div>

            {cart.length > 0 && checkoutStep !== 'success' && (
              <div className="cart-footer">
                {checkoutStep === 'cart' && (
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span className="total-price">Rp {cartTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <button 
                  className="btn-checkout" 
                  onClick={handleCheckout}
                  style={{ backgroundColor: themeColor }}
                  disabled={(checkoutStep === 'address' && (!customerData.name || !customerData.whatsapp || !customerData.address)) || isLoadingShipping || isUploading}
                >
                  {checkoutStep === 'cart' && 'Lanjut ke Pengiriman'}
                  {checkoutStep === 'address' && (isLoadingShipping ? 'Menghitung Ongkir...' : 'Cek Ongkir & Lanjut')}
                  {checkoutStep === 'shipping' && 'Lanjut ke Pembayaran'}
                  {checkoutStep === 'payment' && (isUploading ? 'Mengirim...' : 'Kirim Pesanan ke WA')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .universal-catalog {
          width: 100%;
        }

        /* Categories */
        .categories-wrapper {
          position: sticky;
          top: 72px;
          background: white;
          z-index: 10;
          padding: 12px 0;
          margin-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
        }
        .categories-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .categories-scroll::-webkit-scrollbar { display: none; }
        .cat-tab {
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }

        /* Grid */
        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding-bottom: 100px;
        }
        @media (min-width: 768px) {
          .catalog-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
        }
        @media (max-width: 768px) {
          .product-card {
            border-radius: 8px !important;
          }
          .product-info {
            padding: 8px !important;
          }
          .product-info h3 {
            font-size: 13px !important;
          }
          .product-price {
            font-size: 13px !important;
            margin-bottom: 8px !important;
          }
          .btn-add {
            font-size: 12px !important;
            padding: 6px !important;
          }
        }

        /* Card */
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #f1f5f9;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .product-img {
          aspect-ratio: 1;
          position: relative;
          background: #f8fafc;
        }
        .product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(255,255,255,0.9);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
        }
        .product-info {
          padding: 12px;
        }
        .product-info h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px;
          color: #0f172a;
          line-height: 1.4;
          height: 2.8em;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .product-price {
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
          font-size: 15px;
        }
        .btn-add {
          width: 100%;
          border: none;
          color: white;
          padding: 8px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
        }

        /* Sticky Bar */
        .sticky-cart-bar {
          position: fixed;
          bottom: 24px;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 0 16px;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .cart-bar-inner {
          max-width: 500px;
          margin: 0 auto;
          color: white;
          padding: 12px 20px;
          border-radius: 100px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .cart-bar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .cart-icon-wrapper {
          position: relative;
        }
        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: white;
          color: black;
          font-size: 10px;
          font-weight: 800;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-summary {
          display: flex;
          flex-direction: column;
        }
        .cart-label { font-size: 11px; opacity: 0.8; }
        .cart-price { font-weight: 700; font-size: 15px; }
        .cart-bar-right {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
        }

        /* Modal */
        .cart-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }
        .cart-modal {
          width: 100%;
          max-width: 450px;
          background: white;
          height: 100%;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .cart-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .btn-back { background: none; border: none; cursor: pointer; color: #64748b; padding: 4px; display: flex; }
        .cart-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
        .btn-close { background: none; border: none; cursor: pointer; color: #64748b; }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .empty-cart {
          text-align: center;
          padding-top: 100px;
          color: #94a3b8;
        }
        .empty-icon { margin-bottom: 16px; opacity: 0.2; }

        /* Forms */
        .checkout-form { display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 14px; font-weight: 600; color: #475569; }
        .form-group input, .form-group textarea {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-family: inherit;
          font-size: 14px;
        }
        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: #94a3b8;
        }

        /* Payment */
        .payment-summary {
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .summary-row.total {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed #cbd5e1;
          font-weight: 800;
          font-size: 18px;
        }
        .info-title { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
        .method-info-card {
          display: flex;
          gap: 16px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .method-info-card .icon { color: #25d366; }
        .method-name { font-weight: 700; font-size: 14px; margin: 0; }
        .method-desc { font-size: 12px; color: #64748b; margin: 4px 0 0; }

        /* Success */
        .success-step {
          text-align: center;
          padding: 40px 20px;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .success-step h3 { font-size: 24px; font-weight: 800; margin: 0 0 12px; }
        .success-step p { color: #64748b; line-height: 1.6; margin-bottom: 32px; }
        .btn-finish {
          padding: 12px 32px;
          border-radius: 100px;
          border: 2px solid;
          background: white;
          font-weight: 700;
          cursor: pointer;
        }

        .cart-item {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f8fafc;
        }
        .item-img {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          background: #f8fafc;
        }
        .item-info { flex: 1; }
        .item-info h3 { font-size: 15px; font-weight: 600; margin: 0 0 4px; }
        .item-info p { font-weight: 700; margin: 0 0 12px; }
        .item-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .qty-picker {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          padding: 4px;
          border-radius: 6px;
        }
        .qty-picker button {
          background: white;
          border: 1px solid #e2e8f0;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .qty-picker span { font-weight: 700; font-size: 14px; min-width: 20px; text-align: center; }
        .btn-remove { background: none; border: none; color: #ef4444; cursor: pointer; opacity: 0.6; }
        .btn-remove:hover { opacity: 1; }

        .cart-footer {
          padding: 20px;
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .total-row span { font-size: 14px; color: #64748b; }
        .total-price { font-size: 20px; font-weight: 800; color: #0f172a !important; }
        .btn-checkout {
          width: 100%;
          border: none;
          color: white;
          padding: 16px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          font-size: 16px;
        }
      `}</style>
    </div>
  )
}

function normalizeWaNumber(value: string | null | undefined) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return digits
}
