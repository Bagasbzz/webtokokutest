'use client'

import React from 'react';
import type { PublicStore, PublicProduct } from '@/lib/public-store';
import { DapurCatalog } from '@/components/catalog/DapurCatalog';
import { getEditableAttr } from '@/lib/editor-mapping';
import { getNavItems } from '@/lib/navigation';
import { TemplateExtraSections } from '@/components/templates/shared/TemplateExtraSections';
import { sanitizeColorValue, sanitizeCssUrlForInlineBackground, sanitizeRichHtml, sanitizeUrl } from '@/lib/customization-security';
import '@/src/styles/dapurTemplate.css';

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
  return '216, 107, 67'
}


interface TemplateProps { 
  store: PublicStore; 
  products: PublicProduct[];
  customizations?: Record<string, string>;
  previewMode?: boolean;
  categories?: any[];
}

export function DapurTemplate({ store, products, customizations, previewMode, categories }: TemplateProps) {
  const rawColor = store.warna_tema || '#D86B43';
  const [primaryColor, secondaryColorRaw] = rawColor.split(',');
  const accentColor = sanitizeColorValue(primaryColor) || '#D86B43';
  const secondaryColor = sanitizeColorValue(secondaryColorRaw) || accentColor || '#F97316';
  const navItems = getNavItems(store.slug, customizations);

  const heroTitle = customizations?.['hero.title'] || store.hero_title || 'Masakan rumahan siap dipesan.';
  const heroSub = customizations?.['hero.subtitle'] || store.deskripsi || 'Menu harian, paket makan, dan pesanan khusus bisa dicek langsung dari katalog.';
  const heroBg = sanitizeCssUrlForInlineBackground(customizations?.['hero.bg_image_url'] || '');
  const waNumber = store.no_wa || '6281234567890';
  const instagramUrl = sanitizeUrl(customizations?.['social.instagram_url'] || '');
  const heroImg = sanitizeUrl(customizations?.['hero.image_url'] || store.hero_image_url) || '/template-previews/dapur-desktop.jpg';
  const heroFloatImg = sanitizeUrl(customizations?.['hero.float_image_url']) || '/template-previews/dapur-mobile.jpg';
  const heroSpinText = customizations?.['hero.spin_text'] || 'DIMASAK FRESH SETIAP HARI -';

  const menuVisible = customizations?.['menu.visible'] !== 'false';
  const menuTitle = customizations?.['menu.title'] || 'Menu yang tersedia';
  const menuDesc = customizations?.['menu.description'] || 'Cek pilihan menu, harga, dan stok sebelum menghubungi admin.';

  const promoVisible = customizations?.['promo.visible'] !== 'false';
  const promoTitle = customizations?.['promo.title'] || 'Info pesanan';
  const promoImg = sanitizeUrl(customizations?.['promo.image_url']) || '/template-previews/dapur-desktop.jpg';
  const promoBadge = customizations?.['promo.badge'] || 'PESANAN HARI INI';
  const promoMainTitle = customizations?.['promo.main_title'] || 'Order<br/>rombongan';
  const promoMainDesc = customizations?.['promo.main_desc'] || 'Untuk acara kantor, keluarga, atau komunitas, hubungi admin agar jumlah dan jadwalnya bisa dicatat.';
  const promoBox1Title = customizations?.['promo.box1_title'] || 'Opsi kirim';
  const promoBox1Desc = customizations?.['promo.box1_desc'] || 'Pengiriman bisa disesuaikan dengan jarak dan jam produksi toko.';
  const promoBox2Title = customizations?.['promo.box2_title'] || 'Pesan via WA';
  const promoBox2Desc = customizations?.['promo.box2_desc'] || 'Tanya stok, jadwal masak, atau pesanan khusus langsung lewat WhatsApp.';

  const outletVisible = customizations?.['outlet.visible'] !== 'false';
  const outletTitle = customizations?.['outlet.title'] || 'Info toko';
  const outletSubtitle = customizations?.['outlet.subtitle'] || 'Cek area layanan dan hubungi admin sebelum order.';
  const outletCards = [1, 2, 3]
    .map((index) => ({
      name: customizations?.[`location.outlet${index}_name`] || (index === 1 ? store.nama_toko : ''),
      address: customizations?.[`location.outlet${index}_address`] || (index === 1 ? store.alamat : ''),
      hours: customizations?.[`location.outlet${index}_hours`] || '',
    }))
    .filter((outlet) => outlet.name || outlet.address || outlet.hours);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const formatRp = (val: number) => 'Rp ' + val.toLocaleString('id-ID');
  
  const getWaHref = (product?: PublicProduct) => {
    let msg = `Halo ${store.nama_toko}, saya ingin bertanya tentang produk Anda.`;
    if (product) {
      msg = `Halo ${store.nama_toko}, saya tertarik dengan produk *${product.nama}* (${formatRp(product.harga)}). Apakah masih tersedia?`;
    }
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="template-root" data-template="dapur" style={{
      '--accent-color': accentColor,
      '--accent-secondary-color': secondaryColor,
      '--color-primary': accentColor,
      '--color-secondary': secondaryColor,
      '--color-primary-rgb': hexToRgb(accentColor),
    } as React.CSSProperties}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={`https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap`} rel="stylesheet" />

      <nav>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {store.logo_url && (
            <img src={store.logo_url} alt={store.nama_toko} style={{ maxHeight: '45px', objectFit: 'contain' }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{store.nama_toko}</span>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-body)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '1.5px', marginTop: '2px', lineHeight: '1' }}>
              {store.kota ? `Dari ${store.kota}` : 'Cita Rasa Nusantara'}
            </span>
          </div>
        </div>
        <div className="nav-links">
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href}>{item.label}</a>
          ))}
        </div>
        <a href={getWaHref()} target="_blank" rel="noopener noreferrer" className="btn-wa-nav">
          <i className="fa-brands fa-whatsapp"></i> Order WA
        </a>
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
        className={`hero ${heroBg ? 'has-bg' : ''}`}
        style={heroBg ? {
          backgroundImage: `linear-gradient(to bottom, rgba(38,39,37,0.55), rgba(62,39,35,0.85)), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="hero-text">
          <h1 {...getEditableAttr(previewMode, 'hero.title')} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(heroTitle) }} />
          <p {...getEditableAttr(previewMode, 'hero.subtitle')}>{heroSub}</p>
          <div className="hero-btns">
            <a href="#menu" className="btn-dark">Lihat Menu</a>
            <a href={getWaHref()} target="_blank" rel="noopener noreferrer" className="btn-wa-lg"><i className="fa-solid fa-comment-dots"></i> Chat Admin</a>
          </div>
        </div>
        <div className="hero-media-container">
          <div className="hero-img-wrap">
            <div className="arch-img" {...getEditableAttr(previewMode, 'hero.image_url')}>
              <img src={heroImg} alt={store.nama_toko} />
            </div>
            <div className="float-img" {...getEditableAttr(previewMode, 'hero.float_image_url')}>
              <img src={heroFloatImg} alt="Mengambang" />
            </div>
            <div className="spin-badge" {...getEditableAttr(previewMode, 'hero.spin_text')}>
              <div className="spin-text">
                <svg viewBox="0 0 100 100">
                  <path d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" id="circle" fill="none" />
                  <text fontSize="13" fontWeight="800" fill="white" letterSpacing="2">
                    <textPath href="#circle">
                      {heroSpinText}
                    </textPath>
                  </text>
                </svg>
              </div>
              <i className="fa-solid fa-fire" style={{ fontSize: '28px' }}></i>
            </div>
          </div>
        </div>
      </section>

      {menuVisible && (
        <section className="menu-sec" id="menu">
          <div className="menu-header">
            <h2 {...getEditableAttr(previewMode, 'menu.title')} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(menuTitle) }} />
            <div className="menu-top-row">
              <p className="menu-desc" {...getEditableAttr(previewMode, 'menu.description')}>{menuDesc}</p>
            </div>
          </div>

          <div className="menu-grid">
            <DapurCatalog products={products} accentColor={accentColor} storeSlug={store.slug} />
          </div>
        </section>
      )}

      {promoVisible && (
        <section className="promo-sec" id="promo">
          <div className="promo-header">
            <h2 {...getEditableAttr(previewMode, 'promo.title')} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(promoTitle) }} />
          </div>
          <div className="promo-grid">
            <div className="promo-main">
              <img src={promoImg} alt="Promo" className="promo-main-bg" />
              <div className="promo-content">
                <div className="p-badge" {...getEditableAttr(previewMode, 'promo.badge')}><i className="fa-solid fa-tag"></i> {promoBadge}</div>
                <h3 {...getEditableAttr(previewMode, 'promo.main_title')} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(promoMainTitle) }} />
                <p {...getEditableAttr(previewMode, 'promo.main_desc')}>{promoMainDesc}</p>
              </div>
            </div>
            <div className="promo-side">
              <div className="promo-box">
                <div className="p-icon"><i className="fa-solid fa-truck-fast"></i></div>
                <h4 {...getEditableAttr(previewMode, 'promo.box1_title')}>{promoBox1Title}</h4>
                <p {...getEditableAttr(previewMode, 'promo.box1_desc')}>{promoBox1Desc}</p>
              </div>
              <div className="promo-box">
                <div className="p-icon"><i className="fa-solid fa-headset"></i></div>
                <h4 {...getEditableAttr(previewMode, 'promo.box2_title')}>{promoBox2Title}</h4>
                <p {...getEditableAttr(previewMode, 'promo.box2_desc')}>{promoBox2Desc}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {outletVisible && (
        <section className="outlet-sec" id="outlet">
          <div className="outlet-header">
            <h2 {...getEditableAttr(previewMode, 'outlet.title')}>{outletTitle}</h2>
            <p {...getEditableAttr(previewMode, 'outlet.subtitle')} style={{ color: 'var(--text-gray)', fontSize: '1.1rem' }}>{outletSubtitle}</p>
          </div>
          <div className="outlet-grid">
            {outletCards.map((outlet, index) => (
              <div className="outlet-card" key={`${outlet.name}-${index}`}>
                <h4>{outlet.name}</h4>
                <p>{[outlet.address, outlet.hours].filter(Boolean).join('. ')}</p>
                <a href={getWaHref()} target="_blank" rel="noopener noreferrer" className="btn-link-dark">
                  Chat Outlet <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <TemplateExtraSections
        store={store}
        customizations={customizations}
        previewMode={previewMode}
        tone="dapur"
        accentColor={accentColor}
      />



      <footer style={{ background: `linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%), ${accentColor}` }}>
        <div className="f-grid">
          <div className="f-top" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
            <div className="f-col">
              <div className="logo">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.nama_toko} style={{ maxHeight: '40px', objectFit: 'contain' }} />
                ) : (
                  store.nama_toko
                )}
              </div>
              <p className="f-desc" style={{ fontSize: '13px', lineHeight: 1.7 }}>{store.deskripsi || 'Menu rumahan yang bisa dipesan langsung lewat WhatsApp.'}</p>
            </div>
            <div className="f-col">
              <h5>Navigasi</h5>
              <ul>
                <li><a href={`/${store.slug}/produk`}>Semua Menu</a></li>
                {outletVisible && <li><a href="#outlet">Outlet Kami</a></li>}
                <li><a href="#contact">Kontak</a></li>
              </ul>
            </div>
            <div className="f-col">
              <h5>Hubungi Kami</h5>
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
            <div>&copy; {new Date().getFullYear()} {store.nama_toko}. Dibuat dengan <a href="/">webtokoku</a>.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
