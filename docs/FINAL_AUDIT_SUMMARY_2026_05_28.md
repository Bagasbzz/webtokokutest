# Final Audit Summary - 2026-05-28

## Yang Baru Dikerjakan

- Audit lanjutan 2026-06-01: API plan Free/Pro dikunci ulang.
- Endpoint seller upgrade tidak lagi langsung mengubah plan menjadi Pro; aktivasi tetap melalui admin.
- Tombol Upgrade Pro sekarang membuka modal benefit sebelum mengarah ke WhatsApp.
- Endpoint downgrade dan plan-admin sekarang wajib admin.
- Log plan API memakai UUID user valid, bukan string non-UUID.
- Memperbaiki layout section ekstra storefront agar lebih rapi di desktop, tablet, dan mobile.
- Mengunci footer semua template agar menjadi 3 kolom di desktop/tablet dan 1 kolom rapi di mobile.
- Mengubah dokumentasi gambar dari crop terlalu gepeng menjadi landscape normal dengan lebar dibatasi.
- Mengecilkan treatment heading Luna/Luxe supaya tetap punya karakter, tapi tidak lagi terlalu besar dan pecah aneh.
- Menjaga section tetap memakai `data-editable`, jadi masih nyambung dengan sistem edit template.
- Memastikan Free/Pro plan system punya migrasi dasar di `supabase/migrations/step32_store_plan.sql`.
- Membersihkan artefak test lokal supaya tidak ikut masuk commit.

## Kesalahan yang Terjadi

- Fix footer sebelumnya belum cukup tegas karena `.f-grid` tidak dipaksa `display: grid` di guard terakhir.
- Dokumentasi sempat masih terlihat gepeng karena `max-height` terlalu kecil saat gambar melebar.
- Perubahan visual awal terlalu fokus desktop, padahal storefront toko online harus mobile-first.

## Status Verifikasi

- `npm run build` berhasil.
- `npx tsc --noEmit` berhasil setelah build membuat ulang `.next/types`.
- Smoke test lokal `http://localhost:3021/demo/kesehatan.html` berhasil HTTP 200.
- Browser check lokal: footer desktop terbaca `display: grid` dengan 3 kolom.
- Browser check lokal: dokumentasi gambar terbaca 860 x 484, ratio 1.78 atau landscape normal.

## Catatan Dokumentasi

- `docs/README.md` sekarang menjadi index utama.
- Rekomendasi schema lama dari `SCHEMA_RECOMMENDATION.md` dipindahkan ke `docs/DATABASE_RESET_PLAN.md`.
- File SQL migration tidak digabung menjadi satu karena lebih aman sebagai histori incremental.
- Untuk fresh database, pakai panduan di `supabase/README.md`.

## Sisa Risiko

- Warning build soal `<img>` dan beberapa hook dependency masih ada dari kode lama, tapi bukan error blocking.
- Screenshot production perlu dicek lagi setelah deploy karena custom domain bisa punya data toko berbeda dari demo lokal.
- Route analytics `/api/traffic` tetap publik dengan service role karena dipakai untuk mencatat kunjungan storefront; perlu rate limit jika traffic production sudah besar.
