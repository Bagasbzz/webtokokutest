'use client'
import React from 'react'
import type { PublicStore, PublicProduct } from '@/lib/public-store'
import { getSectionAttr, getEditableAttr } from '@/lib/editor-mapping'
import { GlowHero } from '@/components/sections/glow/GlowHero'
import { GlowCatalog } from '@/components/sections/glow/GlowCatalog'
import { GlowReview } from '@/components/sections/glow/GlowReview'
import { getNavItems } from '@/lib/navigation'
import { TemplateExtraSections } from '@/components/templates/shared/TemplateExtraSections'
import { sanitizeColorValue, sanitizeCssUrlForInlineBackground, sanitizeFontValue, sanitizeUrl } from '@/lib/customization-security'

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
  return '5, 150, 105'
}


interface TemplateProps { 
  store: PublicStore; 
  products: PublicProduct[];
  customizations?: Record<string, string>;
  previewMode?: boolean;
  categories?: any[];
}

export function GlowTemplate({ store, products, customizations, previewMode, categories }: TemplateProps) {
  const heroTitle = customizations?.['hero.title'] || store.hero_title || store.nama_toko
  const heroSub = customizations?.['hero.subtitle'] || store.deskripsi || 'Produk perawatan kulit untuk rutinitas harian. Cek katalog dan tanyakan kecocokan produk lewat WhatsApp.'
  const heroImg = sanitizeUrl(customizations?.['hero.image_url'] || store.hero_image_url) || '/template-previews/glow-desktop.jpg'
  const heroBg = sanitizeCssUrlForInlineBackground(customizations?.['hero.bg_image_url'] || '')
  const textureImg = sanitizeUrl(customizations?.['hero.texture_image_url'] || '')
  const heroBadge = customizations?.['hero.badge'] || ''
  const heroNote1 = customizations?.['hero.note1'] || 'Tanpa parfum'
  const heroNote2 = customizations?.['hero.note2'] || 'Untuk pemakaian harian'
  const heroNote3 = customizations?.['hero.note3'] || 'Chat admin sebelum order'
  const catalogTitle = customizations?.['catalog.title'] || ''

  // Banner Info
  const bannerVisible = customizations?.['banner.visible'] !== 'false'
  const bannerTitle = customizations?.['banner.title'] || 'Pilih sesuai kebutuhan kulit'
  const bannerDesc = customizations?.['banner.description'] || 'Baca deskripsi produk dan tanyakan ke admin bila ragu memilih varian.'

  // Informasi / Routine
  const routineVisible = customizations?.['routine.visible'] !== 'false'
  const routineTitle = customizations?.['routine.title'] || 'Informasi Penting'
  const routineImg = sanitizeUrl(customizations?.['routine.image_url']) || '/template-previews/glow-desktop.jpg'
  const step1Title = customizations?.['routine.step1_title'] || 'Info produk'
  const step1Desc = customizations?.['routine.step1_desc'] || 'Setiap produk bisa dilengkapi deskripsi, harga, dan stok.'
  const step2Title = customizations?.['routine.step2_title'] || 'Layanan Pelanggan'
  const step2Desc = customizations?.['routine.step2_desc'] || 'Tim admin kami siap membantu pertanyaan dan keluhan Anda setiap hari kerja melalui WhatsApp.'
  const step3Title = customizations?.['routine.step3_title'] || 'Packing rapi'
  const step3Desc = customizations?.['routine.step3_desc'] || 'Tambahkan info pengemasan dan pengiriman agar pembeli lebih tenang.'

  // Reviews
  const reviewsVisible = customizations?.['reviews.visible'] !== 'false'
  const reviewsTitle = customizations?.['reviews.title'] || 'Catatan pelanggan'
  const instagramUrl = sanitizeUrl(customizations?.['social.instagram_url'] || '')
  
  const reviewsList = []
  for (let i = 1; i <= 6; i++) {
    const textKey = `reviews.item${i}_text`
    const nameKey = `reviews.item${i}_name`
    const text = customizations?.[textKey] || (i === 1 ? 'Teksturnya ringan, gampang dipakai pagi, dan kulitku keliatan lebih tenang.' : '')
    const name = customizations?.[nameKey] || (i === 1 ? 'Rani, Bandung' : '')
    if (text) {
      reviewsList.push({ text, author: name, index: i })
    }
  }
  
  // Format WA Message
  const waNumber = store.no_wa || '6281234567890'
  const getWaHref = () => {
    let msg = `Halo ${store.nama_toko}, saya ingin bertanya tentang produk skincare.`
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
  }

  // Theme Colors
  const rawColor = store.warna_tema || '#059669'
  const [primaryColor, secondaryColorRaw] = rawColor.split(',')
  const primaryThemeColor = sanitizeColorValue(primaryColor) || '#059669'
  const secondaryColor = sanitizeColorValue(secondaryColorRaw) || primaryThemeColor || '#10B981'

  // Styling
  const headingFont = sanitizeFontValue(store.font_heading) || 'Playfair Display'
  const bodyFont = sanitizeFontValue(store.font_body) || 'Inter'

  const navItems = getNavItems(store.slug, customizations)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const globalCss = `
    [data-template="glow"] {
      --font-heading: '${headingFont}', serif;
      --font-body: '${bodyFont}', sans-serif;
      --color-primary: ${primaryThemeColor};
      --color-secondary: ${secondaryColor};
    }
    html { scroll-behavior: smooth; }
    body { font-family: var(--font-body); background-color: #FAFAFA; color: #111; overflow-x: hidden; }
    h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
    
    .glow-nav-link {
      transition: all 0.3s ease;
    }
    .glow-nav-link:hover {
      color: var(--color-primary, #059669) !important;
    }
    .glow-wa-btn {
      color: var(--color-primary, #059669);
      border-color: var(--color-primary, #059669);
      transition: all 0.3s ease;
    }
    .glow-wa-btn:hover {
      color: var(--color-secondary, #10B981);
      border-color: var(--color-secondary, #10B981);
      opacity: 0.85;
    }
  `

  return (
    <div className="template-root bg-[#FAFAFA] min-h-screen" data-template="glow" style={{
      '--color-primary': primaryThemeColor,
      '--color-secondary': secondaryColor,
      '--color-primary-rgb': hexToRgb(primaryThemeColor),
      '--font-heading': `'${headingFont}', serif`,
      '--font-body': `'${bodyFont}', sans-serif`
    } as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={`https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;0,700;1,400&family=${bodyFont.replace(/ /g, '+')}:wght@300;400;500&display=swap`} rel="stylesheet" />

      {/* Minimalist Navbar */}
      <nav className="fixed top-0 w-full px-6 md:px-12 py-6 flex justify-between items-center z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 text-black">
        <div className="font-serif text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-3">
          {store.logo_url && (
            <img src={store.logo_url} alt={store.nama_toko} className="max-h-[35px] object-contain" />
          )}
          <span>{store.nama_toko}</span>
        </div>
        <div className="hidden md:flex gap-12 font-sans text-xs tracking-[0.2em] uppercase">
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} className="glow-nav-link hover:opacity-70">{item.label}</a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <a href={getWaHref()} target="_blank" rel="noopener noreferrer" className="glow-wa-btn font-sans text-[10px] md:text-xs tracking-widest uppercase border-b pb-0.5">
            Tanya produk
          </a>
          <button className="md:hidden text-black text-xl focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`fixed inset-y-0 right-0 w-[280px] bg-white border-l border-gray-100 z-[120] flex flex-col p-8 gap-6 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <span className="font-serif font-semibold tracking-tight text-lg text-black">
            {store.logo_url && (
              <img src={store.logo_url} alt={store.nama_toko} className="max-h-[30px] object-contain" />
            )}
            <span>{store.nama_toko}</span>
          </span>
          <button className="text-black text-xl" onClick={() => setIsMobileMenuOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="flex flex-col gap-6 text-sm tracking-widest uppercase font-medium mt-4 text-black">
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="glow-nav-link border-b border-gray-50 pb-2">{item.label}</a>
          ))}
          <a 
            href={getWaHref()} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="text-white py-3 rounded text-center tracking-widest uppercase font-semibold text-xs mt-4 transition-all duration-300"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Order WA
          </a>
        </div>
      </div>

      {/* Sections */}
      <div {...getSectionAttr(previewMode, 'hero')} className="pt-24">
        <GlowHero 
          title={heroTitle} 
          subtitle={heroSub} 
          imageUrl={heroImg} 
          storeName={store.nama_toko} 
          previewMode={previewMode}
          bgImageUrl={heroBg}
          textureImageUrl={textureImg}
          badge={heroBadge}
          note1={heroNote1}
          note2={heroNote2}
          note3={heroNote3}
        />
      </div>

      <div {...getSectionAttr(previewMode, 'catalog')}>
        <GlowCatalog 
          products={products} 
          storeSlug={store.slug} 
          title={catalogTitle}
          previewMode={previewMode}
        />
      </div>

      {/* Banner Section */}
      {bannerVisible && (
        <section className="py-24 px-6 md:px-12 text-center" style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }} {...getSectionAttr(previewMode, 'banner')}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight" {...getEditableAttr(previewMode, 'banner.title')}>
              {bannerTitle}
            </h2>
            <p className="text-base md:text-lg opacity-90 leading-relaxed font-light" {...getEditableAttr(previewMode, 'banner.description')}>
              {bannerDesc}
            </p>
          </div>
        </section>
      )}

      {/* Routine / Informasi Section */}
      {routineVisible && (
        <section className="py-32 px-6 md:px-12 bg-white text-black" {...getSectionAttr(previewMode, 'routine')}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 relative aspect-[4/5] rounded-[32px] overflow-hidden bg-[#FAF9F5] shadow-lg" {...getEditableAttr(previewMode, 'routine.image_url')}>
              <img 
                src={routineImg} 
                alt={routineTitle} 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="lg:col-span-7 flex flex-col gap-10">
              <h2 className="text-4xl md:text-5xl font-serif tracking-tight" {...getEditableAttr(previewMode, 'routine.title')}>
                {routineTitle}
              </h2>
              <div className="flex flex-col gap-8">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0" style={{ backgroundColor: `${primaryThemeColor}1a`, color: 'var(--color-primary)' }}>1</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2" {...getEditableAttr(previewMode, 'routine.step1_title')}>{step1Title}</h3>
                    <p className="text-gray-500 leading-relaxed" {...getEditableAttr(previewMode, 'routine.step1_desc')}>{step1Desc}</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0" style={{ backgroundColor: `${primaryThemeColor}1a`, color: 'var(--color-primary)' }}>2</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2" {...getEditableAttr(previewMode, 'routine.step2_title')}>{step2Title}</h3>
                    <p className="text-gray-500 leading-relaxed" {...getEditableAttr(previewMode, 'routine.step2_desc')}>{step2Desc}</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0" style={{ backgroundColor: `${primaryThemeColor}1a`, color: 'var(--color-primary)' }}>3</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2" {...getEditableAttr(previewMode, 'routine.step3_title')}>{step3Title}</h3>
                    <p className="text-gray-500 leading-relaxed" {...getEditableAttr(previewMode, 'routine.step3_desc')}>{step3Desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {reviewsVisible && (
        <div {...getSectionAttr(previewMode, 'reviews')}>
          <GlowReview 
            title={reviewsTitle}
            reviews={reviewsList}
            previewMode={previewMode}
          />
        </div>
      )}

      <TemplateExtraSections
        store={store}
        customizations={customizations}
        previewMode={previewMode}
        tone="glow"
        accentColor={primaryThemeColor}
      />

      {/* Minimalist Footer */}
      <footer className="glow-footer" style={{ 
        background: `linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%), ${primaryThemeColor}`
      }}>
        <div className="f-grid">
          <div className="f-col">
            <div className="font-serif text-2xl md:text-3xl mb-4">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.nama_toko} style={{ maxHeight: '40px', objectFit: 'contain' }} />
              ) : (
                store.nama_toko
              )}
            </div>
            <p className="text-gray-400 font-light leading-relaxed text-sm">
              {store.deskripsi || 'Katalog skincare dengan info produk yang ringkas dan mudah dicek.'}
            </p>
          </div>
          <div className="f-col">
            <h4>Navigasi</h4>
            <ul>
              <li><a href={`/${store.slug}/produk`}>Katalog</a></li>
              {routineVisible && <li><a href="#routine">Info Rutin</a></li>}
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
          &copy; {new Date().getFullYear()} {store.nama_toko}. Dibuat dengan <a href="/">webtokoku</a>.
        </div>
      </footer>
    </div>
  )
}
