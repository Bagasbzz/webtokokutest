# Admin Login & CAPTCHA Setup Guide

## 🔐 Cara Login Admin

### Admin Dashboard
**Local URL:** `http://localhost:3000/admin`
**Production URL:** `https://www.webtokoku.id/admin` atau domain Vercel production yang aktif.

**Akun yang diminta owner:**
- **Email:** `bagasphensell@gmail.com`
- **Password:** `<REDACTED>`

Admin login memakai Supabase Auth email/password. Tidak ada login username `Bazazi` di kode aktif.

### Cara Menjadikan Akun Sebagai Admin

1. Daftarkan atau buat user Supabase Auth dengan email `bagasphensell@gmail.com` dan password `<REDACTED>`.
2. Jalankan SQL ini di Supabase SQL Editor agar profil seller tersedia dan role naik menjadi admin:

```sql
do $$
declare
  target_user_id uuid;
begin
  select id into target_user_id
  from auth.users
  where email = 'bagasphensell@gmail.com';

  if target_user_id is null then
    raise exception 'User auth belum ada untuk email bagasphensell@gmail.com';
  end if;

  if exists (select 1 from public.sellers where user_id = target_user_id) then
    update public.sellers
    set role = 'admin',
        email = 'bagasphensell@gmail.com'
    where user_id = target_user_id;
  else
    insert into public.sellers (user_id, email, nama_lengkap, no_wa, role)
    values (target_user_id, 'bagasphensell@gmail.com', 'Bagas Admin', '-', 'admin');
  end if;
end $$;
```

3. Login melalui `/auth/login`.
4. Buka `/admin`. Guard server-side akan mengecek `sellers.role = 'admin'`.

### Fitur Admin:
1. **Feature Flags Management** — Toggle fitur platform
2. **Audit Logs** — Lihat log aktivitas admin
3. **System Settings** — Pengaturan platform (Phase 8)

---

## 🔒 Turnstile CAPTCHA Setup

Register page sudah terintegrasi dengan **Cloudflare Turnstile**. Berikut cara setup:

### Step 1: Buat Turnstile Site di Cloudflare

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pilih domain Anda
3. Menu sidebar → **Turnstile** → **Add Widget**
4. Isi:
   - **Widget Name:** `webtokoku-register`
   - **Hostnames:** `localhost`, `your-domain.vercel.app`
   - **Widget Mode:** `Managed` (recommended)
5. Klik **Create**

### Step 2: Copy Keys

Setelah create, Anda akan mendapat:
- **Site Key** (publik) — untuk frontend
- **Secret Key** (private) — untuk backend

### Step 3: Set Environment Variables

Tambahkan ke `.env.local`:

```env
# Turnstile CAPTCHA
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAXXXXXXXXXXXXXXXX
TURNSTILE_SECRET_KEY=0x4AAAAAAAXXXXXXXXXXXXXXXX
```

**PENTING:**
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — boleh di-expose ke client (prefix `NEXT_PUBLIC_`)
- `TURNSTILE_SECRET_KEY` — **RAHASIA**, hanya server-side

### Step 4: Test

1. Buka `http://localhost:3000/auth/register`
2. CAPTCHA widget akan muncul
3. Selesaikan CAPTCHA sebelum submit
4. Jika sukses, form akan submit
5. Jika gagal, error message akan muncul

---

## 🔧 Cara Kerja Integrasi

### Frontend (RegisterClient.tsx)
```tsx
import { Turnstile } from '@marsidev/react-turnstile'

<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
  onSuccess={setToken}
/>
```

### Backend (route.ts)
```typescript
import { verifyTurnstileToken } from '@/lib/turnstile'

const turnstileResult = await verifyTurnstileToken(turnstileToken)
if (!turnstileResult.success) {
  return NextResponse.json({ error: 'CAPTCHA verification failed' }, { status: 400 })
}
```

### Turnstile Helper (lib/turnstile.ts)
```typescript
export async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  
  // Jika secret key tidak di-set, skip verification (development mode)
  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY not set, skipping verification')
    return { success: true }
  }
  
  // Verify ke Cloudflare API
  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  })
  
  return outcome.success ? { success: true } : { success: false, error: '...' }
}
```

---

## ⚠️ Development Mode

Jika `TURNSTILE_SECRET_KEY` tidak di-set, CAPTCHA akan **auto-pass** dengan warning di console:

```
⚠️ TURNSTILE_SECRET_KEY is not set. Skipping verification (unsafe).
```

**Gunakan ini hanya untuk development!** Jangan di production.

---

## ✅ Checklist Setup

- [ ] Buat Turnstile widget di Cloudflare
- [ ] Copy Site Key dan Secret Key
- [ ] Tambahkan ke `.env.local`
- [ ] Restart dev server
- [ ] Test register dengan CAPTCHA
- [ ] Deploy ke Vercel dengan env vars

---

## 🚀 Deploy ke Vercel

Tambahkan environment variables di Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project → **Settings** → **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = `your-site-key`
   - `TURNSTILE_SECRET_KEY` = `your-secret-key`
4. Redeploy

---

## 📝 Catatan

- Turnstile adalah **FREE** alternative Google reCAPTCHA
- Tidak ada limit request
- Privacy-friendly (no tracking cookies)
- Widget otomatis adaptif (easy/medium/hard challenge based on user behavior)

**Dokumentasi Resmi:** https://developers.cloudflare.com/turnstile/
