'use client'

import React from 'react'
import type { PublicStore, PublicProduct } from '@/lib/public-store'
import { LuxeCatalog } from '@/components/catalog/LuxeCatalog'
import { getEditableAttr } from '@/lib/editor-mapping'
import { TemplateExtraSections } from '@/components/templates/shared/TemplateExtraSections'
import '@/src/styles/luxeTemplate.css';
import { getNavItems } from '@/lib/navigation'
import { sanitizeColorValue, sanitizeCssUrlForInlineBackground, sanitizeFontValue, sanitizeRichHtml, sanitizeUrl } from '@/lib/customization-security'

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
  return '139, 92, 246'
}


interface TemplateProps { 
  store: PublicStore; 
  products: PublicProduct[];
  customizations?: Record<string, string>;
  previewMode?: boolean;
  categories?: any[];
}

export function LuxeTemplate({ store, products, customizations, previewMode, categories }: TemplateProps) {
  const navItems = getNavItems(store.slug, customizations)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const rawColor = store.warna_tema || '#8B5CF6' // Default violet
  const [primaryColor, secondaryColorRaw] = rawColor.split(',')
  const accentColor = sanitizeColorValue(primaryColor) || '#8B5CF6'
  const secondaryColor = sanitizeColorValue(secondaryColorRaw) || accentColor || '#C4B5FD'

  const heroTitle = customizations?.['hero.title'] || store.hero_title || 'Makeup harian, warna yang mudah dipakai.'
  const heroSub = customizations?.['hero.subtitle'] || store.deskripsi || 'Cek pilihan kosmetik, shade, dan harga. Order atau tanya stok langsung lewat WhatsApp.'
  const headingFont = sanitizeFontValue(store.font_heading) || 'Syne'
  const bodyFont = sanitizeFontValue(store.font_body) || 'Inter'
  const waNumber = store.no_wa || '6281234567890'
  const instagramUrl = sanitizeUrl(customizations?.['social.instagram_url'] || '')
  const heroBg = sanitizeCssUrlForInlineBackground(customizations?.['hero.bg_image_url'] || '')
  
  // Customizations
  const bentoImg2 = sanitizeUrl(customizations?.['hero.image2_url'] || store.hero_image_url) || '/template-previews/luxe-mobile.jpg'
  const bentoText2 = customizations?.['hero.image2_title'] || 'Flawless Base'
  const bentoImg3 = sanitizeUrl(customizations?.['hero.image3_url']) || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1000&auto=format&fit=crop'
  const bentoText3 = customizations?.['hero.image3_title'] || 'Statement Lips'
  
  const marqueeVisible = customizations?.['marquee.visible'] !== 'false'
  const marqueeText = customizations?.['marquee.text'] || 'INFO PRODUK - CEK SHADE - ORDER VIA WHATSAPP -'
  
  const valuesVisible = customizations?.['values.visible'] !== 'false'
  const val1Title = customizations?.['values.val1_title'] || 'Pilihan shade'
  const val1Desc = customizations?.['values.val1_desc'] || 'Tanyakan shade yang tersedia sebelum order agar warna yang dipilih lebih sesuai.'
  const val2Title = customizations?.['values.val2_title'] || 'Info produk jelas'
  const val2Desc = customizations?.['values.val2_desc'] || 'Setiap produk bisa dilengkapi foto, harga, deskripsi, dan stok.'
  const val3Title = customizations?.['values.val3_title'] || 'Order lewat WhatsApp'
  const val3Desc = customizations?.['values.val3_desc'] || 'Pembeli bisa bertanya dulu, lalu mengirim ringkasan pesanan ke admin toko.'
  
  const ctaVisible = customizations?.['cta.visible'] !== 'false'
  const ctaImg = sanitizeUrl(customizations?.['cta.image_url']) || '/template-previews/luxe-desktop.jpg'
  const ctaTitle = customizations?.['cta.title'] || 'Butuh rekomendasi produk?'
  const ctaDesc = customizations?.['cta.description'] || `<p>Hubungi admin ${store.nama_toko} untuk mengecek stok, shade, dan cara pakai produk.</p><p>Kami bantu pilihkan produk sesuai kebutuhan sebelum kamu order.</p>`
  
  const formatRp = (val: number) => 'Rp ' + val.toLocaleString('id-ID')
  
  // Format WA Message
  const getWaHref = (product?: PublicProduct) => {
    let msg = `Halo ${store.nama_toko}, saya ingin bertanya tentang produk Anda.`
    if (product) {
      msg = `Halo ${store.nama_toko}, saya tertarik dengan produk *${product.nama}* (${formatRp(product.harga)}). Apakah masih tersedia?`
    }
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="template-root" data-template="luxe" style={{
    '--dark': '#09090B',
    '--violet': accentColor,
    '--violet-hover': `${accentColor}cc`,
    '--violet-light': secondaryColor,
    '--light': '#FAFAFA',
    '--gray-muted': '#A1A1AA',
    '--border-color': 'rgba(255,255,255,0.08)',
    '--font-heading': `'${headingFont}', sans-serif`,
    '--font-body': `'${bodyFont}', sans-serif`,
    '--font-display': 'var(--font-heading)',
    '--color-primary': accentColor,
    '--color-secondary': secondaryColor,
    '--color-primary-rgb': hexToRgb(accentColor),
  } as React.CSSProperties}>
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={`https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:wght@700;800&family=${bodyFont.replace(/ /g, '+')}:wght@400;500;600&family=Syne:wght@700;800&display=swap`} rel="stylesheet" />

      <nav>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.nama_toko} style={{ maxHeight: '35px', objectFit: 'contain' }} />
              ) : (
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--violet)', fontSize: '22px' }}></i>
              )}
              <span className="font-serif tracking-tight">{store.nama_toko}<span>.</span></span>
          </div>
          <div className="nav-links">
              {navItems.map((item, idx) => (
                <a key={idx} href={item.href}>{item.label}</a>
              ))}
          </div>
          <a href={getWaHref()} target="_blank" rel="noopener noreferrer" className="btn-bold">Chat Admin</a>
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
      </nav>

      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>{item.label}</a>
          ))}
          <a href={getWaHref()} target="_blank" rel="noopener noreferrer" className="btn-mobile-wa" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="fa-brands fa-whatsapp"></i> Chat Admin
          </a>
      </div>

      <section 
        className="hero"
        style={heroBg ? {
          backgroundImage: `linear-gradient(to bottom, rgba(9,9,11,0.6), rgba(9,9,11,0.95)), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
          <div className="hero-bento">
              <div 
                className="bento-box box-1"
                style={heroBg ? {
                  background: 'rgba(24, 24, 27, 0.45)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.06)'
                } : undefined}
              >
                  <h1 {...getEditableAttr(previewMode, 'hero.title')} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(heroTitle) }} />
                  <p {...getEditableAttr(previewMode, 'hero.subtitle')}>{heroSub}</p>
                  <a href="#collections" className="btn-bold" style={{ width: 'fit-content' }}>Lihat katalog</a>
              </div>
              <div className="bento-box" {...getEditableAttr(previewMode, 'hero.image2_url')}>
                  <img src={bentoImg2} alt="Item Luxe" />
                  <div className="box-title" {...getEditableAttr(previewMode, 'hero.image2_title')}>{bentoText2}</div>
              </div>
              <div className="bento-box" {...getEditableAttr(previewMode, 'hero.image3_url')}>
                  <img src={bentoImg3} alt="Item Luxe" />
                  <div className="box-title" {...getEditableAttr(previewMode, 'hero.image3_title')}>{bentoText3}</div>
              </div>
          </div>
      </section>

      {marqueeVisible && (
        <div className="marquee" {...getEditableAttr(previewMode, 'marquee.text')}>
            <div className="marquee-content">
                <span>{marqueeText}</span>
                <span>{marqueeText}</span>
                <span>{marqueeText}</span>
                <span>{marqueeText}</span>
            </div>
            <div className="marquee-content" aria-hidden="true">
                <span>{marqueeText}</span>
                <span>{marqueeText}</span>
                <span>{marqueeText}</span>
                <span>{marqueeText}</span>
            </div>
        </div>
      )}

      {valuesVisible && (
        <section className="values" id="manifesto">
            <div className="v-box">
                <h2 {...getEditableAttr(previewMode, 'values.val1_title')}>{val1Title}</h2>
                <p {...getEditableAttr(previewMode, 'values.val1_desc')}>{val1Desc}</p>
            </div>
            <div className="v-box">
                <h2 {...getEditableAttr(previewMode, 'values.val2_title')}>{val2Title}</h2>
                <p {...getEditableAttr(previewMode, 'values.val2_desc')}>{val2Desc}</p>
            </div>
            <div className="v-box">
                <h2 {...getEditableAttr(previewMode, 'values.val3_title')}>{val3Title}</h2>
                <p {...getEditableAttr(previewMode, 'values.val3_desc')}>{val3Desc}</p>
            </div>
        </section>
      )}

      <section className="catalog" id="collections">
          <div className="cat-header">
              <h2>Katalog<br/>produk</h2>
              <div style={{color: 'var(--text-gray)', fontSize: '13px', fontWeight: 600, letterSpacing: '1px'}}>PILIH PRODUK</div>
          </div>
          <LuxeCatalog products={products} accentColor={accentColor} storeSlug={store.slug} />
      </section>

      {ctaVisible && (
        <section className="cta" id="contact">
            <div className="cta-img" {...getEditableAttr(previewMode, 'cta.image_url')}>
                <img src={ctaImg} alt="Consultation" loading="lazy" />
            </div>
            <div className="cta-text">
                <h2 {...getEditableAttr(previewMode, 'cta.title')}>{ctaTitle}</h2>
                <div {...getEditableAttr(previewMode, 'cta.description')} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(ctaDesc) }} />
                <a href={getWaHref()} target="_blank" rel="noopener noreferrer" className="btn-bold" style={{ width: 'fit-content', marginTop: '30px' }}>Tanya admin</a>
            </div>
        </section>
      )}

      <TemplateExtraSections
        store={store}
        customizations={customizations}
        previewMode={previewMode}
        tone="luxe"
        accentColor={accentColor}
      />

      <footer style={{ background: `linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%), ${accentColor}` }}>
          <div className="f-grid">
              <div className="f-col">
                  <div className="logo" style={{ marginBottom: '20px' }}>
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.nama_toko} style={{ maxHeight: '35px', objectFit: 'contain' }} />
                      ) : (
                        <>{store.nama_toko}<span>.</span></>
                      )}
                  </div>
                  <p style={{ color: '#52525B', fontSize: '13px', lineHeight: 1.7 }}>{store.deskripsi || 'Katalog kosmetik dengan pilihan produk, harga, dan stok yang bisa ditanyakan lewat WhatsApp.'}</p>
              </div>
              <div className="f-col">
                  <h4>Navigasi</h4>
                  <ul>
                      <li><a href={`/${store.slug}/produk`}>Katalog</a></li>
                      {valuesVisible && <li><a href="#manifesto">Info Produk</a></li>}
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
