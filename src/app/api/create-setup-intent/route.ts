
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import admin from 'firebase-admin';

// Initialize Stripe with the secret key from environment variables.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Helper function to initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
  // or the default service account when deployed to a Google Cloud environment.
  // For local development, you must have the service account key file and
  // GOOGLE_APPLICATION_CREDENTIALS set in your environment.
  return admin.initializeApp();
}

export async function POST(request: Request) {
  try {
    const app = initializeFirebaseAdmin();
    const auth = admin.auth(app);
    const db = admin.firestore(app);

    const headersList = headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      console.error("Authentication token not provided.");
      return NextResponse.json({ error: 'Authentication token not provided.' }, { status: 401 });
    }

    let decodedToken;
    try {
        decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        return NextResponse.json({ error: 'Invalid authentication token.' }, { status: 403 });
    }

    const uid = decodedToken.uid;
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found in Firestore.' }, { status: 404 });
    }

    const userData = userDoc.data();
    let stripeCustomerId = userData?.stripeCustomerId;

    // Create a new Stripe Customer if one doesn't exist.
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData?.email,
        name: userData?.username,
        metadata: { firebaseUID: uid },
      });
      stripeCustomerId = customer.id;
      await userRef.update({ stripeCustomerId });
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
    // Return a generic error message to the client.
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
