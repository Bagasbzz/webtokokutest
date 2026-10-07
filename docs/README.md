# Webtokoku Documentation Index

Mulai dari dokumen ini. Beberapa dokumen lama berisi klaim fitur "complete" yang tidak lagi akurat terhadap kode saat ini.

## Baca Pertama

1. `FINAL_AUDIT_SUMMARY_2026_05_28.md`  
   Rekap final singkat: apa yang baru dibenahi, kesalahan yang sempat terjadi, status verifikasi, dan sisa risiko.

2. `PROJECT_RECOVERY_PLAN.md`  
   Acuan utama arah kerja, urutan task, dan status nyata hasil audit kode.

3. `TECHNICAL_DOCUMENTATION.md`  
   Catatan arsitektur, API, database, dan pola Supabase.

4. `VISUAL_EDITOR_SPEC.md`  
   Target desain untuk inline editor yang mengedit template langsung.

5. `TEMPLATE_AUDIT_REPORT.md`  
   Catatan kontrak `data-editable` dan section template.

6. `DATABASE_RESET_PLAN.md`  
   Rencana schema final, konflik migration, dan rekomendasi schema yang sudah digabung dari dokumen lama.

7. `ADMIN_SETUP.md`  
   Cara setup role admin dan CAPTCHA.

8. `UI_AUDIT_2026_05_19.md`  
   Catatan arah visual baru, audit UI awal, dan prioritas polish halaman/template.

9. `SHIPPING_INTEGRATION_2026_05_19.md`
   Catatan integrasi RajaOngkir/Komerce, env Vercel, fallback, kuota 100 hit/hari, dan maintenance mode.

10. `SESSION_AUDIT_2026_05_19_PRODUCT_SYSTEM.md`
   Catatan sesi audit produk, kategori, variasi, add-on, checkout, admin setup, status verifikasi, dan pekerjaan lanjutan.

## Dokumen Root

- `../README.md` - overview publik project.
- `../CHANGELOG.md` - changelog terbaru di root.
- `../discussion.md` - log diskusi panjang. Baca sebagai histori, bukan sumber kebenaran tunggal.

## Dokumen Historis yang Tetap Disimpan

- `docs/CHANGELOG.md` - changelog lama di folder docs; root `CHANGELOG.md` tetap sumber utama.
- `discussion.md` - log diskusi panjang; jangan dijadikan acuan implementasi tanpa cek kode.

## Arsip

Dokumen lama yang terlalu panjang atau saling bertentangan dipindah ke:

`docs/archive/legacy-plans/`

Isi arsip tidak dihapus karena masih bisa berguna untuk melihat keputusan lama, tetapi jangan dijadikan acuan implementasi tanpa verifikasi kode.

## Aturan Update Dokumentasi

- Jika menemukan bug baru, tambahkan ke `PROJECT_RECOVERY_PLAN.md` bagian phase terkait.
- Jika menyelesaikan task, update definition of done di dokumen yang sama.
- Jangan membuat execution plan baru kecuali menggantikan dokumen aktif.
- Changelog hanya untuk perubahan yang benar-benar sudah dilakukan.
- Setiap perubahan kode/schema/UI harus disertai update file Markdown yang relevan sebelum dianggap selesai.
- Jangan membuat file audit baru kalau isinya bisa masuk ke `FINAL_AUDIT_SUMMARY_2026_05_28.md`, `PROJECT_RECOVERY_PLAN.md`, atau `DATABASE_RESET_PLAN.md`.
- Setelah perubahan aman diuji, target push adalah repository `Bazzcuy/webtokoku.git` dengan identitas email `nanamigemoy@gmail.com`.
