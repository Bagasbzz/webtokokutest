# 🔍 EDITOR AUDIT REPORT — 9 Mei 2026

> Audit menyeluruh setelah sesi implementasi besar-besaran:
> Step 5A → 5D (Overlay, Click Sync, Quick Edit), Hardening Phase (Undo/Redo, Stability, Recovery, Error Boundary), dan Polish Phase (Save Status, Command Palette, Search, Validation, Performance).

---

## ✅ Status Keseluruhan: BERSIH (setelah fix)

4 bug ditemukan dan diperbaiki dalam sesi audit ini.

---

## 🐛 Bug Ditemukan & Diperbaiki

### BUG #1 — `ImageField.tsx`: `retryFile` state dihapus tapi masih dipakai
- **Masalah**: Saat mengimplementasikan `imageLoaded` state, state `retryFile` tidak sengaja dihapus dari `useState`. Namun JSX masih mereferensikan `retryFile` dan `setRetryFile` → **runtime crash**.
- **Dampak**: Upload gambar crash saat ada error → Retry button tidak muncul.
- **Fix**: Restore `const [retryFile, setRetryFile] = useState<File | null>(null)`.
- **File**: `components/editor/ImageField.tsx`

### BUG #2 — `ImageField.tsx`: `useEffect` tidak diimport
- **Masalah**: `useEffect` digunakan untuk reset `imageLoaded` saat `value` berubah, tapi import hanya mencantumkan `useState, useRef`.
- **Dampak**: **Build error** / compile-time failure.
- **Fix**: Tambah `useEffect` ke import.
- **File**: `components/editor/ImageField.tsx`

### BUG #3 — `FieldRenderer.tsx`: Import `validateField` di tengah file (invalid)
- **Masalah**: Saat refactor, baris `import { validateField } from '@/lib/editor-validation'` ditempatkan **setelah** interface dan function signature declaration (baris 18), melanggar ES Module spec yang mengharuskan semua import di atas.
- **Dampak**: TypeScript compiler error / build failure di beberapa bundler.
- **Fix**: Pindahkan import ke baris 6, bersama semua import lainnya.
- **File**: `components/editor/FieldRenderer.tsx`

### BUG #4 — `useOverlaySync.ts`: `React` tidak diimport tapi dipakai sebagai tipe
- **Masalah**: `React.RefObject<HTMLIFrameElement>` digunakan di function signature tapi file hanya mengimport hooks dari React (`useState`, `useEffect`, dll) tanpa mengimport `React` namespace.
- **Dampak**: TypeScript error `Cannot find name 'React'`.
- **Fix**: Ubah import menjadi `import React, { useState, useEffect, useCallback, useRef } from 'react'`.
- **File**: `hooks/useOverlaySync.ts`

### BUG #5 — `EditorClient.tsx`: `mobileWarning` menggunakan `@media` di inline style (tidak bekerja)
- **Masalah**: Inline `CSSProperties` tidak mendukung media query. Key `'@media (max-width: 1023px)'` dalam object style React **diabaikan sepenuhnya** oleh browser.
- **Dampak**: Mobile warning tidak pernah muncul di layar kecil.
- **Fix**: Tambahkan `<style dangerouslySetInnerHTML>` dengan CSS `@media` yang valid, dan gunakan `className="editor-mobile-warning"` pada div.
- **File**: `components/editor/EditorClient.tsx`

---

## ✅ Komponen yang Diverifikasi BERSIH

| File | Status | Catatan |
|------|--------|---------|
| `hooks/useEditorHistory.ts` | ✅ Bersih | Stack undo/redo + limit + reset — semuanya benar |
| `hooks/useOverlaySync.ts` | ✅ Fixed | React import diperbaiki, lockedKey logic benar |
| `components/editor/OverlayCanvas.tsx` | ✅ Bersih | try/catch di semua handlers, lockedKey terpakai |
| `components/editor/FloatingInput.tsx` | ✅ Bersih | Focus trap & keyboard handling benar |
| `components/editor/PreviewFrame.tsx` | ✅ Bersih | Retry cap 3x, EditorErrorBoundary wrapping benar |
| `components/editor/EditorErrorBoundary.tsx` | ✅ Bersih | window.__editorLogError anti-circular import benar |
| `components/editor/CommandPalette.tsx` | ✅ Bersih | Keyboard nav, filter, cleanup benar |
| `components/editor/EditorSection.tsx` | ✅ Bersih | searchQuery filter + noResults empty state |
| `components/editor/FieldRenderer.tsx` | ✅ Fixed | Import diperbaiki, memo wrapping benar |
| `components/editor/ImageField.tsx` | ✅ Fixed | retryFile + useEffect diperbaiki |
| `components/editor/EditorClient.tsx` | ✅ Fixed | mobileWarning diperbaiki, seluruh flow clean |
| `lib/editor-logger.ts` | ✅ Bersih | sessionStorage bounded log, anti-circular |
| `lib/editor-draft.ts` | ✅ Bersih | 24h expiry, atomic save |
| `app/dashboard/editor/preview/PreviewClient.tsx` | ✅ Bersih | ACK postMessage ke parent benar |

---

## ⚠️ Hal yang Perlu Diperhatikan (Bukan Bug, Tapi Risiko)

### 1. `commands` useMemo di EditorClient
```ts
const commands = useMemo(() => [...], [sections, handleSave, handlePublish, undo, redo, handleRestoreDraft])
```
`handleSave`, `handlePublish`, `handleRestoreDraft` adalah regular `function` (bukan `useCallback`), jadi setiap render membuat referensi baru → `useMemo` akan re-compute setiap render.

**Rekomendasi (opsional):** Wrap `handleSave`, `handlePublish` dengan `useCallback` jika performance menjadi masalah di masa depan. Saat ini fungsional dan tidak menyebabkan bug.

### 2. `useEffect` offline detection bergantung pada `isDirty`
```ts
useEffect(() => {
  registerEditorLogger()
  ...
}, [isDirty])  // ← re-runs every time isDirty changes
```
`registerEditorLogger()` dipanggil ulang setiap kali `isDirty` berubah (tidak merusak, idempotent), tapi idealnya logger hanya didaftarkan sekali. Dapat dipisah menjadi dua `useEffect`.

**Rekomendasi (opsional):** Pisah menjadi `useEffect(() => { registerEditorLogger() }, [])` dan `useEffect(() => { ... online/offline ... }, [isDirty])`.

### 3. `isDirty` menggunakan `JSON.stringify` comparison
```ts
const isDirty = useMemo(() => JSON.stringify(formData) !== JSON.stringify(lastSaved), [formData, lastSaved])
```
Untuk data besar ini bisa lambat. Saat ini aman karena `formData` adalah flat object kecil. Jika schema tumbuh besar, pertimbangkan key-by-key diff.

### 4. `postMessageToPreview` menggunakan `messageId` state
```ts
const nextId = messageId + 1
setMessageId(nextId)
```
Karena menggunakan state (bukan ref), ada kemungkinan stale closure jika dipanggil dalam cepat berturut-turut. Penggunaan saat ini (debounced via `useEffect [formData]`) aman.

**Rekomendasi:** Jika kelak perlu panggil dari banyak tempat, ganti `messageId` menjadi `useRef`.

---

## 🏗️ Arsitektur Verifikasi

```
✅ Storefront Public → ZERO editor overhead (tidak ada import editor/overlay/history)
✅ Template components → Tidak tahu editor exist (data-editable attribute only)
✅ Overlay → External sibling, tidak di dalam iframe DOM
✅ formData → Single source of truth, preview hanya render target
✅ History → Stack-based snapshot (formData only, bukan DOM)
✅ Error Boundary → Modular, overlay crash tidak crash sidebar
✅ Logger → Hanya sessionStorage, tidak dikirim ke server/analytics
```

---

## 📁 Daftar Lengkap File yang Dibuat/Diubah di Sesi Ini

### File Baru Dibuat
| File | Deskripsi |
|------|-----------|
| `hooks/useEditorHistory.ts` | Stack-based undo/redo (past/present/future) |
| `hooks/useOverlaySync.ts` | Koordinat hover → host, ResizeObserver, lockedKey |
| `components/editor/FloatingInput.tsx` | Quick edit floating input tanpa contentEditable |
| `components/editor/EditorErrorBoundary.tsx` | React class Error Boundary modular |
| `components/editor/CommandPalette.tsx` | Ctrl+K modal dengan keyboard navigation |
| `lib/editor-logger.ts` | In-memory + sessionStorage error audit trail |

### File Diubah
| File | Perubahan Utama |
|------|----------------|
| `components/editor/EditorClient.tsx` | Orchestrator utama — integrasi semua fitur |
| `components/editor/PreviewFrame.tsx` | Retry cap, EditorErrorBoundary, logEditorError |
| `components/editor/OverlayCanvas.tsx` | lockedKey, try/catch handlers, FloatingInput |
| `components/editor/EditorSection.tsx` | searchQuery prop, filteredFields, noResults state |
| `components/editor/FieldRenderer.tsx` | React.memo, isSearchMatch, validateField realtime |
| `components/editor/ImageField.tsx` | imageLoaded skeleton, fade-in, retryFile fix |
| `app/dashboard/editor/preview/PreviewClient.tsx` | ACK postMessage back ke parent |
| `lib/editor-draft.ts` | Sudah baik, tidak berubah signifikan |
