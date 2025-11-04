
import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Define a function to get the initialized Firebase Admin app
function getFirebaseAdmin() {
  // If the app is already initialized, return it
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Check if the service account key is available in environment variables
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    throw new Error('Firebase Admin SDK credentials are not set. The application cannot start.');
  }

  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    // Initialize the app
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
    return app;
  } catch (error: any) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY or initialize Firebase Admin SDK:', error.message);
    throw new Error('Could not initialize Firebase Admin SDK. Please check your service account key.');
  }
}

// Initialize the app by calling the function
const app = getFirebaseAdmin();

// Export the initialized services
export const auth = app.auth();
export const db = app.firestore();
