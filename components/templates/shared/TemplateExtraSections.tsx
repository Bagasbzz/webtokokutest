'use client'

import React from 'react'
import type { PublicStore, PublicProduct } from '@/lib/public-store'
import { getEditableAttr, getSectionAttr } from '@/lib/editor-mapping'
import Image from 'next/image'
import { sanitizeColorValue, sanitizeUrl } from '@/lib/customization-security'

type TemplateTone = 'butik' | 'dapur' | 'glow' | 'luxe' | 'herba'

interface TemplateExtraSectionsProps {
  store: PublicStore
  customizations?: Record<string, string>
  previewMode?: boolean
  tone: TemplateTone
  accentColor?: string
  products?: PublicProduct[]
}

function pick(customizations: Record<string, string> | undefined, key: string, fallback = '') {
  const val = customizations?.[key]
  return val !== undefined && val !== null && val.trim() !== '' ? val : fallback
}

function visible(customizations: Record<string, string> | undefined, key: string, defaultVisible = true) {
  const value = customizations?.[key]
  if (value === undefined) return defaultVisible
  return value !== 'false'
}

function youtubeEmbed(url: string) {
  const trimmed = sanitizeUrl(url, 'video')
  if (!trimmed) return ''
  const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : ''
}

function mapsEmbed(url: string) {
  const trimmed = sanitizeUrl(url, 'link')
  if (!trimmed) return ''
  if (trimmed.includes('output=embed')) return trimmed
  if (trimmed.includes('google.com/maps') && trimmed.includes('/maps/embed')) return trimmed
  if (trimmed.includes('google.com/maps')) {
    return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`
  }
  return ''
}

const DEFAULT_GALLERY_IMAGES: Record<TemplateTone, string[]> = {
  butik: [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop',
  ],
  dapur: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=1000&auto=format&fit=crop',
  ],
  glow: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop',
  ],
  luxe: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000&auto=format&fit=crop',
  ],
  herba: [
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=1000&auto=format&fit=crop',
  ],
}

const DEFAULT_DOC_IMAGES: Record<TemplateTone, string> = {
  butik: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
  dapur: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop',
  glow: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1200&auto=format&fit=crop',
  luxe: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=1200&auto=format&fit=crop',
  herba: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop',
}

function getToneCopy(tone: TemplateTone) {
  const copy = {
    butik: {
      kicker: 'curated note',
      promoFallback: 'Konsultasi styling gratis untuk pembelian koleksi pilihan.',
      reviewLabel: 'Client words',
      docsLabel: 'Lookbook & dokumentasi',
      locationLabel: 'Private visit',
    },
    dapur: {
      kicker: 'promo dapur',
      promoFallback: 'Paket hemat untuk keluarga dan pesanan acara. Bisa request menu via WhatsApp.',
      reviewLabel: 'Kata pelanggan',
      docsLabel: 'Galeri masakan',
      locationLabel: 'Lokasi dapur',
    },
    glow: {
      kicker: 'skin journal',
      promoFallback: 'Bundling routine mingguan untuk bantu pelanggan mulai dari basic skincare.',
      reviewLabel: 'Skin notes',
      docsLabel: 'Dokumentasi produk',
      locationLabel: 'Studio pickup',
    },
    luxe: {
      kicker: 'limited offer',
      promoFallback: 'Bundle complexion dan lip series dengan bonus konsultasi shade.',
      reviewLabel: 'Beauty notes',
      docsLabel: 'Campaign gallery',
      locationLabel: 'Visit counter',
    },
    herba: {
      kicker: 'care protocol',
      promoFallback: 'Paket vitamin dan kebutuhan kesehatan keluarga dengan konsultasi admin.',
      reviewLabel: 'Patient feedback',
      docsLabel: 'Info & dokumentasi',
      locationLabel: 'Lokasi layanan',
    },
  }
  return copy[tone]
}

export function TemplateExtraSections({
  store,
  customizations,
  previewMode = false,
  tone,
  accentColor = '#16a34a',
}: TemplateExtraSectionsProps) {
  const safeAccentColor = sanitizeColorValue(accentColor) || '#16a34a'
  const toneCopy = getToneCopy(tone)
  const promoVisible = visible(customizations, 'promo_banner.visible', true)
  const reviewsVisible = visible(customizations, 'reviews.visible', true)
  const galleryVisible = visible(customizations, 'gallery.visible', true)
  const docsVisible = visible(customizations, 'docs.visible', true)
  const locationVisible = visible(customizations, 'location.visible', true)
  const contactVisible = visible(customizations, 'contact.visible', true)
  const faqVisible = visible(customizations, 'faq.visible', true)
  const faqTitle = pick(customizations, 'faq.title', 'Pertanyaan Umum')

  const faqs = [1, 2, 3].map((index) => ({
    q: pick(customizations, `faq.q${index}`, [
      'Bagaimana cara melakukan pemesanan?',
      'Apakah melayani pengiriman ke seluruh Indonesia?',
      'Metode pembayaran apa saja yang didukung?'
    ][index - 1]),
    a: pick(customizations, `faq.a${index}`, [
      'Pilih produk yang diinginkan, tambahkan ke keranjang, isi data pengiriman, dan lakukan checkout. Detail pesanan akan dikirim langsung ke WhatsApp kami.',
      'Ya, kami melayani pengiriman ke seluruh wilayah di Indonesia menggunakan kurir terpercaya.',
      'Kami mendukung transfer bank manual, pembayaran instan QRIS, serta COD (tergantung kesepakatan via WhatsApp).'
    ][index - 1]),
  })).filter(faq => faq.q || faq.a)

  const defaultPromoFallbackImage = DEFAULT_DOC_IMAGES[tone] || ''
  const promoImage = sanitizeUrl(pick(customizations, 'promo_banner.image_url', store.hero_image_url || defaultPromoFallbackImage))
  const promoTitle = pick(customizations, 'promo_banner.title', 'Promo spesial minggu ini')
  const promoDesc = pick(customizations, 'promo_banner.description', toneCopy.promoFallback)
  const promoCode = pick(customizations, 'promo_banner.code', 'WEBTOKOKU')

  const reviews = [1, 2, 3, 4, 5, 6]
    .map((index) => ({
      name: pick(customizations, `reviews.item${index}_name`, index <= 3 ? ['Nadia', 'Bagas', 'Sari'][index - 1] : ''),
      text: pick(customizations, `reviews.item${index}_text`, index <= 3 ? [
        'Adminnya responsif, pilihan produknya jelas, dan proses order gampang.',
        'Tampilan tokonya enak dilihat. Saya langsung tahu harus klik ke mana.',
        'Produk sampai sesuai ekspektasi dan komunikasinya rapi dari awal.',
      ][index - 1] : ''),
    }))
    .filter((item) => item.name || item.text)

  const galleryItems = [1, 2, 3].map((index) => {
    const toneDefaults = DEFAULT_GALLERY_IMAGES[tone] || DEFAULT_GALLERY_IMAGES['butik']
    const fallbackImage = toneDefaults[index - 1] || ''
    return {
      image: sanitizeUrl(pick(customizations, `gallery.image${index}_url`, fallbackImage)),
      caption: pick(customizations, `gallery.image${index}_caption`, ['Behind the scene', 'Produk favorit', 'Pesanan pelanggan'][index - 1]),
    }
  })

  const youtubeUrl = pick(customizations, 'docs.youtube_url')
  const youtubeSrc = youtubeEmbed(youtubeUrl)
  const articleTitle = pick(customizations, 'docs.article_title', 'Panduan memilih produk yang tepat')
  const articleUrl = sanitizeUrl(pick(customizations, 'docs.article_url'))
  const docsImage = sanitizeUrl(pick(customizations, 'docs.image_url', DEFAULT_DOC_IMAGES[tone] || ''))

  const mapUrl = pick(customizations, 'location.map_url')
  const mapSrc = mapsEmbed(mapUrl)
  const address = pick(customizations, 'location.address', store.kota ? `${store.kota}, Indonesia` : 'Alamat toko belum diisi')

  const outlets = [1, 2, 3, 4]
    .map((index) => ({
      name: pick(customizations, `location.outlet${index}_name`, index === 1 ? 'Cabang utama' : ''),
      address: pick(customizations, `location.outlet${index}_address`, index === 1 ? address : ''),
      hours: pick(customizations, `location.outlet${index}_hours`, index === 1 ? 'Jam operasional mengikuti toko' : ''),
    }))
    .filter((outlet) => outlet.name || outlet.address || outlet.hours)

  const instagramUrl = sanitizeUrl(pick(customizations, 'social.instagram_url'))
  const tiktokUrl = sanitizeUrl(pick(customizations, 'social.tiktok_url'))
  const waNumber = store.no_wa || ''
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo ${store.nama_toko}, saya ingin bertanya.`)}` : '#'

  const getRomanNumeral = (idx: number) => {
    const numerals = ['I', 'II', 'III', 'IV']
    return numerals[idx] || (idx + 1).toString()
  }

  // Determine if there is actually video or image documentation available to render
  const hasDocContent = youtubeSrc || docsImage

  return (
    <div className={`wtk-extra wtk-extra-${tone}`} style={{ '--wtk-accent': safeAccentColor } as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: extraCss }} />

      {/* --- PROMO SECTION --- */}
      {promoVisible && tone !== 'dapur' && (
        <section id="promo_banner" className="wtk-extra-section wtk-promo" {...getSectionAttr(previewMode, 'promo_banner')}>
          <div className="wtk-promo-copy">
            <h2 {...getEditableAttr(previewMode, 'promo_banner.title')}>{promoTitle}</h2>
            <p {...getEditableAttr(previewMode, 'promo_banner.description')}>{promoDesc}</p>
            <div className="wtk-code" {...getEditableAttr(previewMode, 'promo_banner.code')}>
              <span>Kode</span>
              <strong>{promoCode}</strong>
            </div>
          </div>
          <div className="wtk-promo-media" {...getEditableAttr(previewMode, 'promo_banner.image_url')}>
            {promoImage ? (
              <Image src={promoImage} alt={promoTitle} width={1200} height={750} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : previewMode ? (
              <div className="wtk-empty-media">Upload banner promo</div>
            ) : null}
          </div>
        </section>
      )}

      {/* --- REVIEWS SECTION --- */}
      {reviewsVisible && reviews.length > 0 && tone !== 'glow' && (
        <section id="reviews" className="wtk-extra-section" {...getSectionAttr(previewMode, 'reviews')}>
          <div className="wtk-section-head">
            <h2 {...getEditableAttr(previewMode, 'reviews.title')}>{pick(customizations, 'reviews.title', 'Ulasan pelanggan')}</h2>
            <p {...getEditableAttr(previewMode, 'reviews.subtitle')}>{pick(customizations, 'reviews.subtitle', 'Tambahkan testimoni asli pelanggan agar toko terasa lebih meyakinkan.')}</p>
          </div>
          <div className="wtk-review-grid">
            {reviews.map((review, index) => (
              <article className="wtk-review-card" key={index}>
                <p {...getEditableAttr(previewMode, `reviews.item${index + 1}_text`)}>{review.text}</p>
                <div className="wtk-review-meta">
                  <div className="wtk-review-stars">5/5</div>
                  <strong {...getEditableAttr(previewMode, `reviews.item${index + 1}_name`)}>{review.name}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* --- GALLERY SECTION (Mandiri) --- */}
      {galleryVisible && (
        <section id="gallery" className="wtk-extra-section wtk-gallery-only" {...getSectionAttr(previewMode, 'gallery')}>
          <div className="wtk-section-head">
            <h2 {...getEditableAttr(previewMode, 'gallery.title')}>{pick(customizations, 'gallery.title', 'Galeri toko')}</h2>
            <p {...getEditableAttr(previewMode, 'gallery.subtitle')}>{pick(customizations, 'gallery.subtitle', 'Tampilkan suasana toko, proses packing, katalog, atau dokumentasi pelanggan.')}</p>
          </div>

          {/* Template specific layout signatures for Gallery */}
          {tone === 'luxe' ? (
            <div className="wtk-gallery-bento">
              <figure className="wtk-gallery-item bento-item-1">
                <div {...getEditableAttr(previewMode, 'gallery.image1_url')}>
                  {galleryItems[0].image ? (
                    <Image src={galleryItems[0].image} alt={galleryItems[0].caption} width={900} height={1100} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : previewMode ? (
                    <div className="wtk-empty-media">Foto 1</div>
                  ) : null}
                </div>
                <figcaption {...getEditableAttr(previewMode, 'gallery.image1_caption')}>{galleryItems[0].caption}</figcaption>
              </figure>
              <figure className="wtk-gallery-item bento-item-2">
                <div {...getEditableAttr(previewMode, 'gallery.image2_url')}>
                  {galleryItems[1].image ? (
                    <Image src={galleryItems[1].image} alt={galleryItems[1].caption} width={900} height={650} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : previewMode ? (
                    <div className="wtk-empty-media">Foto 2</div>
                  ) : null}
                </div>
                <figcaption {...getEditableAttr(previewMode, 'gallery.image2_caption')}>{galleryItems[1].caption}</figcaption>
              </figure>
              <figure className="wtk-gallery-item bento-item-3">
                <div {...getEditableAttr(previewMode, 'gallery.image3_url')}>
                  {galleryItems[2].image ? (
                    <Image src={galleryItems[2].image} alt={galleryItems[2].caption} width={900} height={650} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : previewMode ? (
                    <div className="wtk-empty-media">Foto 3</div>
                  ) : null}
                </div>
                <figcaption {...getEditableAttr(previewMode, 'gallery.image3_caption')}>{galleryItems[2].caption}</figcaption>
              </figure>
            </div>
          ) : tone === 'glow' ? (
            <div className="wtk-gallery-editorial">
              {galleryItems.map((item, index) => (
                <figure className={`wtk-gallery-item editorial-item-${index + 1}`} key={index}>
                  <div {...getEditableAttr(previewMode, `gallery.image${index + 1}_url`)}>
                    {item.image ? (
                      <img src={item.image} alt={item.caption} />
                    ) : previewMode ? (
                      <div className="wtk-empty-media">Foto {index + 1}</div>
                    ) : null}
                  </div>
                  <figcaption {...getEditableAttr(previewMode, `gallery.image${index + 1}_caption`)}>{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          ) : tone === 'dapur' ? (
            <div className="wtk-gallery-polaroid">
              {galleryItems.map((item, index) => (
                <figure className={`wtk-gallery-item polaroid-item-${index + 1}`} key={index}>
                  <div className="polaroid-wrapper">
                    <div className="polaroid-img" {...getEditableAttr(previewMode, `gallery.image${index + 1}_url`)}>
                      {item.image ? (
                        <img src={item.image} alt={item.caption} />
                      ) : previewMode ? (
                        <div className="wtk-empty-media">Foto {index + 1}</div>
                      ) : null}
                    </div>
                    <figcaption className="polaroid-caption" {...getEditableAttr(previewMode, `gallery.image${index + 1}_caption`)}>{item.caption}</figcaption>
                  </div>
                </figure>
              ))}
            </div>
          ) : (
            <div className="wtk-gallery-grid">
              {galleryItems.map((item, index) => (
                <figure className="wtk-gallery-item" key={index}>
                  <div {...getEditableAttr(previewMode, `gallery.image${index + 1}_url`)}>
                    {item.image ? (
                      <img src={item.image} alt={item.caption} />
                    ) : previewMode ? (
                      <div className="wtk-empty-media">Foto {index + 1}</div>
                    ) : null}
                  </div>
                  <figcaption {...getEditableAttr(previewMode, `gallery.image${index + 1}_caption`)}>{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      )}

      {/* --- DOCUMENTATION SECTION (Mandiri) --- */}
      {docsVisible && (hasDocContent || previewMode) && (
        <section id="docs" className="wtk-extra-section wtk-docs-only" {...getSectionAttr(previewMode, 'docs')}>
          <div className="wtk-section-head">
            <h2 {...getEditableAttr(previewMode, 'docs.title')}>{pick(customizations, 'docs.title', 'Dokumentasi & panduan')}</h2>
          </div>
          <div className="wtk-docs-content">
            {youtubeSrc ? (
              <div className="wtk-video-wrapper">
                <iframe src={youtubeSrc} title="Dokumentasi video" allowFullScreen />
              </div>
            ) : docsImage ? (
              <div className="wtk-docs-img-wrapper">
                <Image src={docsImage} alt="Dokumentasi" width={1200} height={675} unoptimized {...getEditableAttr(previewMode, 'docs.image_url')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : previewMode ? (
              <div className="wtk-map-help" {...getEditableAttr(previewMode, 'docs.youtube_url')}>Tempel link YouTube untuk menampilkan video dokumentasi.</div>
            ) : null}
            {articleUrl && (
              <div className="wtk-docs-link">
                <a href={articleUrl} target="_blank" rel="noopener noreferrer" {...getEditableAttr(previewMode, 'docs.article_title')}>
                  {tone === 'butik' ? <i className="fa-solid fa-arrow-right" style={{ marginRight: '8px', color: '#C5A059' }}></i> : ''}
                  {tone === 'dapur' ? <i className="fa-solid fa-utensils" style={{ marginRight: '8px' }}></i> : ''}
                  {articleTitle}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* --- LOCATION SECTION (Split Grid) --- */}
      {locationVisible && (
        <section id="location" className="wtk-extra-section wtk-location-only" {...getSectionAttr(previewMode, 'location')}>
          <div className="wtk-location-grid">
            <div className="wtk-location-info">
              <h2 {...getEditableAttr(previewMode, 'location.title')}>{pick(customizations, 'location.title', 'Kunjungi atau hubungi toko')}</h2>
              <p className="wtk-main-address" {...getEditableAttr(previewMode, 'location.address')}>{address}</p>

              {outlets.length > 0 && (
                <div className="wtk-outlet-list">
                  {outlets.map((outlet, index) => (
                    <article className="wtk-outlet-card" key={index}>
                      <strong {...getEditableAttr(previewMode, `location.outlet${index + 1}_name`)}>
                        {tone === 'butik' ? `OUTLET ${getRomanNumeral(index)} / ` : ''}
                        {tone === 'dapur' ? <i className="fa-solid fa-store" style={{ marginRight: '8px', color: 'var(--wtk-accent)' }}></i> : ''}
                        {outlet.name}
                      </strong>
                      <p {...getEditableAttr(previewMode, `location.outlet${index + 1}_address`)}>{outlet.address}</p>
                      {outlet.hours && (
                        <span {...getEditableAttr(previewMode, `location.outlet${index + 1}_hours`)}>
                          {tone === 'dapur' ? <i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i> : ''}
                          {outlet.hours}
                        </span>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="wtk-location-map">
              {mapSrc ? (
                <iframe src={mapSrc} title="Lokasi toko" loading="lazy" />
              ) : previewMode ? (
                <div className="wtk-map-help" {...getEditableAttr(previewMode, 'location.map_url')}>
                  Buka Google Maps, klik Share, pilih Embed a map atau salin link lokasi, lalu tempel di field Map.
                </div>
              ) : <div className="wtk-no-map">Peta lokasi tidak tersedia</div>}
            </div>
          </div>
        </section>
      )}

      {/* --- CONTACT CTA SECTION (Premium Banner) --- */}
      {contactVisible && (
        <section id="contact" className="wtk-extra-section wtk-contact-cta" {...getSectionAttr(previewMode, 'contact')}>
          <div className="wtk-contact-cta-box">
            <h2 {...getEditableAttr(previewMode, 'contact.title')}>{pick(customizations, 'contact.title', 'Kontak cepat')}</h2>
            <p {...getEditableAttr(previewMode, 'contact.description')}>{pick(customizations, 'contact.description', 'Punya pertanyaan soal produk, stok, ukuran, atau promo? Hubungi admin toko.')}</p>
            <div className="wtk-contact-actions">
              <a href={waHref} target="_blank" rel="noopener noreferrer" {...getEditableAttr(previewMode, 'contact.whatsapp_label')} className="wtk-btn-wa">
                <i className="fa-brands fa-whatsapp" style={{ marginRight: '8px', fontSize: '1.15em' }}></i>
                {pick(customizations, 'contact.whatsapp_label', 'Chat WhatsApp')}
              </a>
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="wtk-btn-ig">
                  <i className="fa-brands fa-instagram" style={{ marginRight: '8px' }}></i> Instagram
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="wtk-btn-tt">
                  <i className="fa-brands fa-tiktok" style={{ marginRight: '8px' }}></i> TikTok
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* --- FAQ SECTION (Accordion) --- */}
      {faqVisible && faqs.length > 0 && (
        <section id="faq" className="wtk-extra-section wtk-faq" {...getSectionAttr(previewMode, 'faq')}>
          <div className="wtk-section-head">
            <h2 {...getEditableAttr(previewMode, 'faq.title')}>{faqTitle}</h2>
          </div>
          <div className="wtk-faq-accordion">
            {faqs.map((faq, index) => (
              <details className="wtk-faq-item" key={index}>
                <summary {...getEditableAttr(previewMode, `faq.q${index + 1}`)}>
                  <span className="wtk-faq-q-text">
                    {tone === 'glow' ? <span className="glow-faq-num">{String(index + 1).padStart(2, '0')}. </span> : ''}
                    {faq.q || `Pertanyaan ${index + 1}`}
                  </span>
                  <span className="wtk-faq-icon">
                    <i className="fa-solid fa-chevron-down"></i>
                  </span>
                </summary>
                <div className="wtk-faq-answer" {...getEditableAttr(previewMode, `faq.a${index + 1}`)}>
                  <p>{faq.a || `Jawaban ${index + 1}`}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const extraCss = `
  .wtk-extra { background: inherit; color: inherit; padding: clamp(28px, 5vw, 56px) 0; }
  .wtk-extra *, .wtk-extra *::before, .wtk-extra *::after { box-sizing: border-box; }
  .wtk-extra a:focus-visible, .wtk-extra summary:focus-visible { outline: 2px solid var(--wtk-accent); outline-offset: 4px; }

  /* Section base */
  .wtk-extra-section { width: min(1180px, calc(100% - 48px)); margin: 0 auto; padding: clamp(48px, 8vw, 92px) 0; }
  .wtk-extra-section + .wtk-extra-section { border-top: 1px solid color-mix(in srgb, currentColor 7%, transparent); }

  /* Section Headings */
  .wtk-section-head { max-width: 720px; margin: 0 auto clamp(28px, 5vw, 48px); text-align: center; }
  .wtk-section-head.left { margin-left: 0; text-align: left; }
  .wtk-section-head h2 { font-size: clamp(1.75rem, 3.4vw, 2.55rem); line-height: 1.2; margin: 0 0 14px; font-weight: 780; overflow-wrap: anywhere; }
  .wtk-section-head p { font-size: clamp(0.92rem, 1.2vw, 1.03rem); line-height: 1.72; color: color-mix(in srgb, currentColor 66%, transparent); margin: 0 auto; max-width: 620px; overflow-wrap: anywhere; }

  /* Promo Banner (horizontal layout) */
  .wtk-promo { display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); gap: clamp(24px, 5vw, 48px); align-items: stretch; }
  .wtk-promo-copy { padding: clamp(28px, 5vw, 52px); display: flex; flex-direction: column; justify-content: center; border-radius: 24px; border: 1px solid color-mix(in srgb, currentColor 10%, transparent); background: color-mix(in srgb, currentColor 3%, transparent); min-width: 0; }
  .wtk-promo-copy h2 { font-size: clamp(1.65rem, 3vw, 2.35rem); line-height: 1.22; margin: 0 0 18px; overflow-wrap: anywhere; }
  .wtk-promo-copy p { font-size: 1rem; line-height: 1.72; color: color-mix(in srgb, currentColor 70%, transparent); margin: 0 0 22px; overflow-wrap: anywhere; }
  .wtk-code { display: inline-flex; align-items: center; gap: 14px; width: fit-content; padding: 12px 20px; border: 1px dashed var(--wtk-accent); border-radius: 999px; }
  .wtk-code span { opacity: .65; font-size: 11px; text-transform: uppercase; letter-spacing: .15em; font-weight: 600; }
  .wtk-code strong { color: var(--wtk-accent); letter-spacing: .08em; font-size: 1.1rem; }
  .wtk-promo-media { border-radius: 24px; overflow: hidden; background: color-mix(in srgb, currentColor 5%, transparent); aspect-ratio: 16/10; display: flex; align-items: center; justify-content: center; }
  .wtk-promo-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .wtk-empty-media { min-height: 200px; width: 100%; display: flex; align-items: center; justify-content: center; padding: 24px; border: 2px dashed color-mix(in srgb, currentColor 20%, transparent); border-radius: 20px; color: color-mix(in srgb, currentColor 50%, transparent); text-align: center; font-size: 0.95rem; }

  /* Reviews (Grid or Scroll) */
  .wtk-review-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: clamp(16px, 2.5vw, 24px); align-items: stretch; }
  .wtk-review-card { padding: clamp(24px, 4vw, 34px); border-radius: 24px; border: 1px solid color-mix(in srgb, currentColor 10%, transparent); background: color-mix(in srgb, currentColor 3%, transparent); display: flex; flex-direction: column; justify-content: space-between; min-height: 190px; position: relative; transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
  .wtk-review-card::before { content: "“"; position: absolute; top: 12px; right: 24px; font-size: 5rem; line-height: 1; font-family: serif; opacity: 0.08; color: currentColor; pointer-events: none; }
  .wtk-review-card:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--wtk-accent) 65%, currentColor); }
  .wtk-review-card p { margin: 0 0 24px; line-height: 1.75; color: color-mix(in srgb, currentColor 80%, transparent); font-size: 1rem; font-style: normal; z-index: 1; text-align: left; overflow-wrap: anywhere; }
  .wtk-review-card::before { content: ""; top: 22px; right: 24px; width: 42px; height: 2px; background: var(--wtk-accent); opacity: 0.45; font-size: 0; }
  .wtk-review-meta { display: flex; flex-direction: column; gap: 4px; text-align: left; }
  .wtk-review-stars { color: #F59E0B; font-size: 0.85rem; letter-spacing: 2px; margin-bottom: 4px; }
  .wtk-review-card strong { color: var(--wtk-accent); font-size: 0.95rem; font-weight: 700; letter-spacing: 0.5px; }

  /* Gallery (Mandiri) */
  .wtk-gallery-only { width: min(1180px, calc(100% - 48px)); }
  .wtk-gallery-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(16px, 2.5vw, 24px); }
  .wtk-gallery-item { margin: 0; display: flex; flex-direction: column; gap: 12px; }
  .wtk-gallery-item > div { width: 100%; aspect-ratio: 4/3; border-radius: 20px; overflow: hidden; background: color-mix(in srgb, currentColor 5%, transparent); }
  .wtk-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s ease; }
  .wtk-gallery-item:hover img { transform: scale(1.05); }
  .wtk-gallery-item figcaption { font-size: 0.9rem; font-weight: 600; color: color-mix(in srgb, currentColor 70%, transparent); text-align: center; }

  /* Documentation (Mandiri, centered focus layout) */
  .wtk-docs-only { max-width: 860px; text-align: center; }
  .wtk-docs-content { display: flex; flex-direction: column; gap: 24px; align-items: center; width: 100%; }
  .wtk-video-wrapper, .wtk-docs-img-wrapper { width: 100%; border-radius: 24px; overflow: hidden; background: color-mix(in srgb, currentColor 5%, transparent); border: 1px solid color-mix(in srgb, currentColor 10%, transparent); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }
  .wtk-video-wrapper iframe { width: 100%; aspect-ratio: 16/9; border: 0; display: block; }
  .wtk-docs-img-wrapper { aspect-ratio: 16 / 9; max-width: 860px; max-height: none; }
  .wtk-docs-img-wrapper img { width: 100%; height: 100%; display: block; max-height: none; object-fit: cover; }
  .wtk-docs-link a { display: inline-flex; align-items: center; gap: 8px; color: var(--wtk-accent); font-weight: 700; text-decoration: none; font-size: 1.05rem; border-bottom: 2px solid transparent; padding-bottom: 4px; transition: border-color 0.3s ease; }
  .wtk-docs-link a:hover { border-color: var(--wtk-accent); }

  /* Location (Horizontal Split Grid) */
  .wtk-location-only .wtk-location-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr); gap: clamp(28px, 5vw, 56px); align-items: start; }
  .wtk-location-info { display: flex; flex-direction: column; text-align: left; }
  .wtk-location-info h2 { font-size: clamp(1.8rem, 3.5vw, 2.5rem); line-height: 1.25; margin: 0 0 16px; font-weight: 800; }
  .wtk-main-address { font-size: 1.05rem; line-height: 1.7; color: color-mix(in srgb, currentColor 70%, transparent); margin: 0 0 28px; }
  .wtk-outlet-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap: 16px; width: 100%; }
  .wtk-outlet-card { border: 1px solid color-mix(in srgb, currentColor 10%, transparent); border-radius: 18px; padding: 20px; background: color-mix(in srgb, currentColor 2%, transparent); transition: border-color 0.3s ease; }
  .wtk-outlet-card:hover { border-color: var(--wtk-accent); }
  .wtk-outlet-card strong { display: block; margin-bottom: 8px; color: var(--wtk-accent); font-size: 1.05rem; font-weight: 700; }
  .wtk-outlet-card p { margin: 0 0 10px; font-size: 0.95rem; line-height: 1.6; color: color-mix(in srgb, currentColor 75%, transparent); }
  .wtk-outlet-card span { display: inline-flex; align-items: center; gap: 6px; color: color-mix(in srgb, currentColor 55%, transparent); font-size: 0.85rem; }
  .wtk-location-map { width: 100%; border-radius: 24px; overflow: hidden; border: 1px solid color-mix(in srgb, currentColor 10%, transparent); box-shadow: 0 12px 30px rgba(0,0,0,0.08); background: color-mix(in srgb, currentColor 5%, transparent); aspect-ratio: 4/3; }
  .wtk-location-map iframe { width: 100%; height: 100%; border: 0; display: block; }
  .wtk-no-map, .wtk-map-help { width: 100%; height: 100%; min-height: 300px; display: flex; align-items: center; justify-content: center; padding: 32px; border: 2px dashed color-mix(in srgb, currentColor 15%, transparent); border-radius: 24px; color: color-mix(in srgb, currentColor 50%, transparent); text-align: center; line-height: 1.6; font-size: 0.95rem; }

  /* Contact CTA Box (Premium Action Banner) */
  .wtk-contact-cta { width: min(1080px, calc(100% - 48px)); }
  .wtk-contact-cta-box { margin: 0 auto; text-align: center; max-width: 860px; padding: clamp(36px, 7vw, 64px) clamp(22px, 5vw, 48px); border-radius: 28px; border: 1px solid color-mix(in srgb, currentColor 12%, transparent); background: color-mix(in srgb, currentColor 3%, transparent); display: flex; flex-direction: column; align-items: center; }
  .wtk-contact-cta-box h2 { font-size: clamp(1.65rem, 3vw, 2.25rem); line-height: 1.22; margin: 0 0 14px; font-weight: 780; overflow-wrap: anywhere; }
  .wtk-contact-cta-box p { font-size: 1rem; line-height: 1.72; color: color-mix(in srgb, currentColor 70%, transparent); max-width: 580px; margin: 0 0 28px; overflow-wrap: anywhere; }
  .wtk-contact-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; width: 100%; }
  .wtk-contact-actions a { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 12px 28px; border-radius: 99px; font-weight: 700; text-decoration: none; transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); font-size: 0.95rem; letter-spacing: 0.5px; }
  .wtk-btn-wa { background: var(--wtk-accent); color: white; border: 1.5px solid var(--wtk-accent); }
  .wtk-btn-wa:hover { background: transparent; color: var(--wtk-accent); box-shadow: 0 8px 24px rgba(var(--wtk-accent), 0.15); }
  .wtk-btn-ig, .wtk-btn-tt { background: transparent; color: currentColor; border: 1.5px solid color-mix(in srgb, currentColor 20%, transparent); }
  .wtk-btn-ig:hover, .wtk-btn-tt:hover { background: color-mix(in srgb, currentColor 5%, transparent); border-color: currentColor; }

  /* FAQ (Accordion details/summary) */
  .wtk-faq { max-width: 900px; }
  .wtk-faq-accordion { display: flex; flex-direction: column; gap: 12px; width: 100%; }
  .wtk-faq-item { border: 1px solid color-mix(in srgb, currentColor 10%, transparent); background: color-mix(in srgb, currentColor 2%, transparent); border-radius: 16px; overflow: hidden; transition: border-color 0.3s ease; }
  .wtk-faq-item:hover { border-color: var(--wtk-accent); }
  .wtk-faq-item summary { cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 20px 28px; list-style: none; user-select: none; transition: background-color 0.3s ease; }
  .wtk-faq-item summary::-webkit-details-marker { display: none; }
  .wtk-faq-item summary::marker { content: ""; display: none; }
  .wtk-faq-item summary:hover { background-color: color-mix(in srgb, currentColor 2%, transparent); }
  .wtk-faq-q-text { font-size: 1.04rem; font-weight: 700; color: currentColor; text-align: left; overflow-wrap: anywhere; padding-right: 16px; }
  .wtk-faq-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: color-mix(in srgb, currentColor 6%, transparent); color: var(--wtk-accent); transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1), background-color 0.3s ease; }
  .wtk-faq-item[open] .wtk-faq-icon { transform: rotate(180deg); background: var(--wtk-accent); color: white; }
  .wtk-faq-answer { padding: 0 28px 24px 28px; border-top: 1px solid transparent; }
  .wtk-faq-item[open] .wtk-faq-answer { border-color: color-mix(in srgb, currentColor 6%, transparent); }
  .wtk-faq-answer p { margin: 16px 0 0 0; line-height: 1.75; color: color-mix(in srgb, currentColor 70%, transparent); font-size: 1.02rem; overflow-wrap: anywhere; text-align: left; }

  /* Mobile responsiveness */
  @media (max-width: 860px) {
    .wtk-extra { padding: 20px 0 32px; }
    .wtk-extra-section { width: min(100% - 32px, 1200px); padding: 40px 0; }
    .wtk-extra-section + .wtk-extra-section { border-top-color: color-mix(in srgb, currentColor 10%, transparent); }
    .wtk-promo { grid-template-columns: 1fr; gap: 20px; }
    .wtk-review-grid { grid-template-columns: 1fr; }
    .wtk-gallery-grid { grid-template-columns: 1fr; gap: 20px; }
    .wtk-gallery-bento, .wtk-gallery-editorial { grid-template-columns: 1fr !important; min-height: 0 !important; gap: 18px !important; }
    .wtk-gallery-bento .bento-item-1 { grid-row: auto !important; }
    .wtk-gallery-bento .bento-item-1 > div, .wtk-gallery-bento .bento-item-2 > div, .wtk-gallery-bento .bento-item-3 > div { min-height: 0 !important; height: auto !important; aspect-ratio: 4/3 !important; }
    .wtk-gallery-polaroid { display: grid !important; grid-template-columns: 1fr; gap: 18px; }
    .polaroid-wrapper { width: 100% !important; transform: none !important; }
    .wtk-gallery-item > div { aspect-ratio: 4/3 !important; }
    .wtk-location-only .wtk-location-grid { grid-template-columns: 1fr; gap: 28px; }
    .wtk-location-map { aspect-ratio: 16/10; }
    .wtk-outlet-list { grid-template-columns: 1fr; }
    .wtk-contact-cta-box { padding: 40px 24px; }
    .wtk-contact-actions { flex-direction: column; width: 100%; }
    .wtk-contact-actions a { width: 100%; }
    .wtk-faq-item summary { padding: 18px 20px; }
    .wtk-faq-answer { padding: 0 20px 20px 20px; }
    .wtk-faq-q-text { font-size: 1.05rem; }
  }

  /* =========================================================================
     BUTIK EXTRA STYLES (Luxury Minimal Gold/Dark)
     ========================================================================= */
  .wtk-extra-butik { background: #0A0A0A; color: #F5F5F5; font-family: 'Montserrat', sans-serif; }
  .wtk-extra-butik h2, .wtk-extra-butik h3, .wtk-extra-butik h4, .wtk-extra-butik strong { font-family: 'Cinzel', serif; letter-spacing: 2px; }

  .wtk-extra-butik .wtk-promo-copy,
  .wtk-extra-butik .wtk-contact-cta-box,
  .wtk-extra-butik .wtk-outlet-card,
  .wtk-extra-butik .wtk-video-wrapper,
  .wtk-extra-butik .wtk-docs-img-wrapper,
  .wtk-extra-butik .wtk-location-map,
  .wtk-extra-butik .wtk-review-card,
  .wtk-extra-butik .wtk-faq-item {
    border: 1px solid rgba(197, 160, 89, 0.22);
    background: rgba(15, 15, 15, 0.6);
    border-radius: 0 !important;
  }
  .wtk-extra-butik .wtk-empty-media, .wtk-extra-butik .wtk-map-help, .wtk-extra-butik .wtk-no-map { border-radius: 0; border-color: rgba(197, 160, 89, 0.3); }
  .wtk-extra-butik .wtk-promo-media, .wtk-extra-butik .wtk-gallery-item > div { border-radius: 0; }
  .wtk-extra-butik .wtk-code { border: 1px solid #C5A059; background: transparent; color: #C5A059; border-radius: 0; }

  .wtk-extra-butik .wtk-contact-actions a,
  .wtk-extra-butik .wtk-btn-wa {
    border: 1px solid #C5A059;
    background: transparent;
    color: #C5A059;
    border-radius: 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-family: 'Cinzel', serif;
    font-size: 12px;
    padding: 14px 28px;
  }
  .wtk-extra-butik .wtk-contact-actions a:hover,
  .wtk-extra-butik .wtk-btn-wa:hover { background: #C5A059; color: #0A0A0A; box-shadow: none; }

  .wtk-extra-butik .wtk-gallery-grid { gap: 24px; }
  .wtk-extra-butik .wtk-gallery-item { border: 1px solid rgba(197, 160, 89, 0.2); padding: 12px; border-radius: 0; }
  .wtk-extra-butik .wtk-gallery-item figcaption { font-family: 'Cinzel', serif; letter-spacing: 1px; text-transform: uppercase; color: #C5A059; text-align: center; font-size: 12px; margin-top: 12px; }

  .wtk-extra-butik .wtk-outlet-card strong { color: #C5A059; border-bottom: 1px solid rgba(197, 160, 89, 0.15); padding-bottom: 8px; margin-bottom: 12px; font-size: 13px; letter-spacing: 1.5px; }
  .wtk-extra-butik .wtk-faq-item summary { font-family: 'Cinzel', serif; letter-spacing: 1px; text-transform: uppercase; }
  .wtk-extra-butik .wtk-faq-item h3, .wtk-extra-butik .wtk-faq-q-text { color: #C5A059; font-size: 13px; font-weight: 700; }
  .wtk-extra-butik .wtk-faq-icon { border-radius: 0; background: rgba(197, 160, 89, 0.08); color: #C5A059; }
  .wtk-extra-butik .wtk-faq-item[open] .wtk-faq-icon { background: #C5A059; color: #0A0A0A; }

  /* =========================================================================
     DAPUR EXTRA STYLES (Cozy Polaroid Warm/Organic)
     ========================================================================= */
  .wtk-extra-dapur { background: #FFFBF7; color: #3E2723; font-family: 'Plus Jakarta Sans', sans-serif; }
  .wtk-extra-dapur h2, .wtk-extra-dapur h3, .wtk-extra-dapur h4, .wtk-extra-dapur .wtk-faq-q-text { font-family: 'Playfair Display', serif; color: #3E2723; }

  .wtk-gallery-polaroid { display: flex; gap: 28px; justify-content: center; flex-wrap: wrap; margin-top: 24px; }
  .wtk-gallery-polaroid .wtk-gallery-item { margin: 0; padding: 0; background: none; }
  .polaroid-wrapper { background: #FFFFFF; padding: 16px 16px 32px 16px; border-radius: 0px; box-shadow: 0 10px 30px rgba(62,39,35,0.06); border: 1px solid #E8E3DD; transition: 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); display: inline-block; width: 280px; }
  .polaroid-wrapper:hover { transform: scale(1.04) translateY(-8px); box-shadow: 0 20px 40px rgba(62,39,35,0.12); z-index: 10; }
  .polaroid-img { width: 100%; aspect-ratio: 1; overflow: hidden; background: #FFFDFB; border: 1px solid #F3EDE6; }
  .polaroid-img img { width: 100%; height: 100%; object-fit: cover; }
  .polaroid-caption { margin-top: 18px; font-family: 'Playfair Display', serif; font-style: italic; font-weight: 700; text-align: center; color: #5D4037; font-size: 15px; }
  .polaroid-item-1 { transform: rotate(-2.5deg); }
  .polaroid-item-2 { transform: rotate(2deg); }
  .polaroid-item-3 { transform: rotate(-1.5deg); }

  .wtk-extra-dapur .wtk-promo-copy,
  .wtk-extra-dapur .wtk-contact-cta-box,
  .wtk-extra-dapur .wtk-outlet-card,
  .wtk-extra-dapur .wtk-video-wrapper,
  .wtk-extra-dapur .wtk-docs-img-wrapper,
  .wtk-extra-dapur .wtk-location-map,
  .wtk-extra-dapur .wtk-review-card,
  .wtk-extra-dapur .wtk-faq-item {
    border: 1.5px solid #F1ECE6;
    background: #FFFDFB;
    border-radius: 28px !important;
    box-shadow: 0 10px 30px rgba(62, 39, 35, 0.03);
  }
  .wtk-extra-dapur .wtk-empty-media, .wtk-extra-dapur .wtk-map-help, .wtk-extra-dapur .wtk-no-map { border-radius: 20px; border-color: #E8E3DD; background: #FDFCFB; }
  .wtk-extra-dapur .wtk-promo-media { border-radius: 28px; }
  .wtk-extra-dapur .wtk-code { border-radius: 12px; }

  .wtk-extra-dapur .wtk-outlet-card strong { font-size: 17px; color: #3E2723; }
  .wtk-extra-dapur .wtk-outlet-card p { color: #6D4C41; }
  .wtk-extra-dapur .wtk-outlet-card span { color: #8D6E63; font-weight: 500; }

  .wtk-extra-dapur .wtk-contact-actions a,
  .wtk-extra-dapur .wtk-btn-wa { background: #3E2723; color: white; border-radius: 100px; font-weight: 700; padding: 14px 32px; border: 2px solid #3E2723; }
  .wtk-extra-dapur .wtk-contact-actions a:hover,
  .wtk-extra-dapur .wtk-btn-wa:hover { background: transparent; color: #3E2723; }
  .wtk-extra-dapur .wtk-faq-item summary { font-family: 'Playfair Display', serif; }
  .wtk-extra-dapur .wtk-faq-q-text { font-size: 18px; color: #3E2723; font-weight: 700; }
  .wtk-extra-dapur .wtk-faq-icon { color: #D86B43; background: #FFF7ED; }
  .wtk-extra-dapur .wtk-faq-item[open] .wtk-faq-icon { background: #D86B43; color: white; }

  /* =========================================================================
     LUXE EXTRA STYLES (Futuristic Bento Dark Neon)
     ========================================================================= */
  .wtk-extra-luxe { background: #09090B; color: #FAFAFA; font-family: 'Inter', sans-serif; }
  .wtk-extra-luxe h2, .wtk-extra-luxe h3, .wtk-extra-luxe h4 { font-family: 'Syne', sans-serif; font-weight: 850; text-transform: uppercase; line-height: 1.25; letter-spacing: -0.01em; }
  .wtk-extra-luxe .wtk-section-head h2 { font-size: clamp(2rem, 4.5vw, 2.8rem); line-height: 1.2; }
  .wtk-extra-luxe .wtk-faq-q-text { font-family: 'Syne', sans-serif; text-transform: uppercase; font-size: 14px; font-weight: 750; letter-spacing: 0.5px; color: #FAFAFA; }

  .wtk-extra-luxe .wtk-promo-copy,
  .wtk-extra-luxe .wtk-contact-cta-box,
  .wtk-extra-luxe .wtk-outlet-card,
  .wtk-extra-luxe .wtk-video-wrapper,
  .wtk-extra-luxe .wtk-docs-img-wrapper,
  .wtk-extra-luxe .wtk-location-map,
  .wtk-extra-luxe .wtk-review-card,
  .wtk-extra-luxe .wtk-faq-item {
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(18, 18, 20, 0.85);
    border-radius: 24px !important;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  }
  .wtk-extra-luxe .wtk-promo-copy:hover,
  .wtk-extra-luxe .wtk-contact-cta-box:hover,
  .wtk-extra-luxe .wtk-review-card:hover,
  .wtk-extra-luxe .wtk-faq-item:hover {
    border-color: var(--wtk-accent);
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.08);
  }
  .wtk-extra-luxe .wtk-promo-media { border-radius: 24px; }
  .wtk-extra-luxe .wtk-code { border-color: var(--wtk-accent); border-radius: 12px; }

  .wtk-gallery-bento { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; min-height: 480px; margin-top: 24px; width: 100%; }
  .wtk-gallery-bento .bento-item-1 { grid-row: span 2; display: flex; flex-direction: column; height: 100%; }
  .wtk-gallery-bento .bento-item-1 > div { flex: 1; min-height: 320px; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); }
  .wtk-gallery-bento .bento-item-2 > div, .wtk-gallery-bento .bento-item-3 > div { height: 195px; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); }
  .wtk-gallery-bento .wtk-gallery-item { position: relative; overflow: hidden; margin: 0; }
  .wtk-gallery-bento img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1); }
  .wtk-gallery-bento .wtk-gallery-item:hover img { transform: scale(1.06); }
  .wtk-gallery-bento figcaption { margin-top: 10px; font-family: 'Syne', sans-serif; text-transform: uppercase; font-weight: 700; font-size: 12px; color: var(--wtk-accent); letter-spacing: 1px; text-align: center; }

  .wtk-extra-luxe .wtk-outlet-card strong { color: var(--wtk-accent); font-family: 'Syne', sans-serif; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
  .wtk-extra-luxe .wtk-outlet-card p { color: #A1A1AA; }
  .wtk-extra-luxe .wtk-outlet-card span { color: #71717A; }

  .wtk-extra-luxe .wtk-contact-actions a,
  .wtk-extra-luxe .wtk-btn-wa {
    background: var(--wtk-accent);
    color: #09090B;
    border-radius: 99px;
    text-transform: uppercase;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    letter-spacing: 1px;
    font-size: 13px;
    border: 1.5px solid var(--wtk-accent);
    padding: 14px 32px;
  }
  .wtk-extra-luxe .wtk-contact-actions a:hover,
  .wtk-extra-luxe .wtk-btn-wa:hover { background: transparent; color: var(--wtk-accent); box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
  .wtk-extra-luxe .wtk-faq-icon { background: rgba(139, 92, 246, 0.1); color: var(--wtk-accent); }
  .wtk-extra-luxe .wtk-faq-item[open] .wtk-faq-icon { background: var(--wtk-accent); color: #09090B; }

  /* =========================================================================
     GLOW EXTRA STYLES (Minimal Skincare Lookbook)
     ========================================================================= */
  .wtk-extra-glow { background: #FAFAFA; color: #111; font-family: 'Inter', sans-serif; }
  .wtk-extra-glow h2, .wtk-extra-glow h3, .wtk-extra-glow h4, .wtk-extra-glow .wtk-faq-q-text { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #111; }

  .wtk-gallery-editorial { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: end; margin-top: 24px; width: 100%; }
  .wtk-gallery-editorial .wtk-gallery-item { margin: 0; }
  .wtk-gallery-editorial .editorial-item-1 > div { aspect-ratio: 4/5; border-radius: 12px; overflow: hidden; }
  .wtk-gallery-editorial .editorial-item-2 > div { aspect-ratio: 1; border-radius: 12px; overflow: hidden; }
  .wtk-gallery-editorial .editorial-item-3 > div { aspect-ratio: 3/4; border-radius: 12px; overflow: hidden; }
  .wtk-gallery-editorial figcaption { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 13px; color: #111; margin-top: 8px; text-align: center; }

  .wtk-extra-glow .wtk-promo-copy,
  .wtk-extra-glow .wtk-contact-cta-box,
  .wtk-extra-glow .wtk-outlet-card,
  .wtk-extra-glow .wtk-video-wrapper,
  .wtk-extra-glow .wtk-docs-img-wrapper,
  .wtk-extra-glow .wtk-location-map,
  .wtk-extra-glow .wtk-review-card,
  .wtk-extra-glow .wtk-faq-item {
    border: 1.5px solid #E2E8F0;
    background: #FFFFFF;
    border-radius: 16px !important;
    box-shadow: none;
  }
  .wtk-extra-glow .wtk-promo-media { border-radius: 16px; }
  .wtk-extra-glow .wtk-code { border-radius: 6px; }
  .wtk-extra-glow .wtk-outlet-card strong { color: var(--wtk-accent); font-family: 'Space Grotesk', sans-serif; }

  .wtk-extra-glow .wtk-contact-actions a,
  .wtk-extra-glow .wtk-btn-wa { background: #111; color: white; border-radius: 4px; font-family: 'Space Grotesk', sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; padding: 12px 24px; border: 1.5px solid #111; }
  .wtk-extra-glow .wtk-contact-actions a:hover,
  .wtk-extra-glow .wtk-btn-wa:hover { background: var(--wtk-accent); border-color: var(--wtk-accent); }
  .wtk-extra-glow .glow-faq-num { color: var(--wtk-accent); font-family: 'Space Grotesk', sans-serif; }
  .wtk-extra-glow .wtk-faq-icon { background: #ECFDF5; color: var(--wtk-accent); }
  .wtk-extra-glow .wtk-faq-item[open] .wtk-faq-icon { background: var(--wtk-accent); color: white; }

  /* =========================================================================
     HERBA EXTRA STYLES (Clinical Natural Green)
     ========================================================================= */
  .wtk-extra-herba { background: #F8FAF5; color: #1F332B; font-family: 'Plus Jakarta Sans', sans-serif; }
  .wtk-extra-herba h2, .wtk-extra-herba h3, .wtk-extra-herba h4, .wtk-extra-herba .wtk-faq-q-text { font-family: 'Fraunces', serif; font-weight: 700; color: #1F332B; }

  .wtk-extra-herba .wtk-promo-copy,
  .wtk-extra-herba .wtk-contact-cta-box,
  .wtk-extra-herba .wtk-outlet-card,
  .wtk-extra-herba .wtk-video-wrapper,
  .wtk-extra-herba .wtk-docs-img-wrapper,
  .wtk-extra-herba .wtk-location-map,
  .wtk-extra-herba .wtk-review-card,
  .wtk-extra-herba .wtk-faq-item {
    border: 1px solid rgba(25, 49, 38, 0.08);
    background: #FFFFFF;
    border-radius: 24px !important;
    box-shadow: 0 8px 24px rgba(45, 106, 79, 0.025);
  }
  .wtk-extra-herba .wtk-promo-media { border-radius: 24px; }
  .wtk-extra-herba .wtk-code { border-radius: 12px; }

  .wtk-extra-herba .wtk-contact-actions a,
  .wtk-extra-herba .wtk-btn-wa { background: var(--wtk-accent); color: white; border-radius: 99px; font-weight: 700; padding: 12px 24px; border: 1.5px solid var(--wtk-accent); }
  .wtk-extra-herba .wtk-contact-actions a:hover,
  .wtk-extra-herba .wtk-btn-wa:hover { background: transparent; color: var(--wtk-accent); }

  .wtk-extra-herba .wtk-outlet-card strong { color: var(--wtk-accent); }
  .wtk-extra-herba .wtk-faq-icon { background: #F0FDF4; color: var(--wtk-accent); }
  .wtk-extra-herba .wtk-faq-item[open] .wtk-faq-icon { background: var(--wtk-accent); color: white; }

  /* Final storefront polish: safer spacing, clearer tone signatures, and no edge-to-edge crowding. */
  .wtk-extra {
    overflow: hidden;
  }

  .wtk-extra-section {
    width: min(1120px, calc(100% - 48px));
    padding: clamp(54px, 7vw, 88px) 0;
  }

  .wtk-section-head {
    max-width: 760px;
  }

  .wtk-section-head h2,
  .wtk-contact-cta-box h2,
  .wtk-location-info h2 {
    letter-spacing: 0;
    overflow-wrap: anywhere;
    text-wrap: balance;
  }

  .wtk-docs-only {
    width: min(1120px, calc(100% - 48px));
    max-width: 1120px;
  }

  .wtk-docs-content {
    align-items: stretch;
  }

  .wtk-docs-img-wrapper img {
    width: 100%;
    height: 100%;
    max-height: none;
    object-fit: cover;
  }

  .wtk-location-map,
  .wtk-no-map,
  .wtk-map-help {
    min-height: 260px;
  }

  .wtk-extra-butik .wtk-review-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-top: 1px solid rgba(197, 160, 89, 0.2);
    border-bottom: 1px solid rgba(197, 160, 89, 0.2);
    gap: 0;
  }

  .wtk-extra-butik .wtk-review-card {
    border-width: 0 1px 0 0;
    padding: clamp(26px, 4vw, 38px);
  }

  .wtk-extra-butik .wtk-review-card:last-child {
    border-right: 0;
  }

  .wtk-extra-butik .wtk-docs-only {
    text-align: left;
  }

  .wtk-extra-butik .wtk-docs-only .wtk-section-head {
    margin-left: 0;
    text-align: left;
  }

  .wtk-extra-dapur .wtk-extra-section {
    width: min(1080px, calc(100% - 48px));
  }

  .wtk-extra-dapur .wtk-section-head {
    text-align: left;
    margin-left: 0;
  }

  .wtk-extra-dapur .wtk-review-card {
    min-height: 180px;
    border-radius: 18px 34px 18px 34px !important;
  }

  .wtk-extra-dapur .wtk-review-card::before {
    left: 24px;
    right: auto;
    background: #D86B43;
  }

  .wtk-extra-dapur .wtk-review-card p {
    padding-top: 18px;
  }

  .wtk-extra-dapur .wtk-gallery-polaroid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    justify-content: stretch;
    gap: 22px;
  }

  .wtk-extra-dapur .polaroid-wrapper {
    width: 100% !important;
    max-width: 330px !important;
    margin: 0 auto !important;
  }

  .wtk-extra-dapur .polaroid-img {
    aspect-ratio: 4 / 3 !important;
  }

  .wtk-extra-dapur .wtk-docs-content {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(220px, 0.05fr);
  }

  .wtk-extra-dapur .wtk-docs-img-wrapper {
    grid-column: 1 / -1;
    border-radius: 36px 36px 12px 12px !important;
  }

  .wtk-extra-dapur .wtk-location-only .wtk-location-grid {
    grid-template-columns: minmax(0, 0.9fr) minmax(300px, 1.1fr);
  }

  .wtk-extra-glow {
    background: linear-gradient(180deg, #FAFAFA 0%, #F4FBF8 100%);
  }

  .wtk-extra-glow .wtk-section-head {
    text-align: left;
    margin-left: 0;
  }

  .wtk-extra-glow .wtk-gallery-editorial {
    align-items: stretch;
  }

  .wtk-extra-glow .wtk-contact-cta-box {
    border-radius: 12px !important;
    text-align: left;
    align-items: flex-start;
  }

  .wtk-extra-glow .wtk-contact-actions {
    justify-content: flex-start;
  }

  .wtk-extra-glow .wtk-faq {
    max-width: 960px;
  }

  .wtk-extra-luxe .wtk-extra-section {
    width: min(1120px, calc(100% - 48px));
  }

  .wtk-extra-luxe h2,
  .wtk-extra-luxe h3,
  .wtk-extra-luxe h4 {
    letter-spacing: 0;
  }

  .wtk-extra-luxe .wtk-section-head {
    text-align: left;
    margin-left: 0;
  }

  .wtk-extra-luxe .wtk-section-head h2,
  .wtk-extra-luxe .wtk-location-info h2 {
    font-size: clamp(2rem, 4.2vw, 3.8rem);
    max-width: 820px;
  }

  .wtk-extra-luxe .wtk-review-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .wtk-extra-luxe .wtk-review-card {
    min-height: 210px;
  }

  .wtk-extra-luxe .wtk-gallery-bento {
    min-height: 0;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  }

  .wtk-extra-luxe .wtk-gallery-bento .bento-item-1 > div {
    min-height: 280px;
    max-height: 360px;
  }

  .wtk-extra-luxe .wtk-docs-only {
    text-align: left;
  }

  .wtk-extra-luxe .wtk-docs-only .wtk-section-head {
    margin-left: 0;
  }

  .wtk-extra-luxe .wtk-docs-img-wrapper img {
    height: 100%;
  }

  .wtk-extra-luxe .wtk-contact-cta-box {
    max-width: 100%;
    text-align: left;
    align-items: flex-start;
    border-radius: 24px !important;
  }

  .wtk-extra-luxe .wtk-contact-actions {
    justify-content: flex-start;
  }

  .wtk-extra-herba .wtk-gallery-grid {
    grid-template-columns: 1.15fr 0.85fr 0.85fr;
  }

  .wtk-extra-herba .wtk-gallery-item > div {
    border-radius: 28px;
  }

  .wtk-extra-herba .wtk-review-card {
    border-left: 4px solid color-mix(in srgb, var(--wtk-accent) 70%, white);
  }

  @media (max-width: 960px) {
    .wtk-extra-butik .wtk-review-grid,
    .wtk-extra-luxe .wtk-review-grid,
    .wtk-extra-herba .wtk-gallery-grid {
      grid-template-columns: 1fr;
    }

    .wtk-extra-butik .wtk-review-card {
      border-width: 0 0 1px 0;
    }

    .wtk-extra-butik .wtk-review-card:last-child {
      border-bottom: 0;
    }
  }

  @media (max-width: 860px) {
    .wtk-extra-section,
    .wtk-docs-only,
    .wtk-extra-dapur .wtk-extra-section,
    .wtk-extra-luxe .wtk-extra-section {
      width: min(100% - 32px, 1120px);
      padding: 42px 0;
    }

    .wtk-docs-img-wrapper img,
    .wtk-extra-luxe .wtk-docs-img-wrapper img {
      height: 300px;
    }

    .wtk-extra-dapur .wtk-docs-content {
      display: flex;
    }

    .wtk-section-head,
    .wtk-extra-dapur .wtk-section-head,
    .wtk-extra-glow .wtk-section-head,
    .wtk-extra-luxe .wtk-section-head {
      text-align: left;
      margin-left: 0;
      margin-right: 0;
    }
  }

  /* Template CSS reset guard.
     Some template files reset every child with * { margin: 0; padding: 0; }.
     These rules intentionally win so the shared editable sections stay centered
     and readable inside every template tone. */
  .template-root[data-template] .wtk-extra .wtk-extra-section {
    width: min(1040px, calc(100% - 48px)) !important;
    max-width: 1040px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding-top: clamp(42px, 6vw, 72px) !important;
    padding-bottom: clamp(42px, 6vw, 72px) !important;
  }

  .template-root[data-template] .wtk-extra .wtk-section-head {
    margin: 0 auto clamp(28px, 5vw, 48px) !important;
    padding: 0 !important;
  }

  .template-root[data-template] .wtk-extra-dapur .wtk-section-head,
  .template-root[data-template] .wtk-extra-glow .wtk-section-head,
  .template-root[data-template] .wtk-extra-luxe .wtk-section-head {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .template-root[data-template] .wtk-extra .wtk-section-head h2,
  .template-root[data-template] .wtk-extra .wtk-contact-cta-box h2,
  .template-root[data-template] .wtk-extra .wtk-location-info h2 {
    margin: 0 0 14px !important;
    font-size: clamp(1.9rem, 3.8vw, 3rem) !important;
    line-height: 1.08 !important;
  }

  .template-root[data-template="luxe"] .wtk-extra .wtk-section-head h2,
  .template-root[data-template="luxe"] .wtk-extra .wtk-contact-cta-box h2,
  .template-root[data-template="luxe"] .wtk-extra .wtk-location-info h2 {
    font-size: clamp(2.2rem, 5vw, 4rem) !important;
    line-height: 1.02 !important;
    max-width: 780px !important;
  }

  .template-root[data-template="luxe"] .wtk-extra .wtk-docs-only .wtk-section-head h2 {
    font-size: clamp(2.4rem, 6vw, 4.8rem) !important;
  }

  .template-root[data-template] .wtk-extra .wtk-section-head p,
  .template-root[data-template] .wtk-extra .wtk-contact-cta-box p,
  .template-root[data-template] .wtk-extra .wtk-main-address,
  .template-root[data-template] .wtk-extra .wtk-review-card p {
    margin-top: 0 !important;
    overflow-wrap: anywhere;
  }

  .template-root[data-template] .wtk-extra .wtk-review-card,
  .template-root[data-template] .wtk-extra .wtk-outlet-card,
  .template-root[data-template] .wtk-extra .wtk-contact-cta-box,
  .template-root[data-template] .wtk-extra .wtk-faq-item summary,
  .template-root[data-template] .wtk-extra .wtk-faq-answer {
    padding: clamp(22px, 3vw, 32px) !important;
  }

  .template-root[data-template] .wtk-extra .wtk-review-grid,
  .template-root[data-template] .wtk-extra .wtk-gallery-grid,
  .template-root[data-template] .wtk-extra .wtk-gallery-editorial,
  .template-root[data-template] .wtk-extra .wtk-gallery-bento,
  .template-root[data-template] .wtk-extra .wtk-location-grid,
  .template-root[data-template] .wtk-extra .wtk-contact-actions,
  .template-root[data-template] .wtk-extra .wtk-faq-accordion {
    margin: 0 !important;
  }

  .template-root[data-template] .wtk-extra .wtk-gallery-item,
  .template-root[data-template] .wtk-extra .wtk-gallery-item > div,
  .template-root[data-template] .wtk-extra .wtk-docs-img-wrapper,
  .template-root[data-template] .wtk-extra .wtk-location-map {
    margin: 0 !important;
  }

  .template-root[data-template] .wtk-extra .wtk-docs-img-wrapper img {
    height: 100% !important;
  }

  .template-root[data-template="luxe"] .wtk-extra .wtk-docs-img-wrapper img {
    height: 100% !important;
  }

  .template-root[data-template="dapur"] .wtk-extra .wtk-gallery-polaroid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 22px !important;
  }

  .template-root[data-template="dapur"] .wtk-extra .polaroid-wrapper {
    width: 100% !important;
    max-width: 330px !important;
    padding: 12px 12px 22px !important;
  }

  .template-root[data-template="dapur"] .wtk-extra .polaroid-img {
    aspect-ratio: 4 / 3 !important;
  }

  .template-root[data-template] .wtk-extra .wtk-contact-cta-box {
    max-width: 860px !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  .template-root[data-template="luxe"] .wtk-extra .wtk-contact-cta-box,
  .template-root[data-template="butik"] .wtk-extra .wtk-contact-cta-box {
    max-width: 100% !important;
  }

  @media (max-width: 860px) {
    .template-root[data-template] .wtk-extra .wtk-extra-section {
      width: min(100% - 32px, 1040px) !important;
      padding-top: 36px !important;
      padding-bottom: 36px !important;
    }

    .template-root[data-template] .wtk-extra .wtk-section-head h2,
    .template-root[data-template] .wtk-extra .wtk-contact-cta-box h2,
    .template-root[data-template] .wtk-extra .wtk-location-info h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-section-head h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-contact-cta-box h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-location-info h2 {
      font-size: clamp(1.75rem, 9vw, 3rem) !important;
      line-height: 1.06 !important;
    }

    .template-root[data-template="dapur"] .wtk-extra .wtk-gallery-polaroid {
      grid-template-columns: 1fr !important;
    }
  }

  /* Mobile-first final tuning for the real storefront audience. */
  @media (min-width: 641px) and (max-width: 1024px) {
    .template-root[data-template] .wtk-extra .wtk-extra-section {
      width: min(100% - 40px, 880px) !important;
      padding-top: 46px !important;
      padding-bottom: 46px !important;
    }

    .template-root[data-template] .wtk-extra .wtk-review-grid,
    .template-root[data-template] .wtk-extra .wtk-gallery-grid,
    .template-root[data-template] .wtk-extra .wtk-gallery-editorial,
    .template-root[data-template="dapur"] .wtk-extra .wtk-gallery-polaroid,
    .template-root[data-template="herba"] .wtk-extra .wtk-gallery-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 18px !important;
    }

    .template-root[data-template] .wtk-extra .wtk-gallery-bento {
      grid-template-columns: 1fr 1fr !important;
      gap: 18px !important;
    }

    .template-root[data-template] .wtk-extra .wtk-location-only .wtk-location-grid {
      grid-template-columns: 1fr !important;
      gap: 22px !important;
    }

    .template-root[data-template] .wtk-extra .wtk-docs-img-wrapper img {
      height: 100% !important;
    }

    .template-root[data-template] .wtk-extra .wtk-docs-img-wrapper {
      aspect-ratio: 16 / 9 !important;
      max-width: 760px !important;
      max-height: none !important;
    }

    .template-root[data-template="luxe"] .wtk-extra .wtk-section-head h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-contact-cta-box h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-location-info h2 {
      font-size: clamp(2.1rem, 6vw, 3.4rem) !important;
      max-width: 680px !important;
    }
  }

  @media (max-width: 640px) {
    .template-root[data-template] .wtk-extra {
      padding: 12px 0 22px !important;
    }

    .template-root[data-template] .wtk-extra .wtk-extra-section {
      width: min(100% - 28px, 420px) !important;
      padding-top: 30px !important;
      padding-bottom: 30px !important;
    }

    .template-root[data-template] .wtk-extra .wtk-extra-section + .wtk-extra-section {
      border-top-width: 1px !important;
    }

    .template-root[data-template] .wtk-extra .wtk-section-head {
      margin-bottom: 18px !important;
      text-align: left !important;
    }

    .template-root[data-template] .wtk-extra .wtk-section-head h2,
    .template-root[data-template] .wtk-extra .wtk-contact-cta-box h2,
    .template-root[data-template] .wtk-extra .wtk-location-info h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-section-head h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-contact-cta-box h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-location-info h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-docs-only .wtk-section-head h2 {
      font-size: clamp(1.75rem, 10vw, 2.55rem) !important;
      line-height: 1.08 !important;
      letter-spacing: 0 !important;
      max-width: 100% !important;
    }

    .template-root[data-template="luxe"] .wtk-extra .wtk-section-head h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-contact-cta-box h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-location-info h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-faq-q-text {
      font-size-adjust: none;
      word-break: normal;
      overflow-wrap: anywhere;
    }

    .template-root[data-template] .wtk-extra .wtk-section-head p,
    .template-root[data-template] .wtk-extra .wtk-contact-cta-box p,
    .template-root[data-template] .wtk-extra .wtk-main-address,
    .template-root[data-template] .wtk-extra .wtk-review-card p,
    .template-root[data-template] .wtk-extra .wtk-faq-answer p {
      font-size: 0.94rem !important;
      line-height: 1.58 !important;
    }

    .template-root[data-template] .wtk-extra .wtk-review-grid,
    .template-root[data-template] .wtk-extra .wtk-gallery-grid,
    .template-root[data-template] .wtk-extra .wtk-gallery-editorial,
    .template-root[data-template] .wtk-extra .wtk-gallery-bento,
    .template-root[data-template] .wtk-extra .wtk-location-grid,
    .template-root[data-template="dapur"] .wtk-extra .wtk-gallery-polaroid,
    .template-root[data-template="herba"] .wtk-extra .wtk-gallery-grid {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 14px !important;
    }

    .template-root[data-template] .wtk-extra .wtk-review-card,
    .template-root[data-template] .wtk-extra .wtk-outlet-card,
    .template-root[data-template] .wtk-extra .wtk-contact-cta-box,
    .template-root[data-template] .wtk-extra .wtk-faq-item summary,
    .template-root[data-template] .wtk-extra .wtk-faq-answer {
      padding: 18px !important;
    }

    .template-root[data-template] .wtk-extra .wtk-review-card {
      min-height: 0 !important;
    }

    .template-root[data-template] .wtk-extra .wtk-review-card p {
      margin-bottom: 18px !important;
    }

    .template-root[data-template] .wtk-extra .wtk-gallery-item > div,
    .template-root[data-template] .wtk-extra .wtk-gallery-bento .bento-item-1 > div,
    .template-root[data-template] .wtk-extra .wtk-gallery-bento .bento-item-2 > div,
    .template-root[data-template] .wtk-extra .wtk-gallery-bento .bento-item-3 > div,
    .template-root[data-template="dapur"] .wtk-extra .polaroid-img {
      aspect-ratio: 4 / 3 !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
    }

    .template-root[data-template] .wtk-extra .wtk-docs-img-wrapper img,
    .template-root[data-template="luxe"] .wtk-extra .wtk-docs-img-wrapper img {
      height: 100% !important;
    }

    .template-root[data-template] .wtk-extra .wtk-docs-img-wrapper {
      aspect-ratio: 4 / 3 !important;
      max-width: 100% !important;
      max-height: none !important;
    }

    .template-root[data-template] .wtk-extra .wtk-location-map,
    .template-root[data-template] .wtk-extra .wtk-no-map,
    .template-root[data-template] .wtk-extra .wtk-map-help {
      min-height: 220px !important;
      aspect-ratio: 1 / 1 !important;
    }

    .template-root[data-template] .wtk-extra .wtk-contact-cta-box {
      border-radius: 18px !important;
      text-align: left !important;
      align-items: stretch !important;
    }

    .template-root[data-template] .wtk-extra .wtk-contact-actions {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 10px !important;
      width: 100% !important;
    }

    .template-root[data-template] .wtk-extra .wtk-contact-actions a {
      width: 100% !important;
      min-height: 46px !important;
      padding: 12px 16px !important;
      font-size: 0.88rem !important;
    }

    .template-root[data-template] .wtk-extra .wtk-faq-item summary {
      gap: 12px !important;
      align-items: center !important;
    }

    .template-root[data-template] .wtk-extra .wtk-faq-q-text {
      font-size: 0.92rem !important;
      line-height: 1.35 !important;
      padding-right: 0 !important;
    }

    .template-root[data-template] .wtk-extra .wtk-faq-icon {
      width: 30px !important;
      height: 30px !important;
      flex: 0 0 30px !important;
    }
  }

  @media (max-width: 380px) {
    .template-root[data-template] .wtk-extra .wtk-extra-section {
      width: min(100% - 22px, 360px) !important;
    }

    .template-root[data-template] .wtk-extra .wtk-section-head h2,
    .template-root[data-template] .wtk-extra .wtk-contact-cta-box h2,
    .template-root[data-template] .wtk-extra .wtk-location-info h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-section-head h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-contact-cta-box h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-location-info h2 {
      font-size: clamp(1.55rem, 10vw, 2.15rem) !important;
    }
  }

  /* Final footer guard: footers live outside this component, but this style tag is
     mounted before them on every template storefront. */
  .template-root[data-template] footer {
    color: rgba(255, 255, 255, 0.86) !important;
    overflow: hidden;
  }

  .template-root[data-template] footer .f-grid {
    width: min(1120px, calc(100% - 48px)) !important;
    max-width: 1120px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1.45fr) minmax(160px, 0.75fr) minmax(170px, 0.8fr) !important;
    gap: clamp(28px, 5vw, 64px) !important;
    align-items: start !important;
  }

  .template-root[data-template="dapur"] footer .f-grid {
    display: block !important;
  }

  .template-root[data-template="dapur"] footer .f-top {
    width: min(1120px, calc(100% - 48px)) !important;
    max-width: 1120px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1.45fr) minmax(160px, 0.75fr) minmax(170px, 0.8fr) !important;
    gap: clamp(28px, 5vw, 64px) !important;
    align-items: start !important;
  }

  .template-root[data-template] footer .f-col,
  .template-root[data-template] footer .f-col * {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .template-root[data-template] footer .logo,
  .template-root[data-template] footer .font-serif,
  .template-root[data-template] footer .font-bold,
  .template-root[data-template] footer .f-col:first-child > div {
    color: #FFFFFF !important;
    overflow-wrap: anywhere;
    line-height: 1.18;
  }

  .template-root[data-template] footer p,
  .template-root[data-template] footer .f-desc {
    color: rgba(255, 255, 255, 0.72) !important;
    max-width: 420px;
    line-height: 1.65 !important;
  }

  .template-root[data-template] footer h4,
  .template-root[data-template] footer h5 {
    margin-bottom: 16px !important;
    line-height: 1.2 !important;
  }

  .template-root[data-template] footer ul {
    list-style: none !important;
    padding: 0 !important;
    margin: 0 !important;
    display: grid !important;
    gap: 10px !important;
  }

  .template-root[data-template] footer li {
    margin: 0 !important;
  }

  .template-root[data-template] footer a {
    color: rgba(255, 255, 255, 0.76) !important;
    text-decoration: none !important;
    overflow-wrap: anywhere !important;
  }

  .template-root[data-template] footer a:hover {
    color: #FFFFFF !important;
  }

  .template-root[data-template] footer .f-bottom {
    width: min(1120px, calc(100% - 48px)) !important;
    max-width: 1120px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    margin-top: 38px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
    padding-top: 24px !important;
    color: rgba(255, 255, 255, 0.58) !important;
    line-height: 1.65 !important;
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 12px 18px !important;
  }

  .template-root[data-template="dapur"] footer,
  .template-root[data-template="glow"] footer,
  .template-root[data-template="herba"] footer {
    background-color: #17382B !important;
  }

  .template-root[data-template="butik"] footer,
  .template-root[data-template="luxe"] footer {
    background-color: #050505 !important;
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .template-root[data-template] footer {
      padding-top: 54px !important;
      padding-bottom: 32px !important;
    }

    .template-root[data-template] footer .f-grid {
      width: min(100% - 40px, 880px) !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1.2fr) minmax(150px, 0.8fr) minmax(150px, 0.8fr) !important;
      gap: 26px !important;
      margin-bottom: 34px !important;
    }

    .template-root[data-template="dapur"] footer .f-grid {
      display: block !important;
      margin-bottom: 0 !important;
    }

    .template-root[data-template="dapur"] footer .f-top {
      width: min(100% - 40px, 880px) !important;
      grid-template-columns: minmax(0, 1.2fr) minmax(150px, 0.8fr) minmax(150px, 0.8fr) !important;
      gap: 26px !important;
    }

    .template-root[data-template] footer .f-bottom {
      width: min(100% - 40px, 880px) !important;
      padding-top: 24px !important;
    }
  }

  @media (max-width: 640px) {
    .template-root[data-template] footer {
      padding: 38px 0 26px !important;
    }

    .template-root[data-template] footer .f-grid,
    .template-root[data-template="dapur"] footer .f-top {
      width: min(100% - 28px, 420px) !important;
      grid-template-columns: 1fr !important;
      display: grid !important;
      gap: 24px !important;
      margin: 0 auto 28px !important;
      text-align: left !important;
    }

    .template-root[data-template="dapur"] footer .f-grid {
      display: block !important;
      margin-bottom: 0 !important;
    }

    .template-root[data-template] footer p,
    .template-root[data-template] footer .f-desc {
      max-width: none;
      font-size: 0.92rem !important;
    }

    .template-root[data-template] footer h4,
    .template-root[data-template] footer h5 {
      font-size: 0.96rem !important;
      margin-bottom: 12px !important;
    }

    .template-root[data-template] footer .f-bottom {
      width: min(100% - 28px, 420px) !important;
      text-align: left !important;
      padding-top: 22px !important;
      font-size: 0.78rem !important;
      letter-spacing: 0 !important;
      display: grid !important;
      gap: 10px !important;
      justify-items: start !important;
    }
  }

  /* Luxe display typography should stay distinctive only where it has room. */
  .template-root[data-template="luxe"] .wtk-extra .wtk-section-head h2,
  .template-root[data-template="luxe"] .wtk-extra .wtk-contact-cta-box h2,
  .template-root[data-template="luxe"] .wtk-extra .wtk-location-info h2 {
    font-size: clamp(2rem, 3.9vw, 3.25rem) !important;
    line-height: 1.08 !important;
    max-width: 640px !important;
    letter-spacing: 0 !important;
  }

  .template-root[data-template="luxe"] .wtk-extra .wtk-location-info h2,
  .template-root[data-template="luxe"] .wtk-extra .wtk-contact-cta-box h2,
  .template-root[data-template="luxe"] .wtk-extra .wtk-faq .wtk-section-head h2 {
    font-size: clamp(1.85rem, 3.2vw, 2.65rem) !important;
    line-height: 1.12 !important;
  }

  .template-root[data-template="luxe"] .wtk-extra .wtk-faq-q-text {
    font-size: 0.92rem !important;
    line-height: 1.45 !important;
    letter-spacing: 0.2px !important;
  }

  @media (max-width: 640px) {
    .template-root[data-template="luxe"] .wtk-extra .wtk-section-head h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-contact-cta-box h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-location-info h2,
    .template-root[data-template="luxe"] .wtk-extra .wtk-docs-only .wtk-section-head h2 {
      font-size: clamp(1.55rem, 8vw, 2.25rem) !important;
      line-height: 1.12 !important;
    }
  }
`
