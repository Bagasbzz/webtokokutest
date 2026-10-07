# Panduan Menambah Template WebTokoku

Tujuan dokumen ini: template baru boleh ditambah tanpa merusak editor, storefront, katalog, checkout, dan aturan Free/Pro.

## Syarat Wajib

1. Tambah ID template di `lib/types.ts` pada `TemplateId`.
2. Tambah konfigurasi di `lib/templates.ts`, termasuk nama, kategori, warna, demo URL, dan preview image.
3. Tambah komponen template di `components/templates/`.
4. Daftarkan render template di:
   - `components/storefront/StorefrontRenderer.tsx`
   - `app/dashboard/editor/preview/PreviewClient.tsx`
   - `app/onboarding/OnboardingClient.tsx`
   - `app/demo/[slug]/page.tsx`
5. Template root wajib punya `data-template="<id-template>"`.
6. Semua section yang bisa diedit wajib pakai kontrak dari:
   - `lib/template-content-contract.ts`
   - `lib/template-editables.ts`
7. Jangan bypass data publik dari `StorefrontRenderer`. Produk dan kategori harus lewat renderer supaya limit Free/Pro tetap jalan.
8. Checkout tetap harus pakai komponen katalog/commerce yang sudah ada, bukan logic WhatsApp baru sendiri.
9. CSS template harus scoped ke `data-template` atau class root template supaya tidak merusak template lain.
10. Wajib diuji di desktop dan mobile untuk halaman:
    - `/demo/<template-id>`
    - `/<slug>`
    - `/<slug>/produk`
    - `/dashboard/editor/preview`

## Batasan Free/Pro

Template baru tidak boleh menampilkan data produk/kategori langsung dari query sendiri. Paket Gratis hanya boleh menampilkan 15 produk aktif dan 3 kategori aktif di storefront publik. Paket Pro unlimited.

Watermark `Powered by WebTokoku` muncul dari `CommerceLayer`, jadi template tidak perlu membuat watermark sendiri.

## Checklist Sebelum Merge

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Cek visual desktop/mobile untuk template baru.
- Pastikan inline editor masih bisa edit teks, gambar, CTA, FAQ, galeri, dan footer.
