
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { auth, db } from '@/lib/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getOrCreateStripeCustomer(uid: string, email?: string, name?: string, retries = 3): Promise<string> {
  const userRef = db.collection('users').doc(uid);
  
  for (let i = 0; i < retries; i++) {
    try {
      const userDoc = await userRef.get();
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.stripeCustomerId) {
          return userData.stripeCustomerId;
        }

        // User exists but no Stripe ID, so create one and update the doc.
        const customer = await stripe.customers.create({
          email: userData?.email || email,
          name: userData?.username || name,
          metadata: { firebaseUID: uid },
        });
        await userRef.update({ stripeCustomerId: customer.id });
        return customer.id;
      } else {
        // User doc doesn't exist, this might be a new user. Create everything.
        const customer = await stripe.customers.create({
          email: email,
          name: name,
          metadata: { firebaseUID: uid },
        });
        
        const newUserDoc = {
          uid: uid,
          email: email,
          username: name || "Investor",
          photoURL: "", // This will be updated from client if available
          stripeCustomerId: customer.id,
          createdAt: new Date(),
          theme: 'light',
          leaderboardVisibility: 'public',
          showQuests: true,
          portfolio: { holdings: [], summary: { totalValue: 0, todaysChange: 0, totalGainLoss: 0, annualRatePercent: 0 } },
          notifications: [],
          goals: [],
          autoInvestments: [],
        };
        await userRef.set(newUserDoc);
        return customer.id;
      }
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed for getOrCreateStripeCustomer:`, error.message);
      if (i === retries - 1) { // If it's the last retry, throw the error
        throw error;
      }
      // Wait before retrying
      await sleep(1000 * (i + 1));
    }
  }

  throw new Error("Failed to create or retrieve Stripe customer after multiple retries.");
}

export async function POST(request: Request) {
  const headersList = headers();
  const authHeader = headersList.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Invalid authentication token.' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // Use the robust function to get or create a Stripe customer ID
    const stripeCustomerId = await getOrCreateStripeCustomer(uid, decodedToken.email, decodedToken.name);

    // Create a SetupIntent to save the user's card for future use.
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });

  } catch (error: any) {
    console.error("Error creating setup intent:", error.message);
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return NextResponse.json({ error: 'Invalid authentication token.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
