import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  getStorefrontUrl,
  getTenantSlugFromHost,
  isLegacyVercelHost,
  isPlatformHost,
  LEGACY_VERCEL_DOMAIN,
  normalizeHost,
  PRIMARY_DOMAIN,
} from '@/lib/domains'

export async function middleware(request: NextRequest) {
  const host = normalizeHost(request.headers.get('host'))
  const pathname = request.nextUrl.pathname
  const tenantSlug = getTenantSlugFromHost(host)
  const firstSegment = pathname.split('/').filter(Boolean)[0]
  const isStaticAsset = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|webp|avif|txt|xml)$/)

  if (!isStaticAsset) {
    const PLATFORM_PATHS = ['/admin', '/admin694', '/dashboard', '/auth', '/onboarding', '/api', '/maintenance', '/demo', '/template-previews']
    const isPlatformPath = PLATFORM_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

    if (tenantSlug && !isPlatformPath) {
      const rewriteUrl = request.nextUrl.clone()
      if (pathname.startsWith(`/${tenantSlug}`)) {
        rewriteUrl.pathname = pathname
      } else {
        rewriteUrl.pathname = pathname === '/' ? `/${tenantSlug}` : `/${tenantSlug}${pathname}`
      }
      return NextResponse.rewrite(rewriteUrl)
    }

    if (isLegacyVercelHost(host)) {
      const redirectUrl = request.nextUrl.clone()
      if (host === LEGACY_VERCEL_DOMAIN && firstSegment && isPublicStoreSlug(firstSegment)) {
        return NextResponse.redirect(getStorefrontUrl(firstSegment), 308)
      }

      if (host === LEGACY_VERCEL_DOMAIN && pathname === '/') {
        redirectUrl.protocol = 'https'
        redirectUrl.hostname = PRIMARY_DOMAIN
        return NextResponse.redirect(redirectUrl, 308)
      }
    }

    if (host && !isPlatformHost(host)) {
      // Bypass platform-reserved paths even if host detection fails
      const PLATFORM_PATHS = ['/admin', '/admin694', '/dashboard', '/auth', '/onboarding', '/api', '/maintenance', '/demo', '/template-previews']
      const isPlatformPath = PLATFORM_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
      if (!isPlatformPath) {
        const rewriteUrl = request.nextUrl.clone()
        rewriteUrl.pathname = `/custom-domain/${encodeURIComponent(host)}`
        return NextResponse.rewrite(rewriteUrl)
      }
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              request.cookies.set({
                name,
                value,
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value,
                ...options,
              })
            } catch (err) {
              // Ignore cookies set error in middleware
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              request.cookies.set({
                name,
                value: '',
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            } catch (err) {
              // Ignore cookies remove error in middleware
            }
          },
        },
      }
    )

    // 1. Cek Maintenance Mode
    // Kita bypass untuk path /admin dan /maintenance agar admin tetap bisa login dan mematikan maintenance
    const isMaintenancePage = pathname === '/maintenance'
    const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/admin694')
    const isApiAuth = pathname.startsWith('/api/auth')
    const isStatic = isStaticAsset

    if (!isMaintenancePage && !isAdminPage && !isApiAuth && !isStatic) {
      try {
        const { data: flag } = await supabase
          .from('feature_flags')
          .select('enabled_globally')
          .eq('key', 'maintenance_mode')
          .single()

        if (flag?.enabled_globally) {
          return NextResponse.redirect(new URL('/maintenance', request.url))
        }
      } catch (err) {
        console.error('[Middleware] Error fetching maintenance mode:', err)
      }
    }

    // Refresh session if needed
    try {
      await supabase.auth.getUser()
    } catch (err) {
      console.error('[Middleware] Error fetching user session:', err)
    }
  } catch (err) {
    console.error('[Middleware] Supabase client initialization failed:', err)
  }

  return response
}

function isPublicStoreSlug(slug: string): boolean {
  return ![
    'admin',
    'admin694',
    'api',
    'auth',
    'dashboard',
    'onboarding',
    'maintenance',
    'custom-domain',
    'inidemo',
    'demo',
    'template-previews',
  ].includes(slug)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
