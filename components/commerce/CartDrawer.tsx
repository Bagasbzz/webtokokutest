'use client'

import React, { useEffect, useState } from 'react'
import { X, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/useCartStore'
import { CartItemRenderer } from './CartItemRenderer'
import { CheckoutSummary } from './CheckoutSummary'

import { useScrollLock } from '@/hooks/useScrollLock'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const premiumEase = [0.32, 0.72, 0, 1] as const

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, items } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const focusTrapRef = useFocusTrap(isDrawerOpen)

  useScrollLock(isDrawerOpen)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black z-[9998]"
          />

          <motion.div
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Keranjang Belanja"
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              ease: premiumEase, 
              duration: shouldReduceMotion ? 0.2 : 0.4 
            }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-white z-[9999] shadow-2xl flex flex-col focus:outline-none"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <ShoppingBag size={20} />
                Keranjang
              </h2>
              <button 
                onClick={closeDrawer}
                aria-label="Tutup Keranjang"
                className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingBag size={48} className="opacity-20" />
                  <p className="text-sm">Keranjang Anda masih kosong</p>
                  <button 
                    onClick={closeDrawer}
                    className="text-black text-sm font-medium border-b border-black pb-0.5 mt-4"
                  >
                    Lanjut Belanja
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  <AnimatePresence mode="popLayout">
                    {items.map(item => (
                      <CartItemRenderer key={item.cartItemId} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <CheckoutSummary />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
