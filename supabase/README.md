# Supabase Schema Guide

## Prinsip

File SQL di folder ini sengaja tidak digabung semua menjadi satu migration besar. Untuk project yang sudah punya user production, histori migration lebih aman dipertahankan agar perubahan bisa ditelusuri.

## Fresh Install

Untuk database kosong:

1. Jalankan `1_RESET_ONLY.sql` hanya kalau database memang boleh dikosongkan.
2. Jalankan `2_CREATE_ALL.sql`.
3. Jalankan migration tambahan di `supabase/migrations/` sesuai urutan angka step.
4. Pastikan `step32_store_plan.sql` ikut dijalankan untuk sistem Free/Pro.

## Production Existing Database

Untuk database yang sudah dipakai user:

1. Jangan jalankan `1_RESET_ONLY.sql`.
2. Jalankan hanya migration yang belum pernah diterapkan.
3. Untuk plan system terbaru, jalankan `migrations/step32_store_plan.sql`.
4. Simpan catatan manual migration yang sudah dijalankan agar tidak dobel.

## File Utama

- `schema.sql`: schema awal lama.
- `final_schema.sql`: snapshot schema final hasil konsolidasi lama.
- `2_CREATE_ALL.sql`: setup besar untuk database baru.
- `migrations/`: perubahan incremental setelah schema awal.

## Catatan

Kalau nanti sudah pakai Supabase CLI penuh, format terbaik adalah satu folder migration timestamp resmi. Untuk sekarang, jangan hapus file step lama karena masih berguna sebagai audit trail.
