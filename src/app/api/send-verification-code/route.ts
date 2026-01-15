// InvestWise - 6-digit email verification code API
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import nodemailer from 'nodemailer';

// Lazy initialization for nodemailer transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD environment variables are required');
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return transporter;
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userId } = body;

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const firestore = getAdminDb();
    const mailTransporter = getTransporter();

    // Generate 6-digit code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Delete any existing codes for this email
    const existingCodes = await firestore
      .collection('verification_codes')
      .where('email', '==', email)
      .get();

    const batch = firestore.batch();
    existingCodes.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Store new code in Firestore
    await firestore.collection('verification_codes').add({
      email,
      userId,
      code,
      expiresAt,
      createdAt: new Date(),
    });

    // Send email with code using Gmail SMTP
    const mailOptions = {
      from: `InvestWise <${process.env.GMAIL_USER}>`,
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
      await mailTransporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('Send verification code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
