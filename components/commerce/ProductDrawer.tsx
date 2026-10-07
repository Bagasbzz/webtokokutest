'use client'

import React, { useEffect, useState } from 'react'
import { Minus, Plus, X, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductStore } from '@/store/useProductStore'
import { useCartStore } from '@/store/useCartStore'
import { useStoreData } from './StoreContext'
import { ProductGallery } from './ProductGallery'
import { VariantSelector } from './VariantSelector'
import { QuantityStepper } from './QuantityStepper'
import { formatRupiah } from '@/lib/checkout-formatter'
import { ProductAddon, ProductVariant } from '@/types/commerce'

import { useScrollLock } from '@/hooks/useScrollLock'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const premiumEase = [0.32, 0.72, 0, 1] as const

const detailLabels: Record<string, string> = {
  unit: 'Satuan',
  portion_detail: 'Porsi / ukuran',
  contents: 'Isi paket',
  ingredients: 'Bahan utama',
  usage: 'Cara pakai',
  material: 'Bahan',
  size_chart: 'Panduan ukuran',
  expiry_info: 'Masa simpan',
  storage: 'Penyimpanan',
  shipping_note: 'Catatan pengiriman',
}

export function ProductDrawer() {
  const { isPDPOpen, activeProduct, closePDP } = useProductStore()
  const { addItem, openDrawer: openCart } = useCartStore()
  const store = useStoreData()
  const [mounted, setMounted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({})
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({})
  
  const shouldReduceMotion = useReducedMotion()
  const focusTrapRef = useFocusTrap(isPDPOpen)

  useScrollLock(isPDPOpen)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isPDPOpen) {
      setQuantity(1)
      if (activeProduct?.variants && activeProduct.variants.length > 0) {
        const defaults = activeProduct.variants.reduce<Record<string, ProductVariant>>((acc, variant) => {
          const groupKey = variant.groupId || variant.name
          if (!acc[groupKey]) acc[groupKey] = variant
          return acc
        }, {})
        setSelectedVariants(defaults)
      } else {
        setSelectedVariants({})
      }
      const requiredAddons = (activeProduct?.addons || []).reduce<Record<string, number>>((acc, addon) => {
        if (addon.required) acc[addon.id] = 1
        return acc
      }, {})
      setSelectedAddons(requiredAddons)
    }
  }, [isPDPOpen, activeProduct])

  if (!mounted || !activeProduct) return null

  const productImages = activeProduct.images || []
  const selectedVariantList = Object.values(selectedVariants)
  const selectedAddonList = (activeProduct.addons || [])
    .map(addon => ({ ...addon, quantity: selectedAddons[addon.id] || 0 }))
    .filter(addon => addon.quantity > 0)
  const variantStocks = selectedVariantList
    .map(variant => variant.stock)
    .filter((stock): stock is number => typeof stock === 'number')
  const activeStock = variantStocks.length > 0 ? Math.min(...variantStocks) : activeProduct.stock ?? 0
  const activeWeight = (activeProduct.weightGram || 0) + selectedVariantList.reduce((sum, variant) => sum + (variant.weightGram || 0), 0)
  const activePrice = activeProduct.price
    + selectedVariantList.reduce((sum, variant) => sum + (variant.priceDelta || 0), 0)
    + selectedAddonList.reduce((sum, addon) => sum + ((addon.price || 0) * (addon.quantity || 1)), 0)
  const isOutOfStock = activeStock <= 0
  const combinedVariant: ProductVariant | undefined = selectedVariantList.length > 0
    ? {
      id: selectedVariantList.map(variant => variant.id).join('__'),
      name: 'Pilihan',
      value: selectedVariantList.map(variant => `${variant.name}: ${variant.value}`).join(', '),
      priceDelta: selectedVariantList.reduce((sum, variant) => sum + (variant.priceDelta || 0), 0),
      stock: activeStock,
      weightGram: selectedVariantList.reduce((sum, variant) => sum + (variant.weightGram || 0), 0),
    }
    : undefined

  const selectedVariantIds = Object.fromEntries(
    Object.entries(selectedVariants).map(([groupKey, variant]) => [groupKey, variant.id]),
  )

  const handleSelectVariant = (variant: ProductVariant) => {
    const groupKey = variant.groupId || variant.name
    setSelectedVariants(prev => ({ ...prev, [groupKey]: variant }))
  }

  const setAddonQuantity = (addon: ProductAddon, nextQuantity: number) => {
    const maxQty = Math.max(1, addon.maxQty || 1)
    const safeQuantity = Math.max(addon.required ? 1 : 0, Math.min(maxQty, nextQuantity))
    setSelectedAddons(prev => {
      const next = { ...prev }
      if (safeQuantity <= 0) delete next[addon.id]
      else next[addon.id] = safeQuantity
      return next
    })
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return

    addItem({
      cartItemId: `${activeProduct.id}-${combinedVariant?.id || 'base'}-${selectedAddonList.map(addon => `${addon.id}x${addon.quantity || 1}`).join('__') || 'noaddon'}`,
      productId: activeProduct.id,
      title: activeProduct.title,
      price: activePrice,
      quantity,
      variant: combinedVariant,
      addons: selectedAddonList,
      thumbnail: productImages[0] || '',
      weightGram: activeWeight,
      stock: activeStock
    })
    closePDP()
    setTimeout(() => {
      openCart()
    }, 300)
  }

  return (
    <AnimatePresence>
      {isPDPOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closePDP}
            className="fixed inset-0 bg-black z-[9990]"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Detail Produk: ${activeProduct.title}`}
            tabIndex={-1}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              ease: premiumEase, 
              duration: shouldReduceMotion ? 0.2 : 0.4 
            }}
            className="fixed inset-x-0 bottom-0 top-auto h-[90vh] md:top-0 md:bottom-0 md:inset-x-auto md:right-0 md:w-full md:max-w-[500px] md:h-full bg-white z-[9991] shadow-2xl flex flex-col rounded-t-2xl md:rounded-none overflow-hidden focus:outline-none"
          >
            {/* Close Button Floating */}
            <button 
              onClick={closePDP}
              aria-label="Tutup Detail Produk"
              className="absolute top-4 right-4 z-[9992] bg-white/80 backdrop-blur-md p-2 rounded-full text-black hover:bg-white shadow-sm transition-colors"
            >
              <X size={20} />
            </button>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <ProductGallery 
                images={store.featureFlags?.['product_gallery'] ? productImages : [productImages[0]].filter(Boolean)} 
                title={activeProduct.title} 
              />
              
              <div className="p-6 flex flex-col">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                      {activeProduct.title}
                    </h1>
                    {activeProduct.category && (
                      <span className="inline-block mt-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {activeProduct.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatRupiah(activePrice)}
                  </span>
                  {activeProduct.compareAtPrice && (
                    <span className="text-base text-gray-400 line-through">
                      {formatRupiah(activeProduct.compareAtPrice)}
                    </span>
                  )}
                </div>

                {/* Additional Info Row */}
                <div className="flex items-center gap-6 mt-6 border-y border-gray-50 py-3 text-xs text-gray-500">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 uppercase tracking-wider font-bold" style={{ fontSize: '10px' }}>Stok</span>
                    <span className={isOutOfStock ? 'text-red-500 font-bold' : 'text-gray-900 font-semibold'}>
                      {activeStock} pcs
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 uppercase tracking-wider font-bold" style={{ fontSize: '10px' }}>Berat</span>
                    <span className="text-gray-900 font-semibold">{activeWeight} gram</span>
                  </div>
                </div>

                <VariantSelector 
                  variants={activeProduct.variants || []} 
                  selectedVariantIds={selectedVariantIds}
                  onSelect={handleSelectVariant}
                />

                {activeProduct.addons && activeProduct.addons.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Tambahan yang tersedia</h3>
                    <div className="flex flex-col gap-2">
                      {activeProduct.addons.map((addon) => (
                        <label key={addon.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${selectedAddons[addon.id] ? 'border-gray-900 bg-gray-50' : 'border-gray-100 bg-white'}`}>
                          <span className="flex flex-col gap-0.5 text-gray-700">
                            <span className="font-medium">{addon.name}</span>
                            {addon.required && <span className="text-[10px] text-gray-400">Wajib</span>}
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900">{addon.price > 0 ? formatRupiah(addon.price) : 'Gratis'}</span>
                            <span className="flex items-center rounded-md border border-gray-200 overflow-hidden">
                              <button
                                type="button"
                                className="h-8 w-8 flex items-center justify-center disabled:opacity-30"
                                disabled={addon.required && (selectedAddons[addon.id] || 0) <= 1}
                                onClick={(event) => {
                                  event.preventDefault()
                                  setAddonQuantity(addon, (selectedAddons[addon.id] || 0) - 1)
                                }}
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold">{selectedAddons[addon.id] || 0}</span>
                              <button
                                type="button"
                                className="h-8 w-8 flex items-center justify-center disabled:opacity-30"
                                disabled={(selectedAddons[addon.id] || 0) >= Math.max(1, addon.maxQty || 1)}
                                onClick={(event) => {
                                  event.preventDefault()
                                  setAddonQuantity(addon, (selectedAddons[addon.id] || 0) + 1)
                                }}
                              >
                                <Plus size={13} />
                              </button>
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeProduct.details && Object.values(activeProduct.details).some(Boolean) && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Detail produk</h3>
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      {Object.entries(activeProduct.details).filter(([, value]) => Boolean(value)).map(([key, value]) => (
                        <div key={key} className="rounded-lg border border-gray-100 p-3">
                          <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{detailLabels[key] || key}</dt>
                          <dd className="mt-1 text-gray-700">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                <div className="mt-8">
                   <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Deskripsi Produk</h3>
                   <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {activeProduct.description || 'Tidak ada deskripsi untuk produk ini.'}
                   </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom CTA */}
            <div className="p-4 border-t border-gray-100 bg-white flex items-center gap-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <QuantityStepper 
                quantity={quantity} 
                onChange={setQuantity} 
                max={activeStock || 1}
              />
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 bg-black text-white h-12 rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:bg-gray-400"
              >
                <ShoppingBag size={18} />
                {!isOutOfStock ? 'Tambah ke Keranjang' : 'Stok Habis'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
