
import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

function initializeFirebaseAdmin() {
  // Check if the service account key is available in environment variables
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    throw new Error('Firebase Admin SDK credentials are not set. The application cannot start.');
  }

  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    // Initialize the app if it hasn't been initialized yet
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    }
  } catch (error: any) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY or initialize Firebase Admin SDK:', error.message);
    throw new Error('Could not initialize Firebase Admin SDK. Please check your service account key.');
  }
}

// Initialize the SDK
initializeFirebaseAdmin();

// Export the initialized services
export const auth = admin.auth();
export const db = admin.firestore();
