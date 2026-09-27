// InvestWise - 6-digit email verification code API
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import {
  AuthError,
  CODE_TTL_MS,
  RESEND_COOLDOWN_MS,
  generateCode,
  hashCode,
  isSessionVerified,
  requireIdToken,
} from '@/lib/two-factor-server';
import { getEnvVar } from '@/lib/env';
import nodemailer, { type Transporter } from 'nodemailer';

// Lazy initialization for nodemailer transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const gmailUser = getEnvVar('GMAIL_USER');
  const gmailPass = getEnvVar('GMAIL_APP_PASSWORD');

  if (!gmailUser || !gmailPass) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD environment variables are required');
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  return transporter;
}

/**
 * Email a 6-digit code for the caller's current sign-in session.
 *
 * Who and where are taken from the caller's verified Firebase ID token — never
 * from the request body — so a code can only ever be sent to the account's own
 * address, for the session that asked for it. If a code for this session is
 * already waiting (another tab asked a moment ago), it isn't replaced unless
 * `force` is set by the Resend button, and even then not more than once every
 * 30 seconds.
 */
export async function POST(request: NextRequest) {
  try {
    const token = await requireIdToken(request);
    const email = token.email;
    if (!email) {
      return NextResponse.json({ error: 'This account has no email address.' }, { status: 400 });
    }

    // Already verified (e.g. in another tab): nothing to send.
    if (await isSessionVerified(token)) {
      return NextResponse.json({ success: true, verified: true });
    }

    let force = false;
    try {
      force = Boolean((await request.json())?.force);
    } catch {
      // No body is fine.
    }

    const firestore = getAdminDb();
    const existing = await firestore.collection('verification_codes').where('userId', '==', token.uid).get();
    const now = Date.now();
    const current = existing.docs.find(
      (doc) => doc.get('authTime') === token.auth_time && doc.get('expiresAt').toDate().getTime() > now
    );
    if (current) {
      const age = now - current.get('createdAt').toDate().getTime();
      if (!force || age < RESEND_COOLDOWN_MS) {
        return NextResponse.json({ success: true, alreadySent: true });
      }
    }

    // One live code per account: replace anything older.
    const batch = firestore.batch();
    existing.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    const code = generateCode();
    await firestore.collection('verification_codes').add({
      userId: token.uid,
      email,
      authTime: token.auth_time,
      codeHash: hashCode(token.uid, code),
      attempts: 0,
      expiresAt: new Date(now + CODE_TTL_MS),
      createdAt: new Date(now),
    });

    const mailOptions = {
      from: `InvestWise <${getEnvVar('GMAIL_USER')}>`,
      to: email,
      subject: 'Your InvestWise Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #0a0a0b; color: #ffffff; padding: 40px 20px; margin: 0;">
            <div style="max-width: 480px; margin: 0 auto; background: linear-gradient(145deg, #1a1a1f 0%, #0f0f12 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(119, 93, 239, 0.2);">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #775DEF; font-size: 28px; margin: 0 0 8px 0;">InvestWise</h1>
                <p style="color: #9ca3af; margin: 0; font-size: 14px;">Your verification code</p>
              </div>
              
              <div style="background: rgba(119, 93, 239, 0.1); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${code}</span>
              </div>
              
              <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
                This code will expire in <strong style="color: #ffffff;">5 minutes</strong>.
              </p>
              
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await getTransporter().sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Send verification code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
