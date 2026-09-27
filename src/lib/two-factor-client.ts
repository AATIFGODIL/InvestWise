// InvestWise - Client-side helpers for the email second factor
import type { User } from "firebase/auth";

/** Must match `TWO_FACTOR_CLAIM` in `two-factor-server.ts`. */
const TWO_FACTOR_CLAIM = "twoFactorAuthTime";

/**
 * Whether this sign-in session has passed the email code check: its ID token
 * carries a verification stamp for its own `auth_time`. Pass `forceRefresh`
 * right after verifying, to fetch a token that includes the new stamp.
 */
export async function isSessionVerified(user: User, forceRefresh = false): Promise<boolean> {
  const { claims } = await user.getIdTokenResult(forceRefresh);
  const stamp = claims[TWO_FACTOR_CLAIM];
  return stamp !== undefined && stamp !== null && Number(stamp) === Number(claims.auth_time);
}

async function post<T>(path: string, user: User, body: Record<string, unknown>): Promise<T> {
  const token = await user.getIdToken();
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}

export type SendCodeResult = { success: true; verified?: boolean; alreadySent?: boolean };

/** Email a code for this session. `force` replaces a code that's still valid (the Resend button). */
export function requestVerificationCode(user: User, options: { force?: boolean } = {}) {
  return post<SendCodeResult>("/api/send-verification-code", user, { force: Boolean(options.force) });
}

/** Check a code for this session. Throws with a readable message if it's wrong. */
export function submitVerificationCode(user: User, code: string) {
  return post<{ success: true }>("/api/verify-code", user, { code });
}
