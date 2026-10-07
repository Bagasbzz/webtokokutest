# webtokoku

> **Bukan Sekadar Link di Bio. Ini Toko Online Profesionalmu.**

[![Deploy Status](https://img.shields.io/badge/deployed%20on-vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Database](https://img.shields.io/badge/database-supabase-green?style=flat&logo=supabase)](https://supabase.com)
[![Framework](https://img.shields.io/badge/framework-next.js%2014-black?style=flat&logo=next.js)](https://nextjs.org)

Platform SaaS website builder untuk UMKM Indonesia. Buat website toko online dalam 10 menit — tanpa coding, tanpa potongan komisi.

---

## 🚀 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **5 Template Premium** | Dapur Nusantara, Butik Hana, Glow Lab, Luna Beauty, Bazzhealth |
| **Multi-Tenant** | Setiap seller punya subdomain unik: `namatoko.webtokoku.my.id` |
| **WhatsApp Checkout** | Pesanan masuk langsung ke WhatsApp seller |
| **Dashboard Seller** | Kelola produk, pesanan, dan pengaturan toko |
| **Demo Mode** | Coba fitur tanpa daftar dulu |
| **Responsive** | Tampilan optimal di desktop, tablet, dan mobile |

---

## 📁 Struktur Project

```
webtokoku/
├── app/                          # Next.js App Router
│   ├── [slug]/                   # Halaman toko publik (multi-tenant)
│   ├── api/                      # API endpoints
│   ├── auth/                     # Login & Register
│   ├── dashboard/                # Dashboard seller
│   │   ├── page.tsx              # Dashboard home
│   │   ├── produk/               # Kelola produk
│   │   ├── pesanan/              # Kelola pesanan
│   │   └── pengaturan/           # Pengaturan toko
│   ├── onboarding/               # Setup toko pertama
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components reusable
├── lib/                          # Utilities & configs
│   ├── auth.ts                   # Auth helpers
│   ├── product.ts                # Product CRUD
│   ├── store.ts                  # Store CRUD
│   ├── templates.ts              # Template definitions
│   ├── types.ts                  # TypeScript types
│   └── supabase/                 # Supabase client
│       └── client.ts             # Browser client
├── public/                       # Static assets
│   ├── demo/                     # Template demo files
│   │   ├── makanan.html          # Dapur Nusantara
│   │   ├── fashion.html          # Butik Hana
│   │   ├── skincare.html         # Glow Lab
│   │   ├── kosmetik.html         # Luna Beauty
│   │   └── kesehatan.html        # Bazzhealth
│   ├── inidemo/                  # Demo mode isolated
│   └── template-previews/        # Screenshot previews
├── supabase/                     # Database
│   ├── schema.sql                # Database schema
│   └── migrations/               # Migration files
├── docs/                         # Dokumentasi
│   ├── webapaini.md              # Overview project
│   ├── SYSTEM_PLAN.md            # Blueprint teknis MVP
│   ├── INTEGRATION_PLAN.md       # Roadmap integrasi
│   ├── REBUILD_PLAN.md           # Rencana rebuild
│   ├── PROJECT_LOG.md            # Log perkembangan
│   ├── DISCUSSION_LOG.md         # Log diskusi teknis
│   ├── discussion.md             # Diskusi terbaru
│   ├── CHANGELOG.md              # Riwayat perubahan
│   └── CODEBASE_AUDIT.md         # Audit kode
├── next.config.mjs               # Next.js config
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage |
| **Hosting** | Vercel |
| **Styling** | CSS Modules + Inline Styles |

---

## 🚦 Cara Kerja (User Flow)

```
Seller Daftar
    ↓
Onboarding (pilih template, isi info toko)
    ↓
Setup Katalog Produk
    ↓
Publish Website
    ↓
Share Link ke Customer
    ↓
Pesanan Masuk via WhatsApp
```

---

## 📝 Dokumentasi

Semua dokumentasi ada di folder `/docs/`:

| File | Isi |
|------|-----|
| `webapaini.md` | Overview project, target user, fitur MVP |
| `SYSTEM_PLAN.md` | Blueprint teknis lengkap MVP |
| `INTEGRATION_PLAN.md` | Roadmap post-MVP (payment, ongkir, dll) |
| `REBUILD_PLAN.md` | Rencana rebuild landing page & demo |
| `PROJECT_LOG.md` | Log perkembangan per sesi |
| `DISCUSSION_LOG.md` | Log diskusi teknis & arsitektur |
| `discussion.md` | **Diskusi terbaru (8 Mei 2026)** |
| `CHANGELOG.md` | Riwayat perubahan kode |
| `CODEBASE_AUDIT.md` | Audit kode & analisis struktur |

---

## 🎨 Template yang Tersedia

| Template | Kategori | Preview |
|----------|----------|---------|
| **Dapur Nusantara** | Kuliner / F&B | Warm, homestyle, appetizing |
| **Butik Hana** | Fashion / Pakaian | Elegant, minimalist, premium |
| **Glow Lab** | Skincare | Fresh, clean, trustworthy |
| **Luna Beauty** | Kosmetik | Modern, bold, feminine |
| **Bazzhealth** | Apotek / Kesehatan | Professional, clean, medical |

---

## 🔧 Environment Variables

Buat file `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
NEXT_PUBLIC_SITE_URL=https://webtokoku.my.id
```

---

## 🚀 Deployment

### Local Development
```bash
npm install
npm run dev
```

### Production (Vercel)
1. Push ke GitHub
2. Import project di Vercel
3. Set environment variables
4. Deploy

---

## 🐛 Troubleshooting

### Supabase Client Error
Jika mendapat error `Cannot find name 'supabase'`:
```typescript
// Salah ❌
const supabase = createClient() // di top level

// Benar ✅
const handleAction = async () => {
  const supabase = createClient() // di dalam fungsi async
  // ...
}
```

### Domain Tidak Tervalidasi
1. Cek DNS records di provider domain
2. Pastikan A record ke IP Vercel yang benar
3. Klik "Refresh" di Vercel dashboard → Domains
4. Tunggu 2-5 menit untuk DNS propagation

---

## 📄 License

Private - Untuk penggunaan internal dan komersial.

---

## 👥 Kontributor

- **Product Owner & Developer**: User
- **AI Assistant**: Cascade (Windsurf)

---

*Last Updated: 8 Mei 2026*
