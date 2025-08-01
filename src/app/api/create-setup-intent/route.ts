
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getAuth } from 'firebase-admin/auth';
import { adminDb, initializeAdminApp } from '@/lib/firebase/admin-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  try {
    initializeAdminApp();

    const headersList = headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Authentication token not provided.' }, { status: 401 });
    }

    let decodedToken;
    try {
        decodedToken = await getAuth().verifyIdToken(token);
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        return NextResponse.json({ error: 'Invalid authentication token.' }, { status: 403 });
    }

    const uid = decodedToken.uid;
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const userData = userDoc.data();
    let stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData?.email,
        name: userData?.username,
        metadata: { firebaseUID: uid },
      });
      stripeCustomerId = customer.id;
      await userRef.update({ stripeCustomerId });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });

  } catch (error: any) {
    console.error("Error creating setup intent:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
