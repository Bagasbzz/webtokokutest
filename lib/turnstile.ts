/**
 * Cloudflare Turnstile Server-side Verification
 */
export async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    const explicitDevBypass =
      process.env.NODE_ENV !== 'production' &&
      process.env.TURNSTILE_DEV_BYPASS === 'true';

    if (explicitDevBypass) {
      console.warn('TURNSTILE_DEV_BYPASS=true. Skipping Turnstile verification for development only.');
      return { success: true };
    }

    console.error('TURNSTILE_SECRET_KEY is not set while CAPTCHA verification is required.');
    return {
      success: false,
      error: 'Konfigurasi CAPTCHA belum lengkap. Hubungi admin.',
    };
  }

  if (!token) {
    return { success: false, error: 'CAPTCHA token is missing' };
  }

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await result.json();
    
    if (outcome.success) {
      return { success: true };
    } else {
      return { success: false, error: 'CAPTCHA verification failed' };
    }
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return { success: false, error: 'Internal CAPTCHA verification error' };
  }
}
