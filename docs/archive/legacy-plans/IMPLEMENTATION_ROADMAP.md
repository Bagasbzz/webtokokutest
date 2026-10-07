# 🗺️ IMPLEMENTATION ROADMAP — webtokoku

> Timeline, milestones, dan task breakdown untuk pengembangan post-MVP.

---

## 📊 Progress Saat Ini

| Phase | Status | Completion |
|---|---|---|
| Phase 1: Core MVP (Step 0-7) | ✅ Complete | 100% |
| Phase 2: Templates & Polish (Step 8-11) | ✅ Complete | 100% |
| Phase 3: Shipping & Orders (Step 12) | 🔧 In Progress | 60% |
| Phase 4: Visual Editor (Step 16) | 📋 Planned | 0% |
| Phase 5: Admin & Scale (Step 14-15) | ❌ Not Started | 0% |

---

## 🔴 NEXT: Integrasi API.co.id (Ongkir Otomatis)

> **Status:** API route dasar sudah ada (`/api/shipping/apico-cost`), API key sudah di Vercel. Perlu integrasi ke UI checkout.

### Apa yang Sudah Ada
- ✅ `app/api/shipping/apico-cost/route.ts` — proxy ke API.co.id
- ✅ `APICO_API_KEY` di Vercel environment
- ✅ `store_addresses` & `shipping_settings` tables di Supabase
- ✅ Dashboard pages: `/pengaturan/alamat` & `/pengaturan/pengiriman`
- ✅ `UniversalCatalog.tsx` sudah punya 4-step checkout flow

### Yang Perlu Dikerjakan

| # | Task | Dependency | Estimasi |
|---|---|---|---|
| 1 | Fix `apico-cost/route.ts` — ganti header dari `Bearer` ke `x-api-co-id` | — | 30 min |
| 2 | Buat `/api/shipping/apico-search/route.ts` — proxy search lokasi (villages) | — | 1 jam |
| 3 | Update dashboard alamat — search lokasi via API.co.id, simpan village_code (10-digit) | Task 2 | 2 jam |
| 4 | Update `UniversalCatalog` — step alamat pake search village API.co.id | Task 2 | 2 jam |
| 5 | Update `UniversalCatalog` — step ongkir fetch dari `/api/shipping/apico-cost` | Task 1, 4 | 2 jam |
| 6 | Parse response API.co.id → tampilkan list kurir + harga + ETD | Task 5 | 1 jam |
| 7 | Fallback UI jika API error ("Seller akan konfirmasi ongkir via WA") | Task 5 | 30 min |
| 8 | Testing end-to-end checkout flow | All | 1 jam |

### API.co.id Integration Details

```
Auth Header: x-api-co-id: {APICO_API_KEY}
Base URL: https://use.api.co.id

Endpoints yang dipakai:
1. GET /regional/indonesia/districts/{code}/villages  → List desa per kecamatan
2. GET /regional/indonesia/search?name={query}        → Search lokasi (Premium)
3. GET /expedition/shipping-cost?origin=...&destination=...&weight=...&courier=...
```

### Validasi Sebelum Publish Toko
```
✓ Nomor WhatsApp sudah diisi
✓ Alamat toko lengkap (village_code 10-digit wajib ada)
✓ Minimal 1 produk aktif
✓ Semua produk aktif punya berat_gram > 0
✓ Minimal 1 metode pembayaran aktif
```

---

## 🟡 PLANNED: Visual Template Editor

> **Lihat:** [`VISUAL_EDITOR_SPEC.md`](./VISUAL_EDITOR_SPEC.md) untuk detail teknis lengkap.

| Task | Estimasi |
|---|---|
| Database migration (`template_customizations`) | 1 jam |
| `useCustomizations` hook | 2 jam |
| `EditableText` + `EditableImage` components | 4 jam |
| `VisualEditor` wrapper + toolbar | 3 jam |
| Integrate ke 5 template | 5 jam |
| Testing & polish | 3 jam |
| **Total** | **~2-3 hari** |

**Prerequisites:** Shipping integration selesai dulu (agar checkout flow stabil).

---

## 🟡 PLANNED: Dashboard Admin Platform

### Menu MVP
```
Dashboard        → Statistik: total user, toko aktif, revenue, conversion
Users            → List seller, suspend, login-as-user
Stores           → List toko, set maintenance per toko
Templates        → Manage template registry
Plans            → Manage subscription tiers
Feature Flags    → Toggle fitur per toko
System Settings  → API keys, maintenance mode global
Activity Logs    → Audit trail
```

### Fitur Kritis
- **Login as User** — admin bisa view sebagai seller (wajib audit log)
- **Maintenance per Toko** — nonaktifkan 1 toko tanpa mematikan yang lain
- **Feature Flags** — nyalakan fitur baru bertahap per toko

### SQL Migration
```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT,
  enabled_globally BOOLEAN DEFAULT false
);

CREATE TABLE store_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  feature_key TEXT,
  enabled BOOLEAN DEFAULT false
);

CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  action TEXT NOT NULL,
  target_type TEXT,    -- 'store' | 'user' | 'product'
  target_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID,
  source TEXT,         -- 'dashboard' | 'storefront' | 'checkout' | 'shipping'
  route TEXT,
  message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🟢 FUTURE: Integrasi Lanjutan

### Notifikasi WhatsApp Otomatis
- **Provider:** Fonnte / Wablas / Woowa
- **Events:** Order masuk → seller, Pembayaran diterima → seller + pembeli, Pesanan dikirim → pembeli (dengan resi)

### Marketplace Sync
- **Shopee:** open.shopee.com (approval 2-4 minggu)
- **TikTok Shop:** partner.tiktokshop.com

### Custom Domain
- Seller bisa map domain sendiri ke toko mereka
- Vercel Domains API untuk automated provisioning

---

## ⚙️ Maintenance Levels

| Level | Efek |
|---|---|
| Dashboard Maintenance | Dashboard seller offline. Toko publik tetap online. |
| Per-Toko Maintenance | 1 toko nonaktif. Toko lain tetap hidup. |
| Per-Fitur Maintenance | 1 fitur (misal ongkir) offline. Website tetap jalan. |
| Global (DARURAT) | Semua terdampak. Hanya untuk kondisi kritis. |

---

## 🔖 Execution Rules

1. **Kerjakan sesuai prioritas:** 🔴 P0 → 🟡 P1 → 🟢 P2
2. **Test di development** sebelum push ke production
3. **API keys** hanya di server-side, terenkripsi di Vercel env
4. **Update dokumen** setelah selesai tiap milestone
5. **Jangan loncat step** — selesaikan yang in-progress dulu
