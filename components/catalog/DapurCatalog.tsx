'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PublicProduct } from '@/lib/public-store'
import { useProductStore } from '@/store/useProductStore'
import { getHomepageProducts, toCommerceProduct, visibleCategories } from '@/lib/commerce-product'

interface DapurCatalogProps {
  products: PublicProduct[]
  accentColor: string
  storeSlug: string
}

export function DapurCatalog({ products, accentColor, storeSlug }: DapurCatalogProps) {
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
    return <div className="text-gray-400 py-16 text-center font-medium">Belum ada menu yang tersedia saat ini.</div>
  }

  return (
    <>
      {categories.length > 1 && (
        <div className="dapur-cat-tabs">
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                className="dapur-cat-btn"
                style={isActive
                  ? { 
                      background: 'var(--color-primary, ' + accentColor + ')', 
                      color: 'white', 
                      borderColor: 'var(--color-primary, ' + accentColor + ')',
                      boxShadow: '0 8px 20px -6px rgba(var(--color-primary-rgb, 107, 92, 83), 0.3)'
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

      {homepageProducts.map(product => {
        const hasDiscount = product.compare_at_price && product.compare_at_price > product.harga

        return (
          <div
            key={product.id}
            className="menu-card"
            onClick={() => handleProductClick(product)}
          >
            <div className="mc-img">
              {product.show_category !== false && product.kategori && <span className="mc-badge">{product.kategori}</span>}
              {product.badge_label && <span className="mc-label">{product.badge_label}</span>}
              <img
                src={product.foto_url || '/template-previews/dapur-desktop.jpg'}
                alt={product.nama}
              />
            </div>
            <div className="mc-info">
              <h3 className="mc-title">{product.nama}</h3>
              <p className="mc-desc">{product.deskripsi || 'Nikmati kelezatan menu pilihan terbaik buatan dapur kami. Tanyakan ketersediaan stok.'}</p>
              
              <div className="flex justify-between items-center mt-auto pt-2">
                <span className="mc-price">
                  Rp {product.harga.toLocaleString('id-ID')}
                  {hasDiscount && (
                    <small>Rp {product.compare_at_price!.toLocaleString('id-ID')}</small>
                  )}
                </span>
                
                <button
                  className="btn-add-small"
                  aria-label="Add to cart"
                  style={{
                    background: 'var(--color-primary, ' + accentColor + ')',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        )
      })}

      <div className="menu-all-link">
        <Link href={`/${storeSlug}/produk`}>Lihat semua produk</Link>
      </div>

      <style jsx>{`
        .dapur-cat-tabs {
          grid-column: 1 / -1;
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
        .dapur-cat-tabs::-webkit-scrollbar {
          display: none;
        }
        .dapur-cat-btn {
          padding: 10px 24px;
          border-radius: 99px;
          border: 1px solid #E3DCD5;
          background: #FAF8F5;
          font-weight: 700;
          font-size: 13px;
          color: #5C4B40;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .dapur-cat-btn:hover {
          border-color: var(--color-primary, ${accentColor});
          color: var(--color-primary, ${accentColor});
          background: #FAF8F5;
        }
        @media (min-width: 768px) {
          .dapur-cat-tabs {
            flex-wrap: wrap;
            justify-content: center;
            padding: 0;
            overflow-x: visible;
          }
        }
        @media (max-width: 768px) {
          .menu-card {
            border-radius: 16px;
          }
          .mc-img {
            height: auto !important;
            aspect-ratio: 4 / 3;
          }
          .mc-info {
            padding: 12px !important;
          }
          .mc-title {
            font-size: 14px !important;
            margin-bottom: 4px !important;
          }
          .mc-desc {
            display: none !important;
          }
          .mc-price {
            font-size: 14px !important;
          }
          .btn-add-small {
            width: 32px !important;
            height: 32px !important;
          }
        }
        .menu-card {
          background: #FFFFFF;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid rgba(227, 220, 213, 0.6);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 24px -12px rgba(107, 92, 83, 0.08);
          position: relative;
        }
        .menu-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 35px -12px rgba(107, 92, 83, 0.16);
          border-color: rgba(227, 220, 213, 0.9);
        }
        .menu-card:hover .btn-add-small {
          transform: scale(1.15);
          box-shadow: 0 6px 14px rgba(0,0,0,0.12);
        }
        .mc-img {
          aspect-ratio: 4 / 3;
          height: auto;
          position: relative;
          overflow: hidden;
          background: #FAF8F5;
        }
        .mc-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .menu-card:hover .mc-img img {
          transform: scale(1.04);
        }
        .mc-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          color: var(--color-primary, ${accentColor});
          padding: 5px 14px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          z-index: 2;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          letter-spacing: 0.05em;
        }
        .mc-label {
          position: absolute;
          right: 16px;
          bottom: 16px;
          background: var(--color-secondary, var(--color-primary, ${accentColor}));
          color: white;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 800;
          z-index: 2;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          letter-spacing: 0.05em;
        }
        .mc-info {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .mc-title {
          font-size: 1.2rem;
          font-weight: 800;
          margin-bottom: 6px;
          color: #2E241E;
          line-height: 1.3;
        }
        .mc-desc {
          font-size: 0.85rem;
          color: #7A695E;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }
        .mc-price {
          font-weight: 900;
          color: var(--color-primary, ${accentColor});
          font-size: 1.25rem;
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .mc-price small {
          color: #A39286;
          font-size: 0.75rem;
          text-decoration: line-through;
          font-weight: 500;
          margin-top: 2px;
        }
        .menu-all-link {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }
        .menu-all-link a {
          border: 2px solid var(--color-primary, ${accentColor});
          color: var(--color-primary, ${accentColor});
          border-radius: 99px;
          padding: 14px 40px;
          font-weight: 800;
          font-size: 14px;
          transition: all 0.3s ease;
          letter-spacing: 0.02em;
          background: transparent;
        }
        .menu-all-link a:hover {
          background: var(--color-primary, ${accentColor});
          color: white;
          box-shadow: 0 10px 25px -8px rgba(var(--color-primary-rgb, 107, 92, 83), 0.4);
          transform: translateY(-2px);
        }
      `}</style>
    </>
  )
}
