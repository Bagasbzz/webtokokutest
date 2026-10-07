'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PublicProduct } from '@/lib/public-store'
import { useProductStore } from '@/store/useProductStore'
import { getHomepageProducts, toCommerceProduct, visibleCategories } from '@/lib/commerce-product'

interface LuxeCatalogProps {
  products: PublicProduct[]
  accentColor: string
  storeSlug: string
}

export function LuxeCatalog({ products, accentColor, storeSlug }: LuxeCatalogProps) {
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

  const renderProductVariants = (product: PublicProduct) => {
    if (!product.option_groups || !Array.isArray(product.option_groups) || product.option_groups.length === 0) {
      return null
    }
    
    // Find the first option group that might be color/shade
    const group = product.option_groups[0]
    if (!group || !Array.isArray(group.values) || group.values.length === 0) {
      return null
    }

    // Check if any value has color_hex
    const hasColors = group.values.some((v: any) => v.color_hex)
    
    if (hasColors) {
      return (
        <div className="luxe-card-swatches" onClick={(e) => e.stopPropagation()}>
          {group.values.slice(0, 5).map((val: any, idx: number) => (
            <span 
              key={idx} 
              className="luxe-swatch-dot" 
              style={{ backgroundColor: val.color_hex || '#ccc' }}
              title={val.label || val.value}
            />
          ))}
          {group.values.length > 5 && (
            <span className="luxe-swatch-more">+{group.values.length - 5}</span>
          )}
        </div>
      )
    }

    // If no colors, show textual indicator (e.g., "+3 Shade" or "3 Pilihan")
    return (
      <div className="luxe-card-variant-badge">
        {group.values.length} {group.name || 'Pilihan'}
      </div>
    )
  }

  if (!safeProducts || safeProducts.length === 0) {
    return <div className="text-white/40 py-16 text-center tracking-widest font-medium">Belum ada koleksi produk kecantikan tersedia.</div>
  }

  return (
    <div className="luxe-catalog-wrap">
      {categories.length > 1 && (
        <div className="luxe-cat-tabs">
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                className="luxe-cat-btn"
                style={isActive
                  ? { 
                      background: 'var(--color-primary, ' + accentColor + ')', 
                      color: 'white', 
                      borderColor: 'var(--color-primary, ' + accentColor + ')',
                      boxShadow: '0 10px 25px -8px var(--color-primary, rgba(139, 92, 246, 0.4))'
                    }
                  : {}}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      <div className="luxe-grid">
        {homepageProducts.map(product => {
          const hasDiscount = product.compare_at_price && product.compare_at_price > product.harga

          return (
            <div
              key={product.id}
              className="luxe-card"
              onClick={() => handleProductClick(product)}
            >
              <div className="luxe-img">
                <img
                  src={product.foto_url || '/template-previews/luxe-desktop.jpg'}
                  alt={product.nama}
                />
                
                {product.badge_label && <span className="luxe-badge">{product.badge_label}</span>}
                {hasDiscount && (
                  <span className="luxe-discount-badge">
                    SALE
                  </span>
                )}

                <div className="luxe-overlay">
                  <div className="luxe-btn-circle">
                    <Plus size={22} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div className="luxe-info">
                {product.show_category !== false && product.kategori && (
                  <span className="luxe-cat-label">{product.kategori}</span>
                )}
                <h3 className="luxe-title">{product.nama}</h3>
                <p className="luxe-price">
                  Rp {product.harga.toLocaleString('id-ID')}
                  {hasDiscount && (
                    <span>Rp {product.compare_at_price!.toLocaleString('id-ID')}</span>
                  )}
                </p>
                {renderProductVariants(product)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="luxe-all">
        <Link href={`/${storeSlug}/produk`}>Lihat semua produk</Link>
      </div>

      <style jsx>{`
        .luxe-catalog-wrap {
          width: 100%;
          background: #0C0C0E;
          padding: 40px;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
        .luxe-cat-tabs {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          flex-wrap: nowrap;
          margin-bottom: 30px;
          justify-content: flex-start;
          width: 100%;
          padding: 4px 16px 12px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .luxe-cat-tabs::-webkit-scrollbar {
          display: none;
        }
        .luxe-cat-btn {
          padding: 10px 24px;
          border-radius: 99px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #A1A1AA;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          white-space: nowrap;
        }
        .luxe-cat-btn:hover {
          border-color: var(--color-primary, ${accentColor});
          color: #FAFAFA;
          background: rgba(255, 255, 255, 0.05);
        }
        @media (min-width: 768px) {
          .luxe-cat-tabs {
            flex-wrap: wrap;
            justify-content: center;
            padding: 0;
            overflow-x: visible;
          }
        }
        .luxe-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 40px 30px;
          width: 100%;
        }
        .luxe-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 24px;
          padding: 14px;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .luxe-card:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(var(--color-primary-rgb), 0.35);
          box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.8), 
                      0 0 20px -2px rgba(var(--color-primary-rgb), 0.08);
          transform: translateY(-4px);
        }
        .luxe-img {
          aspect-ratio: 3/4;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          background: #121214;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.02);
        }
        .luxe-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s cubic-bezier(0.165, 0.84, 0.44, 1);
          opacity: 0.9;
        }
        .luxe-card:hover .luxe-img img {
          transform: scale(1.04);
          opacity: 1;
        }
        
        /* Gloss Overlay */
        .luxe-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0) 100%
          ), rgba(9, 9, 11, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          backdrop-filter: blur(2px);
        }
        .luxe-card:hover .luxe-overlay {
          opacity: 1;
        }
        .luxe-btn-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #FAFAFA;
          color: #09090B;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(0.85);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .luxe-card:hover .luxe-btn-circle {
          transform: scale(1);
        }
        
        .luxe-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 2;
          background: #FAFAFA;
          color: #09090B;
          border-radius: 99px;
          padding: 6px 12px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .08em;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .luxe-discount-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 2;
          background: var(--color-primary, ${accentColor});
          color: #ffffff;
          border-radius: 99px;
          padding: 6px 12px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .08em;
          box-shadow: 0 4px 12px rgba(var(--color-primary-rgb),0.25);
        }
        .luxe-cat-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-primary, ${accentColor});
          margin-bottom: 6px;
        }
        .luxe-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 8px;
          color: #FAFAFA;
          line-clamp: 1;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          letter-spacing: 0.5px;
        }
        .luxe-price {
          font-weight: 700;
          color: var(--color-secondary, var(--color-primary, ${accentColor}));
          letter-spacing: 0.5px;
          display: flex;
          gap: 12px;
          align-items: baseline;
          font-size: 0.95rem;
          margin-top: auto;
        }
        .luxe-price span {
          color: #71717A;
          text-decoration: line-through;
          font-size: 0.8rem;
          font-weight: 400;
        }
        .luxe-all {
          display: flex;
          justify-content: center;
          margin-top: 50px;
        }
        .luxe-all a {
          display: inline-flex;
          min-height: 52px;
          align-items: center;
          border: 1px solid var(--color-primary, ${accentColor});
          color: #FAFAFA;
          padding: 0 40px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .12em;
          font-size: 11px;
          transition: all 0.3s ease;
          border-radius: 99px;
        }
        .luxe-all a:hover {
          background: var(--color-primary, ${accentColor});
          color: #09090B;
          box-shadow: 0 10px 25px -8px var(--color-primary, rgba(139, 92, 246, 0.4));
          transform: translateY(-2px);
        }
        
        /* Swatch and variant badges styling */
        .luxe-card-swatches {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .luxe-swatch-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: inline-block;
          cursor: pointer;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
          transition: transform 0.2s ease;
        }
        .luxe-swatch-dot:hover {
          transform: scale(1.2);
        }
        .luxe-swatch-more {
          font-size: 10px;
          font-weight: 700;
          color: #A1A1AA;
          letter-spacing: 0.5px;
        }
        .luxe-card-variant-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 8px;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.01);
        }

        @media (max-width: 768px) {
          .luxe-catalog-wrap {
            padding: 16px;
          }
          .luxe-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .luxe-card {
            padding: 8px !important;
            border-radius: 16px !important;
          }
          .luxe-img {
            margin-bottom: 10px !important;
            border-radius: 12px !important;
          }
          .luxe-title {
            font-size: 13px !important;
            margin-bottom: 4px !important;
          }
          .luxe-price {
            font-size: 13px !important;
          }
          .luxe-badge, .luxe-discount-badge {
            top: 6px !important;
            left: 6px !important;
            right: auto !important;
            padding: 3px 6px !important;
            font-size: 8px !important;
          }
          .luxe-discount-badge {
            right: 6px !important;
            left: auto !important;
          }
          .luxe-cat-label {
            font-size: 8px !important;
            margin-bottom: 2px !important;
          }
          .luxe-swatch-dot {
            width: 10px !important;
            height: 10px !important;
          }
          .luxe-swatch-more {
            font-size: 8px !important;
          }
          .luxe-card-variant-badge {
            font-size: 8px !important;
            padding: 1px 4px !important;
          }
        }
      `}</style>
    </div>
  )
}
