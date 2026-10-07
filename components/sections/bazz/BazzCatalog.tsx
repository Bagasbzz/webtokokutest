'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PublicProduct } from '@/lib/public-store'
import { useProductStore } from '@/store/useProductStore'
import { getHomepageProducts, toCommerceProduct, visibleCategories } from '@/lib/commerce-product'

interface BazzCatalogProps {
  products: PublicProduct[]
  storeSlug: string
}

const bazzEase = [0.32, 0.72, 0, 1] as const

export function BazzCatalog({ products, storeSlug }: BazzCatalogProps) {
  const { openPDP } = useProductStore()
  const [activeCategory, setActiveCategory] = useState('Semua')
  const safeProducts = products || []

  const categories = ['Semua', ...visibleCategories(safeProducts)]
  const baseProducts = activeCategory === 'Semua' ? safeProducts : safeProducts.filter((product) => product.kategori === activeCategory)
  const visibleProducts = getHomepageProducts(baseProducts, 6)

  if (safeProducts.length === 0) return null

  return (
    <section className="bazz-catalog" id="catalog">
      <div className="bazz-catalog-wrap">
        <div className="bazz-catalog-head">
          <div>
            <h2>Katalog Produk Herbal</h2>
          </div>
          {categories.length > 1 && (
            <div className="bazz-category-tabs">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category)
                  }}
                  className={activeCategory === category ? 'active' : ''}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bazz-product-grid">
          {visibleProducts.map((product, index) => {
            const hasDiscount = product.compare_at_price && product.compare_at_price > product.harga

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.05, ease: bazzEase }}
                onClick={() => {
                  openPDP(toCommerceProduct(product))
                }}
              >
                <div className="bazz-product-image">
                  <Image
                    src={product.foto_url || '/template-previews/herba-desktop.jpg'}
                    alt={product.nama}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 90vw, 280px"
                  />
                  {product.badge_label && <span className="bazz-product-badge">{product.badge_label}</span>}
                  {hasDiscount && <span className="bazz-discount-badge">PROMO</span>}
                </div>
                <div className="bazz-product-info">
                  {product.show_category !== false && product.kategori && (
                    <span className="bazz-cat-badge">{product.kategori}</span>
                  )}
                  <h3>{product.nama}</h3>
                  <p>{product.deskripsi || 'Herbal alami pilihan berkhasiat tinggi. Tanyakan detail produk atau resep kepada admin toko.'}</p>
                  
                  {/* Trust Badge Strip */}
                  <div className="bazz-trust-strip">
                    <span className="trust-pill">✓ 100% Organik</span>
                    <span className="trust-pill">✓ Teruji Klinis</span>
                  </div>

                  <strong className="mt-4">
                    Rp {product.harga.toLocaleString('id-ID')}
                    {hasDiscount && (
                      <small>Rp {product.compare_at_price!.toLocaleString('id-ID')}</small>
                    )}
                  </strong>
                </div>
              </motion.article>
            )
          })}
        </div>

        <div className="bazz-show-more">
          <Link href={`/${storeSlug}/produk`}>Lihat semua produk</Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bazz-catalog {
          padding: clamp(80px, 12vw, 140px) clamp(20px, 5vw, 72px);
          background: #F4F8F5;
          color: #1A3026;
        }
        .bazz-catalog-wrap {
          width: min(1200px, 100%);
          margin: 0 auto;
        }
        .bazz-catalog-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 48px;
          border-bottom: 2px solid rgba(25, 49, 38, 0.05);
          padding-bottom: 24px;
        }
        .bazz-catalog-head span {
          display: inline-block;
          margin-bottom: 10px;
          color: var(--color-primary, #2d6a4f);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .15em;
          text-transform: uppercase;
        }
        .bazz-catalog-head h2 {
          margin: 0;
          font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1.1;
          font-weight: 800;
          color: #13251D;
        }
        .bazz-category-tabs {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
        }
        .bazz-category-tabs button {
          min-height: 40px;
          padding: 8px 20px;
          border-radius: 999px;
          border: 1px solid rgba(25,49,38,.12);
          background: #FAFDFB;
          color: #4C5C54;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .bazz-category-tabs button:hover {
          border-color: var(--color-primary, #2d6a4f);
          color: var(--color-primary, #2d6a4f);
        }
        .bazz-category-tabs button.active {
          background: var(--color-primary, #2d6a4f);
          color: #ffffff;
          border-color: var(--color-primary, #2d6a4f);
          box-shadow: 0 10px 20px -6px rgba(45, 106, 79, 0.3);
        }
        .bazz-product-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }
        .bazz-product-grid article {
          overflow: hidden;
          border-radius: 20px;
          background: #FFFFFF;
          border: 1px solid rgba(25, 49, 38, 0.06);
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(25, 49, 38, 0.03);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          display: flex;
          flex-direction: column;
        }
        .bazz-product-grid article:hover {
          transform: translateY(-6px);
          box-shadow: 0 25px 50px -15px rgba(25, 49, 38, 0.1);
          border-color: rgba(var(--color-primary-rgb, 45, 106, 79), 0.3);
        }
        .bazz-product-image {
          position: relative;
          aspect-ratio: 1.1;
          background: #FAFDFB;
          border-bottom: 1px solid rgba(25, 49, 38, 0.03);
        }
        .bazz-product-image img {
          padding: 24px;
          transition: transform 0.6s ease;
        }
        .bazz-product-grid article:hover .bazz-product-image img {
          transform: scale(1.03);
        }
        .bazz-product-badge {
          position: absolute;
          left: 14px;
          top: 14px;
          z-index: 2;
          border-radius: 999px;
          background: var(--color-primary, #2d6a4f);
          color: #fff;
          padding: 5px 12px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .bazz-discount-badge {
          position: absolute;
          right: 14px;
          top: 14px;
          z-index: 2;
          border-radius: 999px;
          background: var(--color-secondary, #40916c);
          color: #fff;
          padding: 5px 12px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .bazz-product-info {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .bazz-cat-badge {
          display: inline-flex;
          margin-bottom: 8px;
          color: var(--color-primary, #2d6a4f);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }
        .bazz-product-info h3 {
          margin: 0 0 10px;
          color: #13251D;
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.35;
        }
        .bazz-product-info p {
          min-height: 40px;
          margin: 0 0 16px;
          color: #5A6D63;
          font-size: 13px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Trust strip style */
        .bazz-trust-strip {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 12px;
          margin-top: auto;
        }
        .trust-pill {
          background: #EAF4EE;
          color: var(--color-primary, #2d6a4f);
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.02em;
        }
        
        .bazz-product-info strong {
          color: #13251D;
          font-size: 1.15rem;
          font-weight: 800;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: baseline;
        }
        .bazz-product-info strong small {
          color: #8C9E94;
          font-size: .8rem;
          text-decoration: line-through;
          font-weight: 500;
        }
        .bazz-show-more {
          display: flex;
          justify-content: center;
          margin-top: 50px;
        }
        .bazz-show-more a {
          min-height: 48px;
          padding: 12px 36px;
          border-radius: 999px;
          border: 1px solid var(--color-primary, #2d6a4f);
          background: transparent;
          color: var(--color-primary, #2d6a4f);
          font-weight: 800;
          font-size: 13px;
          transition: all 0.3s ease;
        }
        .bazz-show-more a:hover {
          background: var(--color-primary, #2d6a4f);
          color: #ffffff;
          box-shadow: 0 10px 20px -6px rgba(45, 106, 79, 0.3);
          transform: translateY(-2px);
        }
        
        @media (max-width: 1080px) {
          .bazz-product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 820px) {
          .bazz-catalog-head { align-items: flex-start; flex-direction: column; gap: 14px; }
          .bazz-category-tabs { justify-content: flex-start; }
          .bazz-product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        }
        @media (max-width: 560px) {
          .bazz-product-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </section>
  )
}
