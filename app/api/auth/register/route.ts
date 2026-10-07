import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validatePassword } from '@/lib/auth-validation';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const limited = checkRateLimit(request, {
      key: 'auth:register',
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) return rateLimitResponse(limited);

    const { email, password, nama_lengkap, no_wa, turnstileToken } = await request.json();

    // 1. Verify Turnstile (Gate with feature flag)
    if (await isFeatureEnabled('turnstile_captcha')) {
      const turnstile = await verifyTurnstileToken(turnstileToken);
      if (!turnstile.success) {
        return NextResponse.json({ error: turnstile.error || 'CAPTCHA failed' }, { status: 400 });
      }
    }

    // 2. Validate Password (Server-side)
    const pwdValidation = validatePassword(password);
    if (!pwdValidation.isValid) {
      return NextResponse.json({ error: pwdValidation.message }, { status: 400 });
    }

    const supabase = createClient();

    // 3. Register with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: signUpError.status || 400 });
    }

    // 4. Insert into sellers table
    if (data.user) {
      const { error: insertError } = await supabase
        .from('sellers')
        .insert({
          user_id: data.user.id,
          email: email,
          nama_lengkap: nama_lengkap,
          no_wa: no_wa,
        });

      if (insertError) {
        console.error('Error inserting seller profile:', insertError);
        // User is created but profile failed. 
        // In a real app, you might want to handle this more gracefully.
        return NextResponse.json({ 
          data, 
          error: 'Akun berhasil dibuat tapi gagal menyimpan profil. Silakan hubungi admin.' 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ data, error: null });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server saat registrasi' }, { status: 500 });
  }
}
