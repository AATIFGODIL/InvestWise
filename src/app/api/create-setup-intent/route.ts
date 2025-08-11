
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { auth, db } from '@/lib/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Helper function to pause execution
async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Robust function to get or create a Stripe customer with retries
async function getOrCreateStripeCustomer(uid: string, email?: string, name?: string): Promise<string> {
  const userRef = db.collection('users').doc(uid);
  const maxRetries = 3;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const userDoc = await userRef.get();
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // If Stripe ID exists, return it
        if (userData?.stripeCustomerId) {
          return userData.stripeCustomerId;
        }

        // User exists but no Stripe ID, so create one, update the doc, and return the new ID.
        const customer = await stripe.customers.create({
          email: userData?.email || email,
          name: userData?.username || name,
          metadata: { firebaseUID: uid },
        });
        await userRef.update({ stripeCustomerId: customer.id });
        return customer.id;
      } else {
        // User doc doesn't exist. This could be a new user or a race condition.
        // We will attempt to create the user doc along with the Stripe customer.
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
        // Use `set` with merge option just in case another process created it in the meantime.
        await userRef.set(newUserDoc, { merge: true });
        return customer.id;
      }
    } catch (error: any) {
      console.error(`Attempt ${i + 1} to get/create Stripe customer failed:`, error.message);
      if (i === maxRetries - 1) { // If it's the last retry, re-throw the error
        throw new Error("Failed to create or retrieve Stripe customer after multiple retries.");
      }
      // Wait for a short duration before the next retry
      await sleep(1000 * (i + 1));
    }
  }

  // This line should be unreachable if the loop logic is correct, but satisfies TypeScript.
  throw new Error("Failed to get or create Stripe customer.");
}


export async function POST(request: Request) {
  const headersList = headers();
  const authHeader = headersList.get('Authorization');

  console.log("Server received Auth header:", authHeader); // Debugging: Log the received header

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Invalid or missing Authorization header.' }, { status: 401 });
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
    console.error("Firebase token verification failed:", error.message);
    // Provide a clearer error message for token verification issues
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return NextResponse.json({ error: `Invalid authentication token: ${error.message}` }, { status: 401 });
    }
    return NextResponse.json({ error: 'An internal server error occurred during setup intent creation.' }, { status: 500 });
  }
}
