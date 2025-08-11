
import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Explicitly load environment variables from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// This function now exclusively uses the service account key from the environment variable.
const getFirebaseCredentials = () => {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your .env file.');
  }
  try {
    return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
  } catch (error: any) {
    throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${error.message}`);
  }
};

// Initialize Firebase Admin SDK only once.
if (!admin.apps.length) {
  try {
    const credential = getFirebaseCredentials();
    admin.initializeApp({
      credential,
    });
    console.log("Firebase Admin SDK initialized successfully using the provided service account key.");
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.stack);
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db };
