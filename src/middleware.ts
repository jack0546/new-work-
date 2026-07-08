import { NextRequest, NextResponse } from 'next/server';

/**
 * Global edge-rate limiting for the Next.js API ("the server").
 *
 * Protects against application-layer DDoS / abusive clients by throttling
 * requests per client IP before they reach route handlers. This is the
 * first line of defense; Vercel's edge already mitigates volumetric
 * (network-layer) DDoS automatically.
 *
 * NOTE: the store is per-instance in-memory. For strict *global* limits
 * across Vercel's distributed edge, swap this for a shared backend
 * (Upstash Redis / Vercel KV) — the logic below stays the same.
 */

interface Window {
  count: number;
  resetAt: number;
}

// Persist across hot-reloads within the same serverless instance.
const g = globalThis as unknown as { __ddosStore?: Map<string, Window> };
const store: Map<string, Window> = g.__ddosStore ?? (g.__ddosStore = new Map());

const LIMIT = 120; // requests per window
const WINDOW_MS = 60_000; // 1 minute

function clientKey(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect API routes.
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // The Paystack webhook is gated by HMAC signature verification and may retry
  // from a small set of IPs; rate-limiting it by IP could drop legitimate
  // retries and break payment processing. Leave it to signature checks.
  if (pathname.startsWith('/api/webhook')) {
    return NextResponse.next();
  }

  const key = `ddos:${clientKey(req)}`;
  const now = Date.now();
  const win = store.get(key);

  if (!win || win.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  win.count += 1;
  if (win.count > LIMIT) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please slow down.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Limit': String(LIMIT),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
