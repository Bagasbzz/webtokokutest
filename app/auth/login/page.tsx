"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, MessageCircle, Package } from 'lucide-react';
import { signIn } from '@/lib/auth';
import { getMyStore } from '@/lib/store';
import { WebtokokuLogo } from '@/components/brand/WebtokokuLogo';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message);
        return;
      }

      // Check if user has a store
      const store = await getMyStore();
      if (!store) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login');
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
          <h2>Masuk, lalu lanjutkan mengurus toko.</h2>
          <p>
            Produk, pesanan, pembayaran, dan tampilan toko ada di satu dashboard.
          </p>
          <div className={styles.previewBox}>
            <div className={styles.previewTop}>
              <span />
              <span />
              <span />
              <strong>dashboard</strong>
            </div>
            <div className={styles.previewRows}>
              <div>
                <Package size={17} />
                <span>Katalog</span>
                <strong>24 produk</strong>
              </div>
              <div>
                <MessageCircle size={17} />
                <span>Pesanan</span>
                <strong>WhatsApp</strong>
              </div>
            </div>
          </div>
          <div className={styles.checkList}>
            <span><CheckCircle2 size={16} /> Tidak ada akun pembeli</span>
            <span><CheckCircle2 size={16} /> Toko tetap bisa dibuka publik</span>
          </div>
        </section>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>Masuk</h1>
            <p className={styles.subtitle}>Kelola toko dari dashboard seller.</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form className={styles.form} onSubmit={handleLogin}>
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
                  className={`${styles.input} ${styles.passwordInput}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className={styles.forgotRow}>
                <Link href="/auth/forgot-password" className={styles.link}>
                  Lupa password?
                </Link>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <p className={styles.linkText}>
            Belum punya akun?{' '}
            <Link href="/auth/register" className={styles.link}>
              Buat akun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
