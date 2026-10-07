"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { validatePassword } from '@/lib/auth-validation';
import styles from '../login/page.module.css';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Halaman ini biasanya dibuka dari link reset password Supabase.
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // setError('Sesi tidak valid atau telah berakhir. Silakan minta link reset password baru.');
      }
    }
    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    const pwdValidation = validatePassword(password);
    if (!pwdValidation.isValid) {
      setError(pwdValidation.message);
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memperbarui password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Password Diperbarui</h1>
          <p className={styles.subtitle}>Password Anda telah berhasil diperbarui. Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Update Password</h1>
        <p className={styles.subtitle}>Masukkan password baru Anda</p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password Baru</label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                className={`${styles.input} ${styles.passwordInput}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 karakter, A-z, 0-9, Simbol"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Sembunyikan password baru' : 'Lihat password baru'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Konfirmasi Password</label>
            <div className={styles.passwordWrap}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className={`${styles.input} ${styles.passwordInput}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Lihat konfirmasi password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Memperbarui...' : 'Simpan Password Baru'}
          </button>
        </form>
      </div>
    </div>
  );
}
