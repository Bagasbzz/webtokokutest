'use client'

import React, { useEffect } from 'react'
import { CartFAB } from './CartFAB'
import { CartDrawer } from './CartDrawer'
import { ProductDrawer } from './ProductDrawer'
import { StoreProvider } from './StoreContext'
import { useCartStore } from '@/store/useCartStore'
import { sanitizeColorValue } from '@/lib/customization-security'

interface CommerceLayerProps {
  children: React.ReactNode
  store: {
    id: string
    nama_toko: string
    wa_nomor: string
    slug: string
    warna_tema?: string
    template?: string
    paymentMethods?: any[]
    shippingSettings?: any
  }
  featureFlags?: Record<string, boolean>
  showWatermark?: boolean
}

import { useProductStore } from '@/store/useProductStore'

function getDefaultColorForTemplate(template?: string): string {
  const t = (template || 'butik').toLowerCase()
  switch (t) {
    case 'butik': return '#C5A059'
    case 'dapur': return '#D86B43'
    case 'glow': return '#059669'
    case 'luxe': return '#8B5CF6'
    case 'herba': return '#2d6a4f'
    default: return '#16A34A'
  }
}

function getDefaultSecondaryColorForTemplate(template?: string, primary?: string): string {
  const t = (template || 'butik').toLowerCase()
  switch (t) {
    case 'butik': return primary || '#C5A059'
    case 'dapur': return '#F97316'
    case 'glow': return '#10B981'
    case 'luxe': return '#C4B5FD'
    case 'herba': return '#40916c'
    default: return '#0F172A'
  }
}

function hexToRgb(hex: string): string {
  const cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    return `${r}, ${g}, ${b}`
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return `${r}, ${g}, ${b}`
  }
  return '22, 163, 74'
}

export function CommerceLayer({ children, store, featureFlags, showWatermark = false }: CommerceLayerProps) {
  const setStoreSlug = useCartStore(s => s.setStoreSlug)
  const isCartOpen = useCartStore(s => s.isDrawerOpen)
  const isPDPOpen = useProductStore(s => s.isPDPOpen)
  
  const isAnyModalOpen = isCartOpen || isPDPOpen

  useEffect(() => {
    if (store.slug) {
      setStoreSlug(store.slug)
    }
  }, [store.slug, setStoreSlug])

  const rawColor = store.warna_tema || ''
  const [primaryColorRaw, secondaryColorRaw] = rawColor.split(',')
  const accentColor = sanitizeColorValue(primaryColorRaw) || getDefaultColorForTemplate(store.template)
  const secondaryColor = sanitizeColorValue(secondaryColorRaw) || getDefaultSecondaryColorForTemplate(store.template, accentColor)

  return (
    <StoreProvider data={store} featureFlags={featureFlags}>
      <div 
        className="commerce-layer-root" 
        data-template={store.template || 'butik'} 
        style={{
          '--color-primary': accentColor,
          '--color-secondary': secondaryColor,
          '--color-primary-rgb': hexToRgb(accentColor),
        } as React.CSSProperties}
      >
        <div aria-hidden={isAnyModalOpen}>
          {children}
          {showWatermark && (
            <div className="wtk-powered-by">
              <a href="/" aria-label="Dibuat dengan WebTokoku">Powered by WebTokoku</a>
            </div>
          )}
        </div>
        <CartFAB />
        <CartDrawer />
        <ProductDrawer />
      </div>
      <style jsx global>{`
        .wtk-powered-by {
          display: flex;
          justify-content: center;
          padding: 18px 16px 22px;
          background: #ffffff;
        }

        .wtk-powered-by a {
          display: inline-flex;
          align-items: center;
          min-height: 30px;
          padding: 7px 12px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 999px;
          color: #475569;
          background: rgba(255, 255, 255, 0.88);
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        }

        .wtk-powered-by a:hover {
          color: #0f172a;
          border-color: rgba(var(--color-primary-rgb), 0.28);
        }
      `}</style>
    </StoreProvider>
  )
}
