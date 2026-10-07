import React from 'react'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { CartItem } from '@/types/commerce'
import { useCartStore } from '@/store/useCartStore'
import { formatRupiah } from '@/lib/checkout-formatter'
import { QuantityStepper } from './QuantityStepper'
import { motion } from 'framer-motion'

interface CartItemRendererProps {
  item: CartItem
}

export function CartItemRenderer({ item }: CartItemRendererProps) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex gap-4 py-4 border-b border-gray-100"
    >
      <div className="relative w-20 h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
        <Image 
          src={item.thumbnail || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=200&auto=format&fit=crop'} 
          alt={item.title} 
          fill 
          className="object-cover"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className="text-sm font-medium text-gray-900 leading-tight">{item.title}</h4>
            {item.variant && (
              <p className="text-xs text-gray-500 mt-1">{item.variant.value}</p>
            )}
            {item.addons && item.addons.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Tambahan: {item.addons.map(addon => `${addon.name}${addon.quantity && addon.quantity > 1 ? ` x${addon.quantity}` : ''}`).join(', ')}
              </p>
            )}
          </div>
          <button 
            onClick={() => removeItem(item.cartItemId)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            aria-label="Hapus produk"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <div className="flex justify-between items-center mt-3">
          <QuantityStepper 
            quantity={item.quantity} 
            onChange={(qty) => updateQuantity(item.cartItemId, qty)} 
            max={item.stock}
          />
          <span className="text-sm font-semibold text-gray-900">
            {formatRupiah(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
