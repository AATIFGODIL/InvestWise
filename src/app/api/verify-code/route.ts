// InvestWise - Verify 6-digit code API
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import {
  AuthError,
  MAX_ATTEMPTS,
  hashCode,
  isSessionVerified,
  markSessionVerified,
  requireIdToken,
} from '@/lib/two-factor-server';

/**
 * Check a code for the caller's current sign-in session.
 *
 * The code must have been issued to this account *and* this session; it
 * expires after 5 minutes and after 5 wrong guesses. On success the session is
 * stamped as verified (see `two-factor-server.ts`) and the client refreshes
 * its ID token to pick the stamp up.
 */
export async function POST(request: NextRequest) {
  try {
    const token = await requireIdToken(request);

    let code = '';
    try {
      code = String((await request.json())?.code ?? '');
    } catch {
      // Handled below.
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Enter the 6-digit code from your email.' }, { status: 400 });
    }

    if (await isSessionVerified(token)) {
      return NextResponse.json({ success: true });
    }

    const firestore = getAdminDb();
    const snapshot = await firestore.collection('verification_codes').where('userId', '==', token.uid).get();
    const codeDoc = snapshot.docs.find((doc) => doc.get('authTime') === token.auth_time);

    if (!codeDoc) {
      return NextResponse.json({ error: 'No active code for this sign-in. Request a new one.' }, { status: 400 });
    }

    if (codeDoc.get('expiresAt').toDate() < new Date()) {
      await codeDoc.ref.delete();
      return NextResponse.json({ error: 'That code has expired. Request a new one.' }, { status: 400 });
    }

    const attempts = (codeDoc.get('attempts') as number) ?? 0;
    if (attempts >= MAX_ATTEMPTS) {
      await codeDoc.ref.delete();
      return NextResponse.json({ error: 'Too many attempts. Request a new code.' }, { status: 429 });
    }

    if (codeDoc.get('codeHash') !== hashCode(token.uid, code)) {
      const left = MAX_ATTEMPTS - attempts - 1;
      if (left <= 0) {
        await codeDoc.ref.delete();
        return NextResponse.json({ error: 'Too many attempts. Request a new code.' }, { status: 429 });
      }
      await codeDoc.ref.update({ attempts: attempts + 1 });
      return NextResponse.json(
        { error: `That code isn't right. ${left} ${left === 1 ? 'try' : 'tries'} left.` },
        { status: 400 }
      );
    }

    await codeDoc.ref.delete();
    await markSessionVerified(token);

    // Record it on the profile if one exists yet (a brand-new account's
    // profile is created by the app right after this succeeds).
    const userRef = firestore.collection('users').doc(token.uid);
    if ((await userRef.get()).exists) {
      await userRef.update({ isEmailVerified: true, emailVerifiedAt: new Date() });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Verify code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
