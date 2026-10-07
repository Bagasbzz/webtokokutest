/**
 * Menghasilkan item menu navigasi (navbar) secara dinamis
 * untuk semua template toko berdasarkan konfigurasi visibilitas section.
 *
 * Aturan:
 * 1. Selalu menampilkan link "Home" dan "Katalog" (beralih langsung ke halaman produk).
 * 2. Menampilkan section aktif lainnya dengan prioritas "Tentang Kami" (About) dan "Kontak".
 * 3. Jika seller menyembunyikan semua section tambahan, maka default "Tentang Kami" dan "Kontak"
 *    tetap ditampilkan di navbar.
 */

export interface NavItem {
  label: string
  href: string
}

export function getNavItems(storeSlug: string, customizations: Record<string, string> | undefined): NavItem[] {
  const items: NavItem[] = [
    { label: 'Home', href: `/${storeSlug}` },
    { label: 'Katalog', href: `/${storeSlug}/produk` }
  ]

  // Cek visibilitas tiap section (default true jika belum diset)
  const masterpieceVisible = customizations?.['masterpiece.visible'] !== 'false'
  const promoVisible = customizations?.['promo_banner.visible'] !== 'false'
  const reviewsVisible = customizations?.['reviews.visible'] !== 'false'
  const galleryVisible = customizations?.['gallery.visible'] !== 'false'
  const docsVisible = customizations?.['docs.visible'] !== 'false'
  const locationVisible = customizations?.['location.visible'] !== 'false'
  const contactVisible = customizations?.['contact.visible'] !== 'false'
  const faqVisible = customizations?.['faq.visible'] !== 'false'

  // Periksa apakah ada minimal satu section yang aktif
  const anyVisible = masterpieceVisible || promoVisible || reviewsVisible || galleryVisible || docsVisible || locationVisible || contactVisible || faqVisible

  const extraItems: NavItem[] = []

  if (!anyVisible) {
    // Jika semua disembunyikan oleh seller, tampilkan fallback default Tentang Kami & Kontak
    extraItems.push({ label: 'Tentang Kami', href: `/${storeSlug}#about` })
    extraItems.push({ label: 'Kontak', href: `/${storeSlug}#contact` })
  } else {
    // 1. Prioritas Utama: Tentang Kami (About)
    if (masterpieceVisible) {
      extraItems.push({ label: 'Tentang Kami', href: `/${storeSlug}#about` })
    }

    // 2. Prioritas Utama: Kontak & Lokasi
    if (contactVisible || locationVisible) {
      extraItems.push({ label: 'Kontak', href: `/${storeSlug}#contact` })
    }

    // 3. Section Tambahan Lainnya (jika slot maks 4 belum terpenuhi)
    if (promoVisible) {
      extraItems.push({ label: 'Promo', href: `/${storeSlug}#promo_banner` })
    }
    if (reviewsVisible) {
      extraItems.push({ label: 'Testimoni', href: `/${storeSlug}#reviews` })
    }
    if (galleryVisible) {
      extraItems.push({ label: 'Galeri', href: `/${storeSlug}#gallery` })
    }
    if (docsVisible) {
      extraItems.push({ label: 'Edukasi', href: `/${storeSlug}#docs` })
    }
    if (faqVisible) {
      extraItems.push({ label: 'FAQ', href: `/${storeSlug}#faq` })
    }
  }

  // Maksimal tambahan adalah 2 item (karena Home & Katalog sudah memakan 2 slot, total maksimal 4)
  const allowedExtra = extraItems.slice(0, 2)
  items.push(...allowedExtra)

  return items
}
