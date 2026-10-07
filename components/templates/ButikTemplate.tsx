'use client'

import React from 'react'
import type { PublicStore, PublicProduct } from '@/lib/public-store'
import { ButikCatalog } from '@/components/catalog/ButikCatalog'
import { getEditableAttr } from '@/lib/editor-mapping'
import { TemplateExtraSections } from '@/components/templates/shared/TemplateExtraSections'
import '@/src/styles/butikTemplate.css';
import { getNavItems } from '@/lib/navigation'
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
  return '197, 160, 89'
}


interface TemplateProps { 
  store: PublicStore; 
  products: PublicProduct[];
  customizations?: Record<string, string>;
  previewMode?: boolean;
  categories?: any[];
}

export function ButikTemplate({ store, products, customizations, previewMode, categories }: TemplateProps) {
  const rawColor = store.warna_tema || '#C5A059' // Default gold
  const [primaryColor, secondaryColorRaw] = rawColor.split(',')
  const accentColor = sanitizeColorValue(primaryColor) || '#C5A059'
  const secondaryColor = sanitizeColorValue(secondaryColorRaw) || accentColor || '#E5C483'

  const heroTitle = customizations?.['hero.title'] || store.hero_title || store.nama_toko
  const heroSub = customizations?.['hero.subtitle'] || store.deskripsi || 'Pilihan pakaian dan aksesori yang mudah dipakai untuk acara harian maupun momen khusus.'
  const headingFont = sanitizeFontValue(store.font_heading) || 'Cinzel'
  const bodyFont = sanitizeFontValue(store.font_body) || 'Montserrat'
  const waNumber = store.no_wa || '6281234567890'
  const instagramUrl = sanitizeUrl(customizations?.['social.instagram_url'] || '')
  const heroImg = sanitizeUrl(customizations?.['hero.image_url'] || store.hero_image_url) || '/template-previews/butik-desktop.jpg'
  const heroBg = sanitizeCssUrlForInlineBackground(customizations?.['hero.bg_image_url'] || '')
  
  const navItems = getNavItems(store.slug, customizations)
  
  // Customization fields
  const splitVisible = customizations?.['split.visible'] !== 'false'
  const splitSubtitle = customizations?.['split.subtitle'] || 'Detail produk'
  const splitTitle = customizations?.['split.title'] || 'Bahan, potongan, dan ukuran'
  const splitDesc = customizations?.['split.description'] || 'Kami menampilkan detail bahan, ukuran, dan cara perawatan supaya pelanggan lebih mudah memilih sebelum order.'
  const splitImg = sanitizeUrl(customizations?.['split.image_url']) || '/template-previews/butik-mobile.jpg'
  
  const masterpieceVisible = customizations?.['masterpiece.visible'] !== 'false'
  const masterpieceImg = sanitizeUrl(customizations?.['masterpiece.image_url']) || '/template-previews/butik-desktop.jpg'
  const masterpieceTitle = customizations?.['masterpiece.title'] || 'Tentang koleksi'
  const masterpieceDesc = customizations?.['masterpiece.description'] || 'Koleksi disusun agar mudah dipadukan. Cek katalog untuk warna, ukuran, dan stok yang tersedia.'
  const formatRp = (val: number) => 'Rp ' + val.toLocaleString('id-ID')
  
  // Format WA Message
  const getWaHref = (product?: PublicProduct) => {
    let msg = `Halo ${store.nama_toko}, saya ingin bertanya tentang produk Anda.`
    if (product) {
      msg = `Halo ${store.nama_toko}, saya tertarik dengan produk *${product.nama}* (${formatRp(product.harga)}). Apakah masih tersedia?`
    }
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="template-root" data-template="butik" style={{
      '--gold': accentColor,
      '--gold-secondary': secondaryColor,
      '--color-primary': accentColor,
      '--color-secondary': secondaryColor,
      '--color-primary-rgb': hexToRgb(accentColor),
      '--font-heading': `'${headingFont}', serif`,
      '--font-body': `'${bodyFont}', sans-serif`
    } as React.CSSProperties}>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={`https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:wght@400;500;600;700&family=${bodyFont.replace(/ /g, '+')}:wght@300;400;500&display=swap`} rel="stylesheet" />

      <nav className={isScrolled ? 'scrolled' : ''}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {store.logo_url && (
                <img src={store.logo_url} alt={store.nama_toko} style={{ maxHeight: '35px', objectFit: 'contain' }} />
              )}
              <span>{store.nama_toko}</span>
          </div>
          <div className="nav-links">
              {navItems.map((item, idx) => (
                <a key={idx} href={item.href}>{item.label}</a>
              ))}
          </div>
          <div className="nav-icons">
              <a href={getWaHref()} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-whatsapp"></i></a>
          </div>
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
      </nav>

      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>{item.label}</a>
          ))}
          <a href={getWaHref()} target="_blank" rel="noopener noreferrer" className="btn-mobile-wa" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="fa-brands fa-whatsapp"></i> Order WA
          </a>
      </div>

      <section 
        className="hero"
        style={heroBg ? {
          backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.4), rgba(10,10,10,0.85)), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden'
        } : { overflow: 'hidden' }}
      >
          {!heroBg && <img className="hero-video" src={heroImg} alt={store.nama_toko} loading="lazy" {...getEditableAttr(previewMode, 'hero.image_url')} />}
          <div className="hero-overlay"></div>
          <div className="hero-content">
              {customizations?.['hero.badge'] && <span className="subtitle">{customizations['hero.badge']}</span>}
              <h1 {...getEditableAttr(previewMode, 'hero.title')}>{heroTitle}</h1>
              <p {...getEditableAttr(previewMode, 'hero.subtitle')}>{heroSub}</p>
              <a href="#collections" className="btn-gold">Lihat koleksi</a>
          </div>
      </section>

      <section className="collections" id="collections">
          <h2 className="sec-title">Katalog</h2>
          <div className="c-grid">
              <ButikCatalog products={products as any} storeSlug={store.slug} accentColor={accentColor} />
          </div>
      </section>

      {splitVisible && (
        <section className="split-sec" id="details">
            <div className="split-text">
                <span className="subtitle">{splitSubtitle}</span>
                <h2 {...getEditableAttr(previewMode, 'split.title')}>{splitTitle}</h2>
                <p {...getEditableAttr(previewMode, 'split.description')}>{splitDesc}</p>
                <a href={getWaHref()} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ width: 'fit-content' }}>Tanya via WhatsApp</a>
            </div>
            <div className="split-img" {...getEditableAttr(previewMode, 'split.image_url')}>
                <img src={splitImg} alt="Details" loading="lazy" />
            </div>
        </section>
      )}

      {masterpieceVisible && (
        <section className="masterpiece" id="about">
            <div className="video-box" {...getEditableAttr(previewMode, 'masterpiece.image_url')}>
                <img src={masterpieceImg} alt="Atelier" loading="lazy" />
                <div className="play-btn"><i className="fa-solid fa-play"></i></div>
            </div>
            <h2 className="m-title" {...getEditableAttr(previewMode, 'masterpiece.title')}>{masterpieceTitle}</h2>
            <p className="m-desc" {...getEditableAttr(previewMode, 'masterpiece.description')}>{masterpieceDesc}</p>
        </section>
      )}

      <TemplateExtraSections
        store={store}
        customizations={customizations}
        previewMode={previewMode}
        tone="butik"
        accentColor={accentColor}
      />

      <footer style={{ background: `linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%), ${accentColor}` }}>
          <div className="f-grid">
              <div className="f-col">
                  <div className="logo" style={{ marginBottom: '20px' }}>
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.nama_toko} style={{ maxHeight: '35px', objectFit: 'contain' }} />
                      ) : (
                        store.nama_toko
                      )}
                  </div>
                  <p style={{ color: '#666', fontSize: '13px', lineHeight: 1.7, fontWeight: 300 }}>{store.deskripsi || 'Katalog fashion yang bisa dipesan langsung lewat WhatsApp.'} {store.kota ? `Berbasis di ${store.kota}.` : ''}</p>
              </div>
              <div className="f-col">
                  <h4>Navigasi</h4>
                  <ul>
                      <li><a href={`/${store.slug}/produk`}>Katalog</a></li>
                      {splitVisible && <li><a href="#details">Info Detail</a></li>}
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
              &copy; {new Date().getFullYear()} {store.nama_toko}. Dibuat dengan <a href="/" style={{color: 'var(--gold)'}}>webtokoku</a>.
          </div>
      </footer>
    </div>
  )
}
