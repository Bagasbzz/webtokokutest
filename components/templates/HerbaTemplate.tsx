'use client'
import React from 'react'
import type { PublicProduct, PublicStore } from '@/lib/public-store'
import { getSectionAttr } from '@/lib/editor-mapping'
import { BazzHero } from '@/components/sections/bazz/BazzHero'
import { BazzCatalog } from '@/components/sections/bazz/BazzCatalog'
import { BazzFeatures } from '@/components/sections/bazz/BazzFeatures'
import { getNavItems } from '@/lib/navigation'
import { TemplateExtraSections } from '@/components/templates/shared/TemplateExtraSections'
import { sanitizeColorValue, sanitizeCssUrlForInlineBackground, sanitizeFontValue, sanitizeUrl } from '@/lib/customization-security'
import '@/src/styles/herbaTemplate.css';

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
  return '45, 106, 79'
}


interface TemplateProps {
  store: PublicStore
  products: PublicProduct[]
  customizations?: Record<string, string>
  previewMode?: boolean
  categories?: any[]
}

export function HerbaTemplate({ store, products, customizations, previewMode, categories }: TemplateProps) {
  const heroTitle = customizations?.['hero.title'] || store.hero_title || 'Produk kesehatan siap dicek.'
  const heroSub = customizations?.['hero.subtitle'] || store.deskripsi || 'Lihat katalog produk, cek ketersediaan, dan hubungi admin sebelum membeli.'
  const heroImg = sanitizeUrl(customizations?.['hero.image_url'] || store.hero_image_url) || '/template-previews/herba-desktop.jpg'
  const heroBg = sanitizeCssUrlForInlineBackground(customizations?.['hero.bg_image_url'] || '')
  const heroBadge = customizations?.['hero.badge'] || ''

  const waNumber = store.no_wa || '6281234567890'
  const instagramUrl = sanitizeUrl(customizations?.['social.instagram_url'] || '')
  const getWaHref = () => {
    const msg = `Halo ${store.nama_toko}, saya ingin bertanya tentang produk kesehatan.`
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
  }

  // Theme Colors
  const rawColor = store.warna_tema || '#2d6a4f'
  const [primaryColor, secondaryColorRaw] = rawColor.split(',')
  const primaryThemeColor = sanitizeColorValue(primaryColor) || '#2d6a4f'
  const secondaryColor = sanitizeColorValue(secondaryColorRaw) || primaryThemeColor || '#40916c'

  const headingFont = sanitizeFontValue(store.font_heading) || 'Inter'
  const bodyFont = sanitizeFontValue(store.font_body) || 'Inter'
// CSS moved to external stylesheet (src/styles/herbaTemplate.css)
  const varCss = `
    [data-template="herba"] {
      --font-heading: '${headingFont}', sans-serif;
      --font-body: '${bodyFont}', sans-serif;
      --color-primary: ${primaryThemeColor};
      --color-secondary: ${secondaryColor};
    }
  `

  const navItems = getNavItems(store.slug, customizations)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <div className="template-root bg-[#f8faf5] min-h-screen text-[#1f332b]" data-template="herba" style={{
      '--color-primary': primaryThemeColor,
      '--color-secondary': secondaryColor,
      '--color-primary-rgb': hexToRgb(primaryThemeColor),
      '--font-heading': `'${headingFont}', sans-serif`,
      '--font-body': `'${bodyFont}', sans-serif`
    } as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: varCss }} />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={`https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:wght@400;500;600;700;800&family=${bodyFont.replace(/ /g, '+')}:wght@300;400;500;700&display=swap`} rel="stylesheet" />

      <nav className="herba-nav">
        <div className="font-bold tracking-tight text-xl flex items-center gap-2">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.nama_toko} style={{ maxHeight: '35px', objectFit: 'contain' }} />
          ) : (
            <img src="/template-assets/bazz-health-logo.svg" alt="" className="w-8 h-8 rounded-lg" />
          )}
          <span>{store.nama_toko}</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-semibold text-[#65746d]">
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} className="hover:text-[var(--color-primary)] transition-colors">{item.label}</a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <a 
            href={getWaHref()} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-bold text-white px-4 py-2 rounded-full transition-colors hidden sm:inline-block"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Tanya produk
          </a>
          <button className="md:hidden text-[#1f332b] text-xl focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`herba-drawer fixed inset-y-0 right-0 w-[280px] z-[120] flex flex-col p-8 gap-6 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center border-b border-[#193126]/10 pb-4">
          <span className="font-bold tracking-tight text-lg text-[#1f332b]">
            {store.logo_url && (
              <img src={store.logo_url} alt={store.nama_toko} className="max-h-[30px] object-contain" />
            )}
            <span>{store.nama_toko}</span>
          </span>
          <button className="text-[#1f332b] text-xl" onClick={() => setIsMobileMenuOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="flex flex-col gap-6 text-sm font-semibold mt-4 text-[#65746d]">
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] border-b border-gray-100 pb-2">{item.label}</a>
          ))}
          <a 
            href={getWaHref()} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="text-white py-3 rounded-full text-center font-bold text-xs mt-4 transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Order WA
          </a>
        </div>
      </div>

      <div {...getSectionAttr(previewMode, 'hero')} className="herba-hero">
        <BazzHero 
          title={heroTitle} 
          subtitle={heroSub} 
          imageUrl={heroImg} 
          previewMode={previewMode} 
          bgImageUrl={heroBg}
          badge={heroBadge}
        />
      </div>

      <div {...getSectionAttr(previewMode, 'catalog')}>
        <BazzCatalog products={products} storeSlug={store.slug} />
      </div>

      <div {...getSectionAttr(previewMode, 'features')}>
        <BazzFeatures customizations={customizations} previewMode={previewMode} />
      </div>

      <TemplateExtraSections
        store={store}
        customizations={customizations}
        previewMode={previewMode}
        tone="herba"
        accentColor={primaryThemeColor}
      />

      <footer className="herba-footer">
        <div className="f-grid">
          <div className="f-col">
            <div className="font-bold tracking-tight text-2xl mb-4">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.nama_toko} style={{ maxHeight: '40px', objectFit: 'contain' }} />
              ) : (
                store.nama_toko
              )}
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', lineHeight: 1.7 }}>
              {store.deskripsi || 'Katalog produk kesehatan dengan info singkat dan kontak WhatsApp.'}
            </p>
          </div>
          <div className="f-col">
            <h4>Navigasi</h4>
            <ul>
              <li><a href={`/${store.slug}/produk`}>Katalog</a></li>
              <li><a href="#features">Info Layanan</a></li>
              <li><a href="#contact">Kontak</a></li>
            </ul>
          </div>
          <div className="f-col">
            <h4>Hubungi Kami</h4>
            <ul>
              <li>
                <a href={getWaHref()} target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp" style={{ marginRight: '8px' }}></i> WhatsApp
                </a>
              </li>
              {instagramUrl && (
                <li>
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-instagram" style={{ marginRight: '8px' }}></i> Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="f-bottom">
          &copy; {new Date().getFullYear()} {store.nama_toko}. Dibuat dengan <a href="/" style={{ color: '#fff' }}>webtokoku</a>.
        </div>
      </footer>
    </div>
  )
}
