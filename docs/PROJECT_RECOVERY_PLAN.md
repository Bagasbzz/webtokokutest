# Webtokoku Project Recovery Plan

Dokumen ini adalah acuan kerja utama mulai sekarang. Beberapa dokumen lama menyebut fitur sudah selesai, tetapi hasil audit kode menunjukkan ada bagian yang masih placeholder, salah route, atau gagal compile.

## Status Singkat

Project belum siap production.

Update UI recovery:
- Domain production sekarang memakai `webtokoku.id`/`www.webtokoku.id` dengan wildcard tenant `*.webtokoku.id`. Middleware tidak lagi memaksa `www` balik ke apex agar tidak terjadi redirect loop dengan konfigurasi Vercel.
- Landing page sudah dirombak menjadi lebih sederhana dan premium: hero lebih fokus, CTA lebih jelas, template section dipertahankan, dan mobile spacing/ukuran elemen dibuat adaptif.
- SEO dasar sudah ditambahkan: metadata global, canonical ke `https://www.webtokoku.id`, Google site verification meta, structured data, `/blog`, `/sitemap.xml`, dan `/robots.txt`.
- SEO tenant ditingkatkan melalui metadata dinamis di storefront: title, description, canonical, Open Graph, dan image dari hero toko jika tersedia.
- Dashboard seller sudah diganti menjadi command center ringkas dengan CTA utama, checklist kesiapan, ringkasan order, produk aktif, dan empty state.
- Route editor mockup `/dashboard/edit/[storeSlug]` sudah diarahkan ke `/dashboard/editor` supaya seller masuk ke editor inline yang benar.
- Setup Wizard compile-error diganti sementara dengan checklist stabil agar build tidak patah.
- Landing page dipoles pada hero, trust strip, CTA, dan visual preview.
- Publish customizations sekarang memverifikasi ownership `store_id` sebelum menyalin draft ke live.
- Save customizations sekarang menolak key malformed seperti `hero` tanpa `section.element`.
- Admin dashboard sudah punya styling sendiri tanpa bergantung Tailwind dan route dasar `/admin/stores`, `/admin/users`, `/admin/logs`.
- Template Glow dan Herba tidak lagi memasang `data-editable` malformed di level section; section toolbar tetap memakai `data-section-id`.
- Demo statis `/inidemo` sudah diselaraskan dengan positioning Webtokoku sekarang, bukan lagi prototype gelap/indigo lama.
- Editor preview sekarang punya mode fokus inline: panel form bisa disembunyikan, preview tetap bisa discroll normal, dan tooltip menjelaskan perbedaan inline edit vs form.
- TypeScript sudah lolos setelah cleanup UI dan patch lint.
- ESLint sudah punya konfigurasi standar Next dan sekarang lolos tanpa error fatal; warning tersisa terutama soal `<img>` dan dependency hook legacy.
- Build production sempat lolos setelah cleanup awal, tetapi percobaan build terbaru timeout di tahap `Creating an optimized production build ...` tanpa error kode eksplisit. Proses Node yang tertinggal sudah dibersihkan; perlu investigasi build performance/webpack berikutnya.
- Upload gambar produk/editor sekarang dikompres ke WebP sebelum dikirim ke server API. File awal maksimal 3MB, target simpan sekitar 750KB agar lebih ramah Supabase free tier.
- Login dan reset password sudah punya tombol lihat/sembunyikan password.
- Semua template mulai memakai shared section tambahan untuk promo, ulasan, galeri, dokumentasi, lokasi/map, kontak, dan sosial tanpa migrasi database baru. Data tetap masuk ke `template_customizations`.

Masalah utama:
- TypeScript gagal compile di `app/dashboard/edit/[storeSlug]/VisualEditorClient.tsx` dan `app/dashboard/setup/SetupWizardClient.tsx`.
- Ada dua jalur editor: `/dashboard/editor` dan `/dashboard/edit/[storeSlug]`. Jalur pertama lebih dekat ke inline editor asli; jalur kedua adalah mockup dan saat ini rusak.
- Dashboard seller masih banyak data mock.
- Admin dashboard baru punya overview dan feature flags. Menu stores/users/logs belum punya route.
- Beberapa halaman memakai class Tailwind, tetapi project utama tidak punya konfigurasi Tailwind.
- Publish customizations belum memverifikasi ownership `store_id`.

## Prinsip Beresin Project

1. Stabil dulu, baru tambah fitur.
2. Satu fitur harus punya satu route utama, satu sumber data, dan satu alur publish.
3. Jangan percaya status "complete" di dokumen lama tanpa cek kode.
4. Inline edit harus memakai template asli, bukan mockup.
5. Jangan tambah komentar kosong. Komentar harus menjelaskan konteks, alasan, atau batasan.

## Urutan Kerja Rekomendasi

### Phase 0 - Stabilkan Build

Tujuan: project bisa `tsc` dan `next build`.

Task kecil:
- Perbaiki JSX tidak seimbang di `app/dashboard/edit/[storeSlug]/VisualEditorClient.tsx`.
- Perbaiki JSX tidak seimbang di `app/dashboard/setup/SetupWizardClient.tsx`.
- Jalankan `npx tsc --noEmit`.
- Jalankan `npm run lint`.
- Jalankan `npm run build`.
- Catat error baru jika muncul.

Definition of done:
- `npx tsc --noEmit` lolos.
- `npm run lint` lolos tanpa error fatal.
- `npm run build` lolos atau timeout/error tersisa terdokumentasi jelas.

### Phase 1 - Putuskan Satu Jalur Visual Editor

Tujuan: tidak ada dua editor yang saling membingungkan.

Keputusan rekomendasi:
- Pertahankan `/dashboard/editor` sebagai editor utama karena sudah memakai iframe template aktual, overlay, `data-editable`, draft, dan publish.
- Deprecate `/dashboard/edit/[storeSlug]` karena hanya mockup dan tidak inline ke template asli.

Task kecil:
- Ubah tombol dashboard seller "Edit Template" agar mengarah ke `/dashboard/editor`.
- Hapus atau redirect `/dashboard/edit/[storeSlug]` ke `/dashboard/editor`.
- Pastikan menu sidebar dan CTA dashboard memakai route yang sama.
- Tambahkan komentar singkat di route deprecated jika belum dihapus.

Definition of done:
- Seller hanya punya satu jalur edit template.
- Tidak ada link internal aktif ke `/dashboard/edit/[storeSlug]`.

### Phase 2 - Amankan Editor Inline

Tujuan: inline edit benar-benar bekerja dari template aktual.

Task kecil:
- Audit semua template React di `components/templates/*Template.tsx`.
- Pastikan semua editable element memakai key field lengkap seperti `hero.title`, bukan key section seperti `hero`.
- Pastikan setiap key di template ada di `lib/template-editables.ts`.
- Perluas coverage supaya semua objek penting bisa diatur: teks, gambar, tombol/CTA, link, warna, visibility section, urutan section, dan metadata visual lain yang terlihat di template.
- Jika suatu objek belum bisa diedit, tampilkan sebagai non-editable dengan alasan yang jelas atau tambahkan kontrak `data-editable` + schema field-nya.
- Tambahkan `data-section-id` hanya untuk section toolbar, bukan sebagai editable field.
- Validasi save API menolak key tanpa titik.
- Validasi publish API memastikan store milik seller login.
- Uji flow: edit teks hero, save draft, refresh editor, publish, cek storefront.

Definition of done:
- Double click teks di preview mengubah draft.
- Semua objek visual utama yang seller lihat punya cara edit yang jelas: inline, form, atau section toolbar.
- Publish membuat perubahan tampil di `/${slug}`.
- User tidak bisa publish store orang lain.

### Phase 3 - Rapikan Dashboard Seller

Tujuan: dashboard menjadi command center yang benar, bukan mock statistik.

Task kecil:
- Ambil total produk dari DB.
- Ambil total order baru dari `orders`.
- Hitung total pendapatan dari order yang valid.
- Ganti chart statis dengan data 7 hari terakhir.
- Tampilkan recent orders, bukan hanya recent products.
- Hide atau beri label "coming soon" untuk Pelanggan dan Laporan jika belum ada.
- Pastikan CTA utama: tambah produk, lihat toko, edit template.

Definition of done:
- Semua angka utama berasal dari DB.
- Empty state jelas untuk toko baru.
- Tidak ada angka palsu seperti `+100%` atau chart statis.

### Phase 4 - Rapikan Dashboard Admin

Tujuan: admin dashboard tidak menautkan halaman kosong.

Task kecil:
- Buat atau hapus dari sidebar route berikut: `/admin/stores`, `/admin/users`, `/admin/logs`.
- Overview admin harus pakai data nyata atau tampilkan "belum tersedia".
- Ambil system logs dari `admin_logs`, bukan hardcoded.
- Samakan satu pola update feature flag: pilih server action atau API route.
- Pastikan semua aksi admin penting menulis ke `admin_logs`.

Definition of done:
- Semua menu admin bisa dibuka.
- Tidak ada log dummy.
- Non-admin tetap redirect keluar dari `/admin`.

### Phase 5 - Bereskan Styling

Tujuan: UI tidak bergantung pada class yang tidak diproses.

Task kecil:
- Tentukan pakai CSS Modules/global CSS atau pasang Tailwind secara benar.
- Jika tidak memakai Tailwind, ubah halaman admin/setup/editor yang memakai class Tailwind ke CSS Modules.
- Jika memakai Tailwind, tambahkan `tailwind.config`, `postcss.config`, dependency, dan `@tailwind` di global CSS.
- Audit visual mobile/desktop untuk dashboard, admin, dan editor.

Definition of done:
- UI admin/setup/editor tampil sesuai desain.
- Tidak ada class utility mati.

### Phase 6 - Database dan Schema Final

Tujuan: schema yang dipakai kode sama dengan file SQL final.

Task kecil:
- Cocokkan tabel `stores`, `template_customizations`, `template_revisions`, `feature_flags`, `admin_logs` dengan kode.
- Pastikan unique constraint `store_id, section_key, element_key, is_draft` ada.
- Pastikan RLS tidak bertentangan dengan API server yang memakai service role.
- Dokumentasikan migrasi aktif dan migrasi lama.

Definition of done:
- Satu file schema final jelas.
- Semua query utama cocok dengan schema.

### Phase 7 - Konten Toko Tambahan di Semua Template

Tujuan: seller bisa memperkaya storefront tanpa minta developer, tetapi tetap memakai struktur data yang sudah ada.

Task kecil:
- Tambahkan section shared di semua template: banner promo, ulasan, galeri, dokumentasi, map/lokasi, kontak cepat, dan sosial.
- Tambahkan field editor untuk setiap section ke `lib/template-editables.ts` agar seller bisa edit dari form maupun inline.
- Gunakan key baru yang jelas dan tidak bentrok dengan section lama: `promo_banner.*`, `reviews.*`, `gallery.*`, `docs.*`, `location.*`, `contact.*`, `social.*`.
- Buat promo bisa diisi gambar, judul, deskripsi, dan kode promo.
- Buat ulasan bisa diisi sampai 6 slot tanpa tabel baru; slot kosong tidak dirender.
- Buat galeri punya 3 slot gambar + caption sebagai versi awal yang stabil.
- Buat dokumentasi mendukung link YouTube, foto dokumentasi, dan link artikel.
- Buat map menerima link Google Maps biasa atau embed URL. Jika belum diisi, tampilkan instruksi singkat di halaman editor/preview.
- Buat kontak cepat memakai nomor WhatsApp toko dan link sosial opsional.
- Pastikan semua section punya toggle show/hide di editor.
- Audit responsive desktop/mobile agar section baru tidak overflow horizontal.

Definition of done:
- `npx tsc --noEmit`, `npm run lint`, dan `npm run build` lolos.
- Editor menampilkan field tambahan di sidebar.
- Storefront publik merender section baru sesuai tema template.
- Tidak ada migrasi database baru untuk batch ini.
- Push dilakukan sekali setelah seluruh batch lokal aman, lalu produksi dicek sekali setelah deploy.

Catatan scope berikutnya:
- Ulasan "bebas berapa pun" yang benar-benar dinamis butuh UI repeater dan kemungkinan struktur data JSON/tabel baru. Batch ini memberi 6 slot opsional dulu agar aman tanpa migrasi.
- Promo multi-banner/diskon otomatis juga perlu model data khusus. Batch ini fokus banner promo editorial yang tampil di template.

## Peta Alur Saat Ini

### Seller Flow

1. User register/login.
2. Dashboard layout cek user Supabase.
3. Jika belum punya toko, redirect ke `/onboarding`.
4. Dashboard menampilkan ringkasan toko.
5. Produk dikelola dari `/dashboard/produk`.
6. Template seharusnya diedit dari `/dashboard/editor`.
7. Storefront publik tampil di `/${slug}`.

### Admin Flow

1. User login biasa.
2. Role admin disimpan di tabel `sellers.role`.
3. `adminGuard()` mengecek role.
4. Admin bisa buka `/admin`.
5. Feature flags dikelola dari `/admin/feature-flags`.

### Inline Editor Flow yang Diinginkan

1. Seller buka `/dashboard/editor`.
2. Editor load store dan schema editable.
3. Preview iframe render `/dashboard/editor/preview?storeId=...`.
4. Template preview memasang `data-editable` hanya saat `previewMode`.
5. Overlay membaca elemen editable.
6. Double click membuka floating input.
7. Save menyimpan draft ke `template_customizations`.
8. Publish menyalin draft ke live rows.
9. Storefront `/${slug}` membaca live customizations.

## File yang Perlu Diperhatikan

- `app/dashboard/page.tsx` - dashboard seller dan CTA edit template.
- `app/dashboard/DashboardClient.tsx` - layout, auth guard client, feature flag menu.
- `app/dashboard/editor/page.tsx` - entry editor inline yang lebih benar.
- `components/editor/EditorClient.tsx` - orchestrator editor iframe/overlay.
- `components/editor/OverlayCanvas.tsx` - hover, select, double click inline edit.
- `app/dashboard/editor/preview/PreviewClient.tsx` - render template aktual dalam iframe.
- `components/templates/*Template.tsx` - sumber `data-editable`.
- `app/api/customizations/route.ts` - save draft.
- `app/api/customizations/publish/route.ts` - publish draft ke live.
- `app/admin/*` - admin dashboard.
- `lib/feature-flags.ts` - feature flag server helpers.
- `lib/admin-guard.ts` - admin RBAC.

## Dokumentasi

Dokumen aktif:
- `docs/PROJECT_RECOVERY_PLAN.md`
- `docs/README.md`
- `docs/TECHNICAL_DOCUMENTATION.md`
- `docs/VISUAL_EDITOR_SPEC.md`
- `docs/TEMPLATE_AUDIT_REPORT.md`
- `docs/DATABASE_RESET_PLAN.md`
- `docs/ADMIN_SETUP.md`

Dokumen lama yang rawan konflik dipindah ke:
- `docs/archive/legacy-plans/`
# Update 2026-06-01

- API plan Free/Pro diaudit ulang.
- `/api/stores/upgrade` sekarang hanya membuat request upgrade dan mengembalikan link WhatsApp, tidak langsung mengubah plan toko.
- `/api/stores/downgrade` dan `/api/stores/plan-admin` sekarang wajib admin.
- UI Upgrade Pro menampilkan benefit plan terlebih dahulu sebelum user lanjut ke WhatsApp.
