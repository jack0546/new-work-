/**
 * Server-side authentication & authorization helpers.
 *
 * All use the Firebase Admin SDK (service-account or ADC) which bypasses
 * Firestore Security Rules, so the checks here are the source of truth for
 * API authorization. Always call these inside route handlers — never trust
 * client-supplied user identity.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from './firebaseAdmin';
import { Logger } from './logger';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'narhsnazzisco@gmail.com').toLowerCase();

export interface AuthUser {
  uid: string;
  email: string | undefined;
  emailVerified: boolean;
  isAdmin: boolean;
  name?: string;
}

/** Extract the bearer token from the Authorization header. */
export function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

async function loadIsAdmin(uid: string, email?: string): Promise<boolean> {
  if (email && email.toLowerCase() === ADMIN_EMAIL) return true;
  try {
    const snap = await adminDb.collection('users').doc(uid).get();
    if (!snap.exists) return false;
    return snap.data()?.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Verify the request's ID token and return the authenticated user.
 * Returns null when no valid token is present (caller decides how to respond).
 */
export async function getAuthenticatedUser(req: NextRequest, logger?: Logger): Promise<AuthUser | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const isAdmin = await loadIsAdmin(decoded.uid, decoded.email);
    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified ?? false,
      isAdmin,
      name: decoded.name,
    };
  } catch (err) {
    logger?.warn('Invalid ID token', { error: (err as Error).message });
    return null;
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

/**
 * Require an authenticated user. Throws HttpError(401) when missing/invalid.
 * Pass `admin: true` to also require admin role (HttpError(403)).
 */
export async function requireUser(
  req: NextRequest,
  opts: { admin?: boolean; logger?: Logger } = {}
): Promise<AuthUser> {
  const user = await getAuthenticatedUser(req, opts.logger);
  if (!user) {
    throw new HttpError(401, 'Authentication required');
  }
  if (opts.admin && !user.isAdmin) {
    throw new HttpError(403, 'Admin privileges required');
  }
  return user;
}

/**
 * Standard JSON error response builder. Maps HttpError to status codes,
 * logs unexpected errors, and never leaks internal stack traces to clients.
 */
export function errorResponse(err: unknown, logger?: Logger): NextResponse {
  if (err instanceof HttpError) {
    logger?.warn(`HTTP ${err.status}`, { message: err.message });
    return NextResponse.json(
      { error: err.message, ...(err.details ? { details: err.details } : {}) },
      { status: err.status }
    );
  }
  const e = err instanceof Error ? err : new Error(String(err));
  logger?.capture(e, { phase: 'request' });
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
