// InvestWise - Server-side helpers for the email second factor
import { createHash, randomInt } from 'crypto';
import type { NextRequest } from 'next/server';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth } from '@/lib/firebase/admin';

/**
 * How the second factor works.
 *
 * Signing in with a password (or Google) proves the first factor and gives the
 * browser a Firebase session — but that session is not trusted yet. A 6-digit
 * code is emailed for *that session* (identified by its `auth_time`, the
 * moment it signed in). Entering the right code makes the server stamp the
 * account with `twoFactorAuthTime = auth_time`, a custom claim that ends up in
 * the session's ID token.
 *
 * A session is verified exactly when its token's `twoFactorAuthTime` equals its
 * own `auth_time`. Any fresh sign-in, on any tab or device, has a new
 * `auth_time`, so it starts unverified until its own code is entered. The app
 * checks this before rendering anything behind sign-in, and Firestore's rules
 * check it on every read and write.
 */

/** Claim written on the account when a session passes the code check. */
export const TWO_FACTOR_CLAIM = 'twoFactorAuthTime';
/** How long a code lives. */
export const CODE_TTL_MS = 5 * 60 * 1000;
/** Wrong guesses allowed before a code is thrown away. */
export const MAX_ATTEMPTS = 5;
/** Minimum gap between two codes for the same session. */
export const RESEND_COOLDOWN_MS = 30 * 1000;

export class AuthError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** The caller's verified Firebase ID token, from `Authorization: Bearer <token>`. */
export async function requireIdToken(request: NextRequest): Promise<DecodedIdToken> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) throw new AuthError('Sign in first.', 401);
  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    throw new AuthError('Your session has expired. Please sign in again.', 401);
  }
}

/** True when this exact sign-in session has already passed the code check. */
export async function isSessionVerified(token: DecodedIdToken): Promise<boolean> {
  if (token[TWO_FACTOR_CLAIM] === token.auth_time) return true;
  // The token may predate the claim (verified moments ago in another tab).
  const record = await getAdminAuth().getUser(token.uid);
  return record.customClaims?.[TWO_FACTOR_CLAIM] === token.auth_time;
}

/** Mark this sign-in session as verified. */
export async function markSessionVerified(token: DecodedIdToken): Promise<void> {
  const auth = getAdminAuth();
  const record = await auth.getUser(token.uid);
  await auth.setCustomUserClaims(token.uid, {
    ...(record.customClaims ?? {}),
    [TWO_FACTOR_CLAIM]: token.auth_time,
  });
}

/** A uniformly random 6-digit code. */
export function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/** Codes are stored hashed and bound to the account they were issued to. */
export function hashCode(uid: string, code: string): string {
  return createHash('sha256').update(`${uid}:${code}`).digest('hex');
}
