'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { motion, useAnimationControls } from 'framer-motion'
import { useCartStore } from '@/store/useCartStore'

export function CartFAB() {
  const { getCartCount, openDrawer } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const count = getCartCount()
  const controls = useAnimationControls()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (count > 0 && mounted) {
      controls.start({
        scale: [1, 1.2, 1],
        transition: { type: 'spring', stiffness: 400, damping: 10 }
      })
    }
  }, [count, controls, mounted])

  if (!mounted) return null

  return (
    <button
      onClick={openDrawer}
      className="fixed bottom-6 right-6 z-[9997] bg-black text-white p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform flex items-center justify-center"
      aria-label="Buka Keranjang"
    >
      <ShoppingBag size={24} />
      {count > 0 && (
        <motion.div
          animate={controls}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white"
        >
          {count > 99 ? '99+' : count}
        </motion.div>
      )}
    </button>
  )
}
