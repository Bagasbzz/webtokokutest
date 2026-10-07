"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from '../login/page.module.css';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getEmail() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (user.email_confirmed_at) {
          router.push('/dashboard');
        } else {
          setEmail(user.email || null);
        }
      } else {
        router.push('/auth/login');
      }
    }
    getEmail();
  }, [router, supabase]);

  const handleResend = async () => {
    if (!email) return;
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setMessage('Email verifikasi telah dikirim ulang. Silakan cek kotak masuk atau folder spam Anda.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim ulang email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Verifikasi Email</h1>
        <p className={styles.subtitle}>
          Kami telah mengirimkan link verifikasi ke <strong>{email || 'email Anda'}</strong>. 
          Silakan klik link tersebut untuk mengaktifkan akun Anda.
        </p>

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}

        <div className={styles.form} style={{ marginTop: '20px' }}>
          <p className={styles.label} style={{ textAlign: 'center', marginBottom: '20px' }}>
            Belum menerima email?
          </p>
          <button 
            onClick={handleResend}
            className={styles.button}
            disabled={isLoading || !email}
          >
            {isLoading ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
          </button>
        </div>

        <p className={styles.linkText}>
          Sudah verifikasi?{' '}
          <button 
            onClick={() => window.location.reload()} 
            className={styles.link}
            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 600 }}
          >
            Refresh halaman
          </button>
        </p>
      </div>
    </div>
  );
}
