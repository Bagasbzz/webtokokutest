'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { PublicProduct, PublicStore } from '@/lib/public-store'
import { toCommerceProduct, visibleCategories } from '@/lib/commerce-product'
import { useProductStore } from '@/store/useProductStore'
import { sanitizeColorValue, sanitizeFontValue } from '@/lib/customization-security'

export function ProductsIndexClient({ store, products }: { store: PublicStore; products: PublicProduct[] }) {
  const { openPDP } = useProductStore()
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [search, setSearch] = useState('')
  const categories = useMemo(() => ['Semua', ...visibleCategories(products)], [products])
  const filteredProducts = activeCategory === 'Semua'
    ? products
    : products.filter((product) => product.kategori === activeCategory)
  const visibleProducts = filteredProducts.filter((product) => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    return [product.nama, product.kategori, product.deskripsi]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query))
  })

  // Theme configuration berdasarkan template aktif
  const rawColor = store.warna_tema || ''
  const [primaryColor, secondaryColorRaw] = rawColor.split(',')
  
  let defaultPrimary = '#059669'
  let defaultBg = '#FAFAFA'
  let defaultTextColor = '#111111'
  let defaultHeadingFont = 'Inter'
  let defaultBodyFont = 'Inter'
  let isDark = false

  const templateName = (store.template || 'butik').toLowerCase()

  switch (templateName) {
    case 'butik':
      defaultPrimary = '#C5A059'
      defaultBg = '#0A0A0A'
      defaultTextColor = '#F5F5F5'
      defaultHeadingFont = 'Cinzel'
      defaultBodyFont = 'Montserrat'
      isDark = true
      break
    case 'luxe':
      defaultPrimary = '#8B5CF6'
      defaultBg = '#09090B'
      defaultTextColor = '#FAFAFA'
      defaultHeadingFont = 'Syne'
      defaultBodyFont = 'Inter'
      isDark = true
      break
    case 'dapur':
      defaultPrimary = '#D86B43'
      defaultBg = '#F5F2EB'
      defaultTextColor = '#2C2520'
      defaultHeadingFont = 'Playfair Display'
      defaultBodyFont = 'Plus Jakarta Sans'
      break
    case 'glow':
      defaultPrimary = '#059669'
      defaultBg = '#FAFAFA'
      defaultTextColor = '#111111'
      defaultHeadingFont = 'Playfair Display'
      defaultBodyFont = 'Inter'
      break
    case 'herba':
      defaultPrimary = '#2d6a4f'
      defaultBg = '#f8faf5'
      defaultTextColor = '#1f332b'
      defaultHeadingFont = 'Inter'
      defaultBodyFont = 'Inter'
      break
  }

  const pColor = sanitizeColorValue(primaryColor) || defaultPrimary
  const sColor = sanitizeColorValue(secondaryColorRaw) || pColor
  const headingFont = sanitizeFontValue(store.font_heading) || defaultHeadingFont
  const bodyFont = sanitizeFontValue(store.font_body) || defaultBodyFont

  // Inject CSS dynamic global variables
  const globalCss = `
    .storefront-index-root {
      --font-heading: '${headingFont}', serif;
      --font-body: '${bodyFont}', sans-serif;
      --color-primary: ${pColor};
      --color-secondary: ${sColor};
      --color-bg: ${defaultBg};
      --color-text: ${defaultTextColor};
      --color-border: ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
      --color-card-bg: ${isDark ? '#121214' : '#FFFFFF'};
      --color-input-bg: ${isDark ? '#18181B' : '#FFFFFF'};
      --color-muted: ${isDark ? '#A1A1AA' : '#627064'};
      
      font-family: var(--font-body);
      background-color: var(--color-bg);
      color: var(--color-text);
      min-height: 100vh;
    }
    .storefront-index-root h1, 
    .storefront-index-root h2, 
    .storefront-index-root h3, 
    .storefront-index-root .storefront-heading {
      font-family: var(--font-heading);
    }
    .storefront-search-input:focus {
      border-color: var(--color-primary) !important;
      box-shadow: 0 0 0 1px var(--color-primary);
    }
    .storefront-index-root input::placeholder {
      color: var(--color-muted);
      opacity: 0.6;
    }
  `

  const cardRadiusClass = 
    templateName === 'butik' ? 'rounded-none' : 
    templateName === 'herba' ? 'rounded-2xl' : 
    templateName === 'dapur' ? 'rounded-[24px]' : 
    'rounded-xl'

  const badgeClass = templateName === 'butik' ? 'rounded-none' : 'rounded-full'
  const badgeStyle = templateName === 'butik' 
    ? { backgroundColor: 'var(--color-primary)', color: isDark ? '#000000' : '#FFFFFF' }
    : { backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)', borderWidth: '1px' }

  return (
    <div className="storefront-index-root">
      <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={`https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;0,700;1,400&family=${bodyFont.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`} rel="stylesheet" />

      <header className="sticky top-0 z-20 border-b backdrop-blur-xl transition-colors" style={{ borderColor: 'var(--color-border)', backgroundColor: isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(250, 250, 250, 0.8)' }}>
        <nav className="mx-auto flex h-20 w-[min(1180px,calc(100%-32px))] items-center justify-between">
          <Link href={`/${store.slug}`} className={`font-bold tracking-tight storefront-heading text-lg ${templateName === 'butik' ? 'uppercase tracking-[0.2em]' : ''}`}>
            {store.nama_toko}
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold" style={{ color: 'var(--color-muted)' }}>
            <Link href={`/${store.slug}`} className="hover:opacity-80">Beranda</Link>
            <a href={`https://wa.me/${store.no_wa}`} target="_blank" rel="noreferrer" className="hover:opacity-80">WhatsApp</a>
          </div>
        </nav>
      </header>

      {(store.slug === 'demo' || store.slug === 'inidemo') && (
        <div className="mx-auto w-[min(1180px,calc(100%-32px))] pt-6">
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="text-amber-500">&#9888;&#65039;</span>
            <p className="text-xs font-semibold text-amber-800">Toko demo. Produk dan harga hanya untuk contoh tampilan.</p>
          </div>
        </div>
      )}

      <section className="mx-auto w-[min(1180px,calc(100%-32px))] py-12 md:py-18">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[.18em]" style={{ color: 'var(--color-primary)' }}>Produk</p>
            <h1 className="max-w-2xl text-4xl font-black leading-none tracking-tight md:text-6xl">
              Semua produk {store.nama_toko}.
            </h1>
          </div>
          {categories.length > 1 && (
            <div className="flex max-w-full flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`border px-4 py-2 text-sm font-bold transition ${templateName === 'butik' ? 'rounded-none' : 'rounded-full'}`}
                  style={activeCategory === category ? {
                    borderColor: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary)',
                    color: isDark ? '#000000' : '#FFFFFF'
                  } : {
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-card-bg)',
                    color: 'var(--color-muted)'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari produk..."
            className={`w-full border px-4 py-3 text-sm font-semibold outline-none transition storefront-search-input ${templateName === 'butik' ? 'rounded-none' : 'rounded-xl'}`}
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text)'
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => openPDP(toCommerceProduct(product))}
              className={`group overflow-hidden border text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${cardRadiusClass}`}
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-text)'
              }}
            >
              <div className="relative aspect-[4/5]" style={{ backgroundColor: isDark ? '#1f1f23' : '#eef2ea' }}>
                <Image
                  src={product.foto_url || '/template-previews/dapur-desktop.jpg'}
                  alt={product.nama}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                {product.badge_label && (
                  <span className={`absolute left-3 top-3 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.12em] shadow-sm ${badgeClass}`} style={badgeStyle}>
                    {product.badge_label}
                  </span>
                )}
              </div>
              <div className="p-4">
                {product.show_category !== false && product.kategori && (
                  <p className="mb-2 text-xs font-bold" style={{ color: 'var(--color-primary)' }}>{product.kategori}</p>
                )}
                <h2 className="line-clamp-2 text-base font-extrabold leading-tight">{product.nama}</h2>
                <div className="mt-3 flex flex-wrap items-baseline gap-2">
                  <p className="font-bold">Rp {product.harga.toLocaleString('id-ID')}</p>
                  {product.compare_at_price && product.compare_at_price > product.harga && (
                    <span className="text-xs font-semibold line-through" style={{ color: 'var(--color-muted)' }}>Rp {product.compare_at_price.toLocaleString('id-ID')}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        {visibleProducts.length === 0 && (
          <div className={`border p-8 text-center text-sm font-semibold ${templateName === 'butik' ? 'rounded-none' : 'rounded-2xl'}`} style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-muted)'
          }}>
            Tidak ada produk yang cocok.
          </div>
        )}
      </section>
    </div>
  )
}
