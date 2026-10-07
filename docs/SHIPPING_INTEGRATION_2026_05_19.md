# Shipping Integration 2026-05-19

## Keputusan

Webtokoku memakai RajaOngkir/Komerce Shipping Cost API untuk cek ongkir otomatis.

Referensi resmi:

- Endpoint overview: https://www.rajaongkir.com/docs/shipping-cost/getting_started/endpoint
- Authorization/API key: https://www.rajaongkir.com/docs/shipping-cost/getting_started/apikey
- Search domestic destination: https://www.rajaongkir.com/docs/shipping-cost/endpoint-rajaongkir-for-search-base/search-destination-rajaongkir
- Calculate domestic cost: https://www.rajaongkir.com/docs/shipping-cost/endpoint-rajaongkir-for-search-base/calculate-domestic-cost

## Env Vercel yang Wajib Diisi

```env
RAJAONGKIR_API_KEY=isi_dari_collaborator_komerce_shipping_cost
RAJAONGKIR_BASE_URL=https://rajaongkir.komerce.id/api/v1
RAJAONGKIR_DAILY_LIMIT=100
```

Jangan isi API key di frontend atau file public. Key hanya dibaca route server.

## Alur Checkout

1. Pembeli isi alamat.
2. Jika global `auto_shipping` ON dan setting toko `auto_shipping_enabled` ON, UI membuka pencarian lokasi.
3. `/api/shipping/search` mencari destination id ke RajaOngkir.
4. `/api/shipping/cost` menghitung ongkir dari alamat asal toko ke destination id.
5. `/api/orders` tetap menghitung ulang ongkir server-side agar harga dari frontend tidak dipercaya mentah-mentah.

## Fallback

Jika fitur dimatikan admin, dimatikan seller, API key belum diisi, alamat asal belum lengkap, response kurir gagal, atau kuota habis:

- checkout tetap bisa lanjut;
- order tetap masuk;
- `shipping_cost = 0`;
- `shipping_service = "Dikonfirmasi seller via WhatsApp"`;
- pesan WhatsApp memberi konteks bahwa ongkir akan dikonfirmasi seller.

## Kuota

Paket Starter RajaOngkir/Komerce menyediakan 100 hit/hari. Migration `supabase/migrations/step23_rajaongkir_komerce_usage.sql` menambahkan tabel `shipping_api_usage_logs` untuk menghitung hit harian.

Search destination memakai cache 7 hari di `ro_locations`. Cost memakai cache 1 jam untuk kombinasi origin, destination, berat, dan courier agar tidak boros hit.

## Admin

- `/admin/feature-flags` mengatur global `auto_shipping`.
- `/admin` menampilkan status env RajaOngkir key dan hit harian.
- Jika `auto_shipping` OFF, semua toko fallback manual tanpa harus menghapus kode.

## Seller Dashboard

`/dashboard/pengaturan/pengiriman` menyimpan:

- `auto_shipping_enabled`
- `pickup_enabled`
- `cod_enabled`
- `allowed_couriers`
- `free_shipping_minimum`

Saat global admin OFF, toggle seller dibuat tidak aktif dan UI memberi penjelasan.

## Maintenance

Maintenance mode tidak diperlukan untuk perubahan kecil. Jika `maintenance_mode` ON, middleware menutup storefront dan dashboard user ke `/maintenance`, tetapi `/admin` tetap terbuka agar admin bisa mematikan mode tersebut.
