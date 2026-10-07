# 🎨 VISUAL EDITOR SPEC — webtokoku

> Spesifikasi fitur visual template editor: Click-to-Edit untuk kustomisasi template tanpa coding.

---

## 📋 Problem Statement

Saat ini seller hanya bisa memilih template dan mengisi data via form dashboard. Template yang ditampilkan di storefront sudah bagus, tapi seller **tidak bisa mengedit elemen visual** (teks hero, gambar, section visibility) secara langsung. Editor dashboard menampilkan form polosan, bukan preview template yang bisa di-edit.

**Gap:** Tidak ada koneksi visual antara template yang dipilih dengan editor di dashboard.

---

## 🎯 Solution: Click-to-Edit

Implementasi visual editor dengan pendekatan **Click-to-Edit** — seller klik elemen di preview template, modal edit muncul, perubahan tersimpan real-time.

### Scope
- ✅ Click-to-edit teks (heading, paragraph, button text)
- ✅ Click-to-replace gambar (hero, section images)
- ✅ Section visibility toggle (show/hide sections)
- ✅ Real-time preview
- ✅ Per-store customization (multi-tenant safe)
- ❌ **No drag & drop** (scope limitation untuk MVP)
- ❌ **No layout changes** (template structure tetap)

---

## 🏗️ Technical Architecture

### Database: `template_customizations`

```sql
CREATE TABLE template_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,          -- 'hero', 'about', 'promo', 'footer'
  element_key TEXT NOT NULL,          -- 'title', 'subtitle', 'image_url', 'visible'
  value TEXT NOT NULL,                -- Nilai kustom (teks atau URL gambar)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, section_key, element_key)
);

ALTER TABLE template_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customization_owner" ON template_customizations FOR ALL
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "customization_public" ON template_customizations FOR SELECT
  USING (true);
```

### Component Structure

```
components/
├── editor/
│   ├── VisualEditor.tsx          ← Wrapper: toggle edit mode on/off
│   ├── EditableText.tsx          ← Klik teks → modal edit → save
│   ├── EditableImage.tsx         ← Klik gambar → upload → replace
│   ├── SectionToggle.tsx         ← Show/hide section
│   ├── EditorToolbar.tsx         ← Toolbar: Save, Preview, Publish
│   └── useCustomizations.ts     ← Hook: fetch/save customizations
```

### Data Flow

```
Dashboard Edit Mode:
  1. Seller buka /dashboard/editor
  2. Load template preview + fetch customizations dari DB
  3. Overlay edit controls pada setiap editable element
  4. Seller klik elemen → modal muncul → edit → save
  5. UPSERT ke template_customizations (section_key + element_key)

Public Storefront:
  1. /[slug] → fetch store + products + customizations
  2. Template render dengan customizations applied (override defaults)
  3. Tidak ada edit controls (read-only)
```

---

## 📝 Editable Elements per Template

### Dapur Nusantara (Kuliner)
| Section | Element | Key | Default |
|---|---|---|---|
| Hero | Judul | `hero.title` | "Cita Rasa Asli Nusantara." |
| Hero | Subjudul | `hero.subtitle` | "Nikmati kelezatan sejati..." |
| Hero | Gambar Utama | `hero.image_url` | Unsplash food photo |
| Hero | Gambar Float | `hero.float_image_url` | Rendang photo |
| Promo | Judul | `promo.title` | "Makan Puas!" |
| Promo | Deskripsi | `promo.description` | "Diskon spesial..." |
| Promo | Badge | `promo.badge_text` | "EXCLUSIVE - HEMAT 20%" |
| About | Visible | `about.visible` | `true` |
| Footer | Tagline | `footer.tagline` | "Menyajikan kelezatan..." |

### Butik Hana (Fashion)
| Section | Element | Key | Default |
|---|---|---|---|
| Hero | Judul | `hero.title` | Nama toko |
| Hero | Subjudul | `hero.subtitle` | Deskripsi toko |
| Hero | Banner | `hero.image_url` | Fashion banner |
| USP | Items | `usp.items` | JSON array of USP cards |
| Collection | Visible | `collection.visible` | `true` |

### Pattern yang sama untuk Glow, Luxe, Herba

Setiap template memiliki **8-15 editable elements** yang di-define di registry:

```typescript
// lib/template-editables.ts
export const TEMPLATE_EDITABLES: Record<string, EditableElement[]> = {
  dapur: [
    { section: 'hero', element: 'title', type: 'text', label: 'Judul Hero' },
    { section: 'hero', element: 'image_url', type: 'image', label: 'Gambar Hero' },
    { section: 'promo', element: 'visible', type: 'toggle', label: 'Tampilkan Promo' },
    // ...
  ],
  butik: [ ... ],
  glow: [ ... ],
  luxe: [ ... ],
  herba: [ ... ],
}
```

---

## 🔄 User Flow

```
Seller Login → Dashboard → Klik "Edit Template"
  ↓
Preview template muncul dengan overlay edit icons
  ↓
Seller klik ikon ✏️ pada elemen
  ↓
Modal muncul:
  - Text: textarea + preview
  - Image: file upload + crop preview
  - Section: toggle on/off
  ↓
Seller klik "Simpan"
  ↓
UPSERT ke template_customizations
  ↓
Preview update real-time
  ↓
Seller klik "Publish" → perubahan live di storefront
```

---

## 🛡️ Constraints & Decisions

| Keputusan | Alasan |
|---|---|
| UPSERT per-element, bukan JSON blob | Granular control, avoid merge conflicts |
| Public SELECT policy | Storefront perlu baca customizations tanpa auth |
| No drag & drop | Complexity terlalu tinggi untuk MVP, click-to-edit sudah cukup |
| Template structure immutable | Seller edit konten, bukan layout — menjaga kualitas visual |
| Fallback ke defaults | Jika customization belum ada, template render default values |

---

## 📊 Implementation Estimate

| Task | Estimasi |
|---|---|
| Database migration + RLS | 1 jam |
| `useCustomizations` hook | 2 jam |
| `EditableText` + `EditableImage` | 4 jam |
| `VisualEditor` wrapper + toolbar | 3 jam |
| Integrate ke 5 template | 5 jam |
| Testing & polish | 3 jam |
| **Total** | **~2-3 hari kerja** |
