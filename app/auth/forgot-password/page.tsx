"use client";

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage('Instruksi reset password telah dikirim ke email Anda.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Lupa Password</h1>
        <p className={styles.subtitle}>Masukkan email Anda untuk menerima link reset password</p>

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
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

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>

        <p className={styles.linkText}>
          Ingat password?{' '}
          <Link href="/auth/login" className={styles.link}>
            Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  );
}
