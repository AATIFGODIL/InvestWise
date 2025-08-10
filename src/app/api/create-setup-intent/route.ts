
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { auth, db } from '@/lib/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  const headersList = headers();
  const authHeader = headersList.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Invalid authentication token.' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the Firebase ID token.
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    let stripeCustomerId;

    if (!userDoc.exists) {
      // If the user document doesn't exist, create it along with a new Stripe customer.
      // This handles race conditions for newly signed-up users.
      const customer = await stripe.customers.create({
        email: decodedToken.email,
        name: decodedToken.name,
        metadata: { firebaseUID: uid },
      });
      stripeCustomerId = customer.id;
      
      const newUserDoc = {
        uid: uid,
        email: decodedToken.email,
        username: decodedToken.name || "Investor",
        photoURL: decodedToken.picture || "",
        stripeCustomerId: stripeCustomerId,
        createdAt: new Date(),
        // Initialize other fields as needed
        theme: 'light',
        leaderboardVisibility: 'public',
        showQuests: true,
        portfolio: { holdings: [], summary: { totalValue: 0, todaysChange: 0, totalGainLoss: 0, annualRatePercent: 0 } },
        notifications: [],
        goals: [],
        autoInvestments: [],
      };
      await userRef.set(newUserDoc);

    } else {
        const userData = userDoc.data();
        stripeCustomerId = userData?.stripeCustomerId;

        // If the user exists but doesn't have a Stripe Customer ID, create one.
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: userData?.email,
                name: userData?.username,
                metadata: { firebaseUID: uid },
            });
            stripeCustomerId = customer.id;
            await userRef.update({ stripeCustomerId });
        }
    }


    // Create a SetupIntent to save the user's card for future use.
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    // Return the client_secret to the frontend.
    return NextResponse.json({ clientSecret: setupIntent.client_secret });

  } catch (error: any) {
    console.error("Error creating setup intent:", error.message);
    // Check for specific auth error codes to give a more specific error.
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return NextResponse.json({ error: 'Invalid authentication token.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
