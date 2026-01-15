// InvestWise - Verify 6-digit code API
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email and code are required' },
                { status: 400 }
            );
        }

        // Get Firestore instance
        const firestore = getAdminDb();

        // Find the verification code document
        const codesSnapshot = await firestore
            .collection('verification_codes')
            .where('email', '==', email)
            .where('code', '==', code)
            .limit(1)
            .get();

        if (codesSnapshot.empty) {
            return NextResponse.json(
                { error: 'Invalid verification code' },
                { status: 400 }
            );
        }

        const codeDoc = codesSnapshot.docs[0];
        const codeData = codeDoc.data();

        // Check if code has expired
        const expiresAt = codeData.expiresAt.toDate();
        if (new Date() > expiresAt) {
            // Delete expired code
            await codeDoc.ref.delete();
            return NextResponse.json(
                { error: 'Verification code has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Code is valid - update user document to mark as verified
        const userId = codeData.userId;
        await firestore.collection('users').doc(userId).update({
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
        });

        // Delete the used verification code
        await codeDoc.ref.delete();

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully',
            userId
        });
    } catch (error) {
        console.error('Verify code error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
