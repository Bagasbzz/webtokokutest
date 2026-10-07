'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PublicProduct } from '@/lib/public-store'
import { useProductStore } from '@/store/useProductStore'
import { getHomepageProducts, toCommerceProduct, visibleCategories } from '@/lib/commerce-product'
import { getEditableAttr } from '@/lib/editor-mapping'

interface GlowCatalogProps {
  products: PublicProduct[]
  storeSlug: string
  title?: string
  previewMode?: boolean
}

const premiumEase = [0.32, 0.72, 0, 1] as const

export function GlowCatalog({ products, storeSlug, title, previewMode }: GlowCatalogProps) {
  const { openPDP } = useProductStore()
  const [activeCategory, setActiveCategory] = useState('Semua')
  const safeProducts = products || []

  const categories = ['Semua', ...visibleCategories(safeProducts)]
  const baseProducts = activeCategory === 'Semua' ? getHomepageProducts(safeProducts, 6) : safeProducts.filter((product) => product.kategori === activeCategory)
  const visibleProducts = activeCategory === 'Semua' ? baseProducts : getHomepageProducts(baseProducts, 6)

  if (safeProducts.length === 0) return null

  return (
    <section className="py-32 px-6 md:px-12" id="catalog" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #111) 2%, #FAF9F6)' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .glow-tab {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.45);
          border: 1px solid rgba(0, 0, 0, 0.06);
          color: color-mix(in srgb, var(--color-primary, #111) 70%, #555852);
          font-weight: 600;
          letter-spacing: 0.05em;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          white-space: nowrap;
        }
        .glow-tab.active {
          background: var(--color-primary, #111111);
          color: #ffffff;
          border-color: var(--color-primary, #111111);
          box-shadow: 0 10px 25px -6px color-mix(in srgb, var(--color-primary, #111) 30%, transparent);
        }
        .glow-tab:not(.active):hover {
          background: rgba(255, 255, 255, 0.9);
          border-color: var(--color-primary, #111111);
          color: var(--color-primary, #111111);
        }
        .glow-card {
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .glow-card:hover .glow-image-container {
          box-shadow: 0 30px 60px -15px color-mix(in srgb, var(--color-primary, #111) 12%, transparent), 0 0 30px -5px color-mix(in srgb, var(--color-secondary, #111) 6%, transparent);
          transform: translateY(-6px);
        }
        .glow-image-container {
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          border: 1px solid rgba(0,0,0,0.02);
        }
        .glow-product-title {
          color: color-mix(in srgb, var(--color-primary, #111) 20%, #111);
        }
        .glow-card:hover .glow-product-title {
          color: var(--color-primary, #111111);
        }
        .glow-badge-glass {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: var(--color-primary, #111111);
          font-weight: 700;
          font-size: 9px;
          letter-spacing: 0.1em;
        }
        .glow-badge-solid {
          background: var(--color-secondary, var(--color-primary, #111111));
          color: #ffffff;
          font-weight: 700;
          font-size: 9px;
          letter-spacing: 0.1em;
        }
        .glow-btn-all {
          border: 1px solid var(--color-primary, #111111);
          color: var(--color-primary, #111111);
          background: transparent;
          transition: all 0.3s ease;
        }
        .glow-btn-all:hover {
          background: var(--color-primary, #111111);
          color: #ffffff;
          box-shadow: 0 10px 25px -6px color-mix(in srgb, var(--color-primary, #111) 25%, transparent);
          transform: translateY(-2px);
        }
        .glow-tabs-container {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          width: 100%;
        }
        .glow-tabs-container::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 768px) {
          .glow-tabs-container {
            flex-wrap: wrap;
            padding-bottom: 0;
            overflow-x: visible;
            width: auto;
          }
        }
        @media (max-width: 768px) {
          .py-32 {
            padding-top: 4rem !important;
            padding-bottom: 4rem !important;
          }
          .mb-16 {
            margin-bottom: 2rem !important;
          }
          .glow-grid-container {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px 12px !important;
          }
          .glow-card {
            grid-column: span 1 !important;
          }
          .glow-image-container {
            aspect-ratio: 1/1 !important;
            border-radius: 16px !important;
            margin-bottom: 10px !important;
          }
          .glow-product-title {
            font-size: 14px !important;
            line-clamp: 1 !important;
          }
          .glow-badge-glass, .glow-badge-solid {
            top: 8px !important;
            left: 8px !important;
            bottom: auto !important;
            padding: 3px 8px !important;
            font-size: 8px !important;
          }
          .glow-card .text-right p {
            font-size: 13px !important;
          }
          .glow-card .text-right {
            font-size: 13px !important;
          }
        }
      `}} />
      <div className="max-w-7xl mx-auto">
        {/* Header Catalog */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-black/5 pb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-400 block mb-2">Pilihan Terbaik</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#111] tracking-tight" {...getEditableAttr(previewMode, 'catalog.title')}>
              {title || 'Koleksi Terpilih'}
            </h2>
          </div>
          {categories.length > 1 && (
            <div className="glow-tabs-container justify-start md:justify-end">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category)
                  }}
                  className={`glow-tab px-5 py-2.5 rounded-full text-xs transition-all duration-300 ${activeCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mixed Sizing Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-20 glow-grid-container">
          {visibleProducts.map((product, idx) => {
            // Asymmetrical grid logic: every 3rd item is a large featured card
            const isLarge = idx % 3 === 0
            const colSpan = isLarge ? 'md:col-span-8' : 'md:col-span-4'
            const aspect = isLarge ? 'aspect-[4/3] md:aspect-[16/10]' : 'aspect-[3/4]'

            return (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: premiumEase }}
                className={`${colSpan} group cursor-pointer flex flex-col glow-card`}
                onClick={() => {
                  openPDP(toCommerceProduct(product))
                }}
              >
                <div className={`relative w-full ${aspect} rounded-[32px] overflow-hidden bg-[#FAF9F5] mb-6 glow-image-container`}>
                  <Image 
                    src={product.foto_url || '/template-previews/glow-desktop.jpg'}
                    alt={product.nama}
                    fill
                    className="object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-[1.03] mix-blend-multiply opacity-90 group-hover:opacity-100"
                  />
                  
                  {product.show_category !== false && product.kategori && (
                    <div className="absolute top-5 left-5 glow-badge-glass px-4 py-1.5 rounded-full uppercase tracking-wider">
                      {product.kategori}
                    </div>
                  )}
                  {product.badge_label && (
                    <div className="absolute bottom-5 left-5 glow-badge-solid px-4 py-1.5 rounded-full uppercase tracking-wider">
                      {product.badge_label}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-start px-3">
                  <div className="flex-1 pr-4">
                    <h3 className="font-serif text-lg md:text-xl font-medium text-[#111] glow-product-title transition-colors duration-300 line-clamp-1">
                      {product.nama}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold font-sans">
                      {product.kategori || 'Skincare'}
                    </p>
                  </div>
                  
                  <div className="text-right whitespace-nowrap">
                    <p className="font-sans text-base font-semibold text-gray-800">
                      Rp {product.harga.toLocaleString('id-ID')}
                    </p>
                    {product.compare_at_price && product.compare_at_price > product.harga && (
                      <p className="font-sans text-xs text-gray-400 line-through">
                        Rp {product.compare_at_price.toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        <div className="mt-20 flex justify-center">
          <Link href={`/${storeSlug}/produk`} className="glow-btn-all min-h-12 rounded-full px-8 py-3.5 font-bold text-xs uppercase tracking-widest">
            Lihat semua produk
          </Link>
        </div>
      </div>
    </section>
  )
}
