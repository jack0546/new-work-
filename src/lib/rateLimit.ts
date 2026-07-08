/**
 * Sliding-window rate limiter for Next.js route handlers.
 *
 * Uses an in-memory store keyed by a stable identifier (IP + scope). This is
 * sufficient for a single serverless instance and protects against abusive
 * clients / accidental loops. On Vercel, instances are ephemeral and shared
 * across requests, so for strict global limits swap `store` for a distributed
 * backend (Upstash Redis, Vercel KV, or Cloudflare KV) — the class interface
 * stays identical.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Logger } from './logger';

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Periodically evict expired windows to avoid unbounded memory growth.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, win] of store) {
      if (win.resetAt <= now) store.delete(key);
    }
  }, 60_000).unref?.();
}

export interface RateLimitOptions {
  /** Max requests within the window. */
  limit?: number;
  /** Window length in milliseconds. */
  windowMs?: number;
  /** Which scope this limiter protects (used in logs + headers). */
  scope?: string;
  /** Return a key for the request; defaults to IP. */
  keyFrom?: (req: NextRequest) => string;
}

const DEFAULTS: Required<RateLimitOptions> = {
  limit: 60,
  windowMs: 60_000,
  scope: 'global',
  keyFrom: (req) =>
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown',
};

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number;
  headers: Record<string, string>;
}

export function rateLimit(
  req: NextRequest,
  options: RateLimitOptions = {},
  logger?: Logger
): RateLimitResult {
  const cfg = { ...DEFAULTS, ...options };
  const key = `rl:${cfg.scope}:${cfg.keyFrom(req)}`;
  const now = Date.now();

  const win = store.get(key);
  if (!win || win.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return buildResult(false, 1, now + cfg.windowMs, cfg);
  }

  win.count += 1;
  if (win.count > cfg.limit) {
    logger?.warn('Rate limit exceeded', { scope: cfg.scope, key });
    return buildResult(true, win.count, win.resetAt, cfg);
  }
  return buildResult(false, win.count, win.resetAt, cfg);
}

function buildResult(
  limited: boolean,
  count: number,
  resetAt: number,
  cfg: Required<RateLimitOptions>
): RateLimitResult {
  const remaining = Math.max(0, cfg.limit - count);
  return {
    limited,
    remaining,
    resetAt,
    headers: {
      'X-RateLimit-Limit': String(cfg.limit),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
    },
  };
}

/** Convenience helper: returns a 429 Response when limited. */
export function rateLimitOrNext(
  req: NextRequest,
  options?: RateLimitOptions,
  logger?: Logger
): NextResponse | null {
  const res = rateLimit(req, options, logger);
  if (res.limited) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please slow down.' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...res.headers },
      }
    );
  }
  return null;
}
