import { NextResponse } from 'next/server'

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
  identifier?: string | null
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  ok: boolean
  limit: number
  remaining: number
  resetAt: number
  retryAfter: number
}

declare global {
  // eslint-disable-next-line no-var
  var __webtokokuRateLimitStore: Map<string, RateLimitEntry> | undefined
}

const store = globalThis.__webtokokuRateLimitStore || new Map<string, RateLimitEntry>()
globalThis.__webtokokuRateLimitStore = store

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown'

  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

function cleanupExpired(now: number) {
  if (store.size < 1000) return

  store.forEach((entry, key) => {
    if (entry.resetAt <= now) store.delete(key)
  })
}

export function checkRateLimit(request: Request, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  cleanupExpired(now)

  const identity = options.identifier || getClientIp(request)
  const bucketKey = `${options.key}:${identity}`
  const current = store.get(bucketKey)

  if (!current || current.resetAt <= now) {
    const resetAt = now + options.windowMs
    store.set(bucketKey, { count: 1, resetAt })
    return {
      ok: true,
      limit: options.limit,
      remaining: Math.max(options.limit - 1, 0),
      resetAt,
      retryAfter: 0,
    }
  }

  current.count += 1
  store.set(bucketKey, current)

  const retryAfter = Math.max(Math.ceil((current.resetAt - now) / 1000), 1)
  return {
    ok: current.count <= options.limit,
    limit: options.limit,
    remaining: Math.max(options.limit - current.count, 0),
    resetAt: current.resetAt,
    retryAfter,
  }
}

export function rateLimitResponse(result: RateLimitResult) {
  return NextResponse.json(
    {
      error: 'Terlalu banyak request. Coba lagi beberapa saat.',
      retry_after: result.retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    },
  )
}
