'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PublicProduct } from '@/lib/public-store'
import { useProductStore } from '@/store/useProductStore'
import { getHomepageProducts, toCommerceProduct, visibleCategories } from '@/lib/commerce-product'

interface ButikCatalogProps {
  products: PublicProduct[]
  storeSlug: string
  accentColor?: string
}

export function ButikCatalog({ products, storeSlug, accentColor = '#C5A059' }: ButikCatalogProps) {
  const { openPDP } = useProductStore()
  const [activeCategory, setActiveCategory] = useState('Semua')
  const safeProducts = products || []

  const categories = ['Semua', ...visibleCategories(safeProducts)]
  const baseProducts = activeCategory === 'Semua'
    ? safeProducts
    : safeProducts.filter((p) => p.kategori === activeCategory)
  const homepageProducts = getHomepageProducts(baseProducts, 6)

  const handleProductClick = (product: PublicProduct) => {
    openPDP(toCommerceProduct(product))
  }

  if (!safeProducts || safeProducts.length === 0) {
    return <div className="text-white/40 text-sm tracking-widest py-16 text-center">Belum ada koleksi yang tersedia.</div>
  }

  return (
    <div className="w-full">
      {categories.length > 1 && (
        <div 
          className="flex overflow-x-auto gap-2 md:gap-3 mb-8 md:mb-14 p-2 justify-start md:justify-center w-full scrollbar-none rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="rounded-full border px-4 md:px-5 py-2.5 text-[10px] md:text-[11px] tracking-[0.16em] uppercase transition-all duration-300 font-semibold whitespace-nowrap flex-shrink-0"
                style={isActive
                  ? { 
                      background: 'var(--color-primary, #C5A059)',
                      color: '#0A0A0A',
                      borderColor: 'var(--color-primary, #C5A059)',
                      boxShadow: '0 12px 24px rgba(197, 160, 89, 0.18)',
                    }
                  : { 
                      background: 'rgba(255,255,255,0.055)',
                      color: 'rgba(255,255,255,0.82)',
                      borderColor: 'rgba(255,255,255,0.12)',
                    }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 md:gap-y-12 gap-x-4 md:gap-x-10 text-left">
        {homepageProducts.map(product => {
          const hasDiscount = product.compare_at_price && product.compare_at_price > product.harga
          const discountPercent = hasDiscount 
            ? Math.round(((product.compare_at_price! - product.harga) / product.compare_at_price!) * 100)
            : 0

          return (
            <div
              key={product.id}
              className="group cursor-pointer flex flex-col transition-all duration-500"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#121212] mb-3 md:mb-5 border border-white/5 transition-all duration-500 group-hover:border-white/15">
                <Image
                  src={product.foto_url || '/template-previews/butik-desktop.jpg'}
                  alt={product.nama}
                  fill
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-85 group-hover:opacity-100"
                />
                
                {/* Minimalist Top Badges */}
                <div className="absolute top-2 left-2 right-2 md:top-3 md:left-3 md:right-3 flex justify-between items-start pointer-events-none">
                  {product.badge_label ? (
                    <span className="bg-[#0A0A0A]/90 backdrop-blur-md px-1.5 py-0.5 md:px-2.5 md:py-1 text-[7px] md:text-[8px] font-semibold uppercase tracking-[0.2em] text-white border border-white/10">
                      {product.badge_label}
                    </span>
                  ) : <span></span>}

                  {hasDiscount && (
                    <span className="bg-[var(--color-primary,#C5A059)] px-1.5 py-0.5 md:px-2.5 md:py-1 text-[7px] md:text-[8px] font-semibold uppercase tracking-[0.2em] text-white">
                      -{discountPercent}% OFF
                    </span>
                  )}
                </div>

                {product.show_category !== false && product.kategori && (
                  <span className="absolute left-2 bottom-2 md:left-3 md:bottom-3 bg-[#0A0A0A]/60 backdrop-blur-sm border border-white/10 px-1.5 py-0.5 text-[7px] md:text-[8px] font-medium uppercase tracking-[0.18em] text-white/80">
                    {product.kategori}
                  </span>
                )}
              </div>

              <h3 className="font-heading text-xs md:text-sm lg:text-base font-light tracking-wider text-white/95 group-hover:text-[var(--color-primary,#C5A059)] transition-colors duration-300 line-clamp-2 min-h-[2.4em] leading-snug">
                {product.nama}
              </h3>
              
              <div className="mt-1 md:mt-2 flex flex-wrap items-baseline gap-1.5 md:gap-2.5">
                <p className="text-[11px] md:text-sm tracking-widest font-medium" style={{ color: 'var(--color-primary, #C5A059)' }}>
                  Rp {product.harga.toLocaleString('id-ID')}
                </p>
                {hasDiscount && (
                  <span className="text-[9px] md:text-[10px] text-white/40 line-through tracking-wider">
                    Rp {product.compare_at_price!.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-center mt-20">
        <Link
          href={`/${storeSlug}/produk`}
          className="border px-12 py-3.5 text-[10px] tracking-[0.25em] uppercase transition-all duration-300 font-semibold hover:bg-[var(--color-primary,#C5A059)] hover:text-black"
          style={{ borderColor: 'var(--color-primary, #C5A059)', color: 'var(--color-primary, #C5A059)' }}
        >
          Lihat semua koleksi
        </Link>
      </div>
    </div>
  )
}
