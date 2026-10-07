"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Globe2, Package } from 'lucide-react';
import { validatePassword } from '@/lib/auth-validation';
import { WebtokokuLogo } from '@/components/brand/WebtokokuLogo';
import styles from './page.module.css';

declare global {
  interface Window {
    turnstile: any;
  }
}

export default function RegisterClient({ featureFlags }: { featureFlags: Record<string, boolean> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [noWa, setNoWa] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleToken = (e: any) => {
      setTurnstileToken(e.detail);
    };

    window.addEventListener('turnstile-token', handleToken);
    
    return () => {
      window.removeEventListener('turnstile-token', handleToken);
    };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate password policy (Client-side fast check)
    const pwdValidation = validatePassword(password);
    if (!pwdValidation.isValid) {
      setError(pwdValidation.message);
      return;
    }

    // Verify Turnstile (jika flag aktif)
    if (featureFlags?.['turnstile_captcha'] && !turnstileToken) {
      setError('Silakan selesaikan CAPTCHA');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          nama_lengkap: namaLengkap,
          no_wa: noWa,
          turnstileToken
        })
      });

      const result = await response.json();
      
      if (!response.ok || result.error) {
        setError(result.error || 'Terjadi kesalahan saat registrasi');
        // Reset turnstile on error
        if (window.turnstile) window.turnstile.reset();
        setTurnstileToken(null);
        return;
      }

      const { data } = result;
      setSuccess('Akun dibuat. Cek email atau masuk untuk lanjut.');
      
      // Auto redirect
      if (data?.session) {
        setTimeout(() => {
          router.push('/onboarding');
        }, 1500);
      } else {
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat registrasi');
      if (window.turnstile) window.turnstile.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.shell}>
        <section className={styles.panel}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Kembali
          </Link>
          <div className={styles.brand}>
            <WebtokokuLogo className={styles.logoInline} />
          </div>
          <h2>Buat toko online tanpa mulai dari halaman kosong.</h2>
          <p>
            Isi akun dulu. Setelah itu kamu bisa pilih template, masukkan produk,
            dan bagikan link toko.
          </p>
          <div className={styles.previewCard}>
            <div>
              <Package size={18} />
              <span>Katalog produk</span>
            </div>
            <strong>nama-toko.webtokoku.id</strong>
            <div>
              <Globe2 size={18} />
              <span>Link siap dibagikan</span>
            </div>
          </div>
          <div className={styles.checkList}>
            <span><CheckCircle2 size={16} /> Tidak perlu coding</span>
            <span><CheckCircle2 size={16} /> Pesanan tetap lewat WhatsApp</span>
            <span><CheckCircle2 size={16} /> Bisa dirapikan dari dashboard</span>
          </div>
        </section>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>Buat akun</h1>
            <p className={styles.subtitle}>Data ini dipakai untuk akun seller dan kontak awal toko.</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <form className={styles.form} onSubmit={handleRegister}>
            <div className={styles.twoColumn}>
              <div className={styles.inputGroup}>
                <label htmlFor="namaLengkap" className={styles.label}>Nama lengkap</label>
                <input
                  id="namaLengkap"
                  type="text"
                  required
                  className={styles.input}
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Budi Santoso"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="noWa" className={styles.label}>WhatsApp</label>
                <input
                  id="noWa"
                  type="tel"
                  required
                  className={styles.input}
                  value={noWa}
                  onChange={(e) => setNoWa(e.target.value)}
                  placeholder="081234567890"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                required
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.passwordWrap}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  className={`${styles.input} ${styles.passwordInput}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 karakter, huruf besar, angka, simbol"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            
              {password.length > 0 && (
                <div className={styles.passwordMeter}>
                  <div className={styles.meterBars}>
                    <span className={password.length >= 8 ? styles.activeBar : ''} />
                    <span className={/[A-Z]/.test(password) ? styles.activeBar : ''} />
                    <span className={/[0-9]/.test(password) ? styles.activeBar : ''} />
                    <span className={/[^A-Za-z0-9]/.test(password) ? styles.activeBar : ''} />
                  </div>
                  <p>
                    {password.length < 8 ? 'Minimal 8 karakter' : !/[A-Z]/.test(password) ? 'Tambahkan huruf besar' : !/[0-9]/.test(password) ? 'Tambahkan angka' : !/[^A-Za-z0-9]/.test(password) ? 'Tambahkan simbol' : 'Password sudah kuat'}
                  </p>
                </div>
              )}

              <p className={styles.helpText}>
                Gunakan huruf besar, huruf kecil, angka, dan simbol.
              </p>
            </div>

            {featureFlags?.['turnstile_captcha'] && (
              <div className={styles.captchaWrap}>
                <Script 
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
                  strategy="afterInteractive"
                />
                <div 
                  className="cf-turnstile" 
                  data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                  data-callback="onTurnstileSuccess"
                />
                <Script id="turnstile-callback" strategy="afterInteractive">
                  {`
                    window.onTurnstileSuccess = function(token) {
                      const event = new CustomEvent('turnstile-token', { detail: token });
                      window.dispatchEvent(event);
                    };
                  `}
                </Script>
              </div>
            )}

            <button 
              type="submit" 
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading ? 'Membuat akun...' : 'Buat akun'}
            </button>
          </form>

          <p className={styles.linkText}>
            Sudah punya akun?{' '}
            <Link href="/auth/login" className={styles.link}>
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
