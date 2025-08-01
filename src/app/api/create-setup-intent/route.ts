
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initFirebaseAdminApp } from '@/lib/firebase/admin-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Initialize Firebase Admin and Firestore once
const adminApp = initFirebaseAdminApp();
const db = getFirestore(adminApp);

// Function to get or create a Stripe customer
async function getOrCreateStripeCustomer(userId: string, email?: string) {
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (userDoc.exists && userDoc.data()?.stripeCustomerId) {
        return userDoc.data()?.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
        email: email,
        metadata: {
            firebaseUID: userId,
        },
    });

    // Use set with merge:true to create or update the document
    await userDocRef.set({ stripeCustomerId: customer.id }, { merge: true });
    return customer.id;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const customerId = await getOrCreateStripeCustomer(userId, email);

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'on_session',
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });

  } catch (error) {
    console.error('Error creating SetupIntent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
