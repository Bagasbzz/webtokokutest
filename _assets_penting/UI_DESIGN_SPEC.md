# 🎨 UI DESIGN SPEC — webtokoku
> Dokumen ini adalah "DNA Desain" platform webtokoku.
> Wajib dibaca AI sebelum membuat komponen atau halaman apapun.
> Diextract dari 7 template referensi milik owner.

---

## 📚 Ringkasan Analisis 7 Template Referensi

| No | Folder | Stack | Vibe | Elemen Kunci yang Diadopsi |
|---|---|---|---|---|
| 1 | `Reanbazz` | Next.js + Tailwind | Dark Industrial | Hero fullscreen + zoom BG, uppercase headings, btn-primary/outline pattern, floating WA button |
| 2 | `bakerybz` | Next.js + Tailwind | Premium Artisan | Parallax scroll hero, rotating badge SVG, overlapping dual image, WA button native di hero |
| 3 | `bazzcoffe` | Next.js + Shadcn | Dark Elegant | Product card dengan hover scale, category badge, harga Indonesia Rp format, pricing card |
| 4 | `bazzgrow` | HTML/CSS/JS | Luxury Minimal | Glass panel cards, carousel slides, reveal animation on scroll, testimonial slider + progress bar |
| 5 | `bazztnt` | HTML/CSS/JS | Premium Travel | Bento grid layout, glass search card di hero, hero stats bar, slider track dengan dots, glass pill cards, CTA card gradient |
| 6 | `bazzlong` | Next.js + Tailwind | Long-form scroll | Long-form landing page structure |
| 7 | `gymbazz` | Next.js + Tailwind | Fitness Bold | Modular component per section, pricing + testimonial + schedule sections |
| 8 | `bazzhealth` | Next.js + Tailwind | Health & Apotek | Emerald Green (#23A455), badge produk (RESEP, P3K), clean white surface dengan green tint |

---

## 🎨 Design System webtokoku

### 1. Warna Utama

```css
:root {
  /* Background */
  --bg-primary: #080814;       /* Background utama - sangat dark navy */
  --bg-surface: #10101E;       /* Card/section background */
  --bg-card: #18182C;          /* Card dalam card */
  --bg-glass: rgba(255,255,255,0.04); /* Glass morphism */

  /* Brand Colors */
  --color-indigo: #6366F1;     /* Primary - trust & professional */
  --color-indigo-light: rgba(99,102,241,0.15);
  --color-emerald: #10B981;    /* Secondary - growth & money */
  --color-emerald-light: rgba(16,185,129,0.12);
  --color-amber: #F59E0B;      /* CTA - action & attention */
  --color-amber-light: rgba(245,158,11,0.15);
  --color-whatsapp: #25D366;   /* WA button - always this exact color */

  /* Text */
  --text-primary: #F0F4FF;
  --text-secondary: #C8CEDD;
  --text-muted: #8B92B8;

  /* Border */
  --border: rgba(255,255,255,0.07);
  --border-hover: rgba(255,255,255,0.15);
}
```

### 2. Tipografi

```css
/* Import di setiap halaman */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap');

/* Penggunaan */
--font-body: 'Inter', sans-serif;       /* Semua teks body, UI, label */
--font-heading: 'Outfit', sans-serif;   /* Semua heading h1-h4 */

/* Scale */
h1: 3rem - 5rem (mobile: 2.2rem)   — font-weight: 800-900
h2: 2rem - 3rem (mobile: 1.8rem)   — font-weight: 700
h3: 1.5rem      (mobile: 1.3rem)   — font-weight: 600
body: 1rem, line-height: 1.6
small/caption: 0.875rem
```

### 3. Komponen Kunci

#### A. Button System
```css
/* Primary - untuk CTA utama */
.btn-primary {
  background: var(--color-indigo);
  color: white;
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(99,102,241,0.3);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99,102,241,0.4); }

/* CTA amber - untuk konversi utama */
.btn-cta {
  background: var(--color-amber);
  color: #000;
  font-weight: 700;
}

/* WhatsApp - SELALU pakai warna ini */
.btn-whatsapp {
  background: #25D366;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Outline */
.btn-outline {
  border: 1.5px solid var(--border-hover);
  color: var(--text-primary);
  background: transparent;
}
.btn-outline:hover { border-color: var(--color-indigo); color: var(--color-indigo); }
```

#### B. Card System
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.4s;
}
.card:hover {
  border-color: var(--border-hover);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

/* Glass Card - dipakai untuk stats, testimonial */
.card-glass {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 16px;
}
```

#### C. Product Card (untuk demo toko)
Terinspirasi dari `bazzcoffe/product-card.tsx`:
```
- Rounded: 16px
- Gambar: tinggi 220-260px, object-cover, hover scale 1.08
- Badge kategori: uppercase, tracking-widest, bg accent/10
- Nama produk: font-heading, bold, hover color primary
- Harga: format Rp xxx.xxx (toLocaleString id-ID)
- CTA: tombol WA full-width, hijau #25D366
```

#### D. Hero Section Pattern
Terinspirasi dari `Reanbazz` + `bazztnt`:
```
- Full-height (min-height: 100vh)
- Background: gambar dengan overlay gradient gelap dari kiri
- Konten: max-width container, align kiri
- Urutan: badge/label kecil → H1 besar → deskripsi → 2 CTA button
- Stats bar: 3 angka di bawah CTA (jumlah seller, dll)
- Animasi: fade-in + slide-up saat load
```

#### E. Scroll Reveal Animation
Terinspirasi dari `bazzgrow`:
```js
// Pattern wajib untuk semua section
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```
```css
.reveal { opacity: 0; transform: translateY(30px); transition: all 0.7s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }
```

#### F. Floating WA Button
Terinspirasi dari `Reanbazz/FloatingButtons.tsx`:
```
- Fixed, bottom-right
- Background: #25D366
- Shadow: 0 4px 20px rgba(37,211,102,0.4)
- Ukuran: 56px x 56px, border-radius: 50%
- Mobile: selalu tampil
- Desktop: tampil setelah scroll 300px
- Animasi: pulse subtle
```

#### G. Bento Grid (Promo Section)
Terinspirasi dari `bazztnt` bento grid:
```
- Layout: 1 item besar kiri + 2 item kecil kanan (atau 3 kolom)
- Background: gambar dengan overlay gelap
- Konten di atas gambar: judul + deskripsi + harga + CTA
- Hover: overlay lebih gelap, konten slide up
```

#### H. Navbar Pattern
```
- Transparent saat di atas
- Dark glass (backdrop-blur) setelah scroll 50px
- Logo kiri, nav-links tengah, CTA kanan
- Mobile: hamburger → slide-down menu atau full overlay
- Height: 70-80px
```

---

## 📱 Responsivitas (Mobile-First)

```
Mobile:  320px - 767px   → 1 kolom, padding 16-20px
Tablet:  768px - 1023px  → 2 kolom
Desktop: 1024px+         → 3-4 kolom, max-width 1280px
```

**Breakpoints:**
```css
@media (max-width: 767px) { /* mobile */ }
@media (min-width: 768px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
```

**Mobile Priority Rules:**
- Tombol WA sticky di bottom pada mobile
- Font heading lebih kecil 30-40% di mobile
- Gambar full-width di mobile
- Hapus animasi kompleks di mobile (gunakan `prefers-reduced-motion`)
- Touch target minimum 44x44px

---

## 🏪 8 Template Toko webtokoku

Setiap template harus punya: Navbar, Hero, Produk Grid, Sticky WA Button, Footer

| # | Nama Template | Kategori | Vibe Desain | Warna Aksen |
|---|---|---|---|---|
| 1 | **Flash** | General / Serba Ada | Clean, Minimalist, Speed | Biru `#3B82F6` |
| 2 | **Butik** | Fashion & Hijab | Elegant, Feminine, Soft | Rose `#F43F5E` |
| 3 | **Dapur** | Makanan & Minuman | Warm, Appetite, Homey | Orange `#EA580C` |
| 4 | **Glow** | Skincare & Beauty | Fresh, Clean, Trust | Emerald `#059669` |
| 5 | **Luxe** | Kosmetik & Makeup | Premium, Dramatic, Bold | Purple `#7C3AED` |
| 6 | **Brix** | Elektronik & Gadget | Tech, Sharp, Modern | Cyan `#0EA5E9` |
| 7 | **Herba** | Produk Herbal/Kesehatan | Natural, Earthy, Trust | Bazzhealth Green `#23A455` |
| 8 | **Craft** | Handmade / UMKM | Artisan, Cozy, Personal | Amber `#D97706` |

### Struktur Setiap Template Toko:
```
1. Navbar (logo toko + kategori + ikon WA)
2. Hero Banner (foto toko/promo, tagline, tombol "Lihat Produk")
3. Produk Grid (min 6 produk, card dengan tombol "Order WA")
4. About/Story (singkat, 2-3 kalimat)
5. Testimonial (2-3 ulasan pelanggan)
6. Footer (nama toko, kontak, sosmed)
7. Sticky WA Button (bottom, mobile & desktop)
8. Demo Badge (pojok atas: "DEMO - Toko Ini Bisa Jadi Punya Kamu")
```

---

## ⚙️ Tech Stack untuk Template Toko

**Keputusan FINAL: HTML + CSS + Vanilla JS**

**Alasan:**
- Paling ringan & cepat load dari HP sinyal menengah
- Tidak butuh build process → langsung buka di browser
- Mudah di-deploy ke Vercel via drag & drop
- AI lebih mudah generate konsisten tanpa framework setup
- Lebih mudah dikustomisasi nanti oleh AI generator

**BUKAN Next.js** untuk template toko (Next.js hanya untuk platform dashboard nanti di Tahap 2+)

---

## 🚫 Yang DILARANG dalam Desain

- ❌ Background putih polos (terlalu murah, tidak premium)
- ❌ Warna generik (merah/biru/hijau plain tanpa nuance)
- ❌ Font default browser
- ❌ Border radius 0 (terlalu kaku) atau > 24px pada card utama
- ❌ Animasi berlebihan yang bikin loading lambat
- ❌ Teks terlalu kecil di mobile (min 14px untuk body)
- ❌ Tombol WA tanpa ikon WhatsApp
- ❌ Gambar tanpa alt text

---

## ✅ Yang WAJIB ada di Setiap Halaman

- ✅ Font Inter + Outfit dari Google Fonts
- ✅ Meta viewport mobile-first
- ✅ Tombol Order via WhatsApp yang jelas dan visible
- ✅ Harga dalam format Rupiah (Rp xxx.xxx)
- ✅ Scroll reveal animation pada section
- ✅ Navbar yang berubah saat scroll (glass effect)
- ✅ Loading cepat (gambar dari Unsplash dengan ukuran spesifik `?w=400&h=400&fit=crop`)
