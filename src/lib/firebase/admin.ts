
import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// NOTE: dotenv.config() is removed. Next.js handles .env file loading automatically.

let auth: admin.auth.Auth;
let db: admin.firestore.Firestore;

function initializeFirebaseAdmin() {
  // Check if the FIREBASE_SERVICE_ACCOUNT_KEY is present in the environment
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please add it to your .env file.');
    // We throw an error to make it clear that the app cannot function without it.
    throw new Error('Firebase Admin SDK credentials are not set.');
  }

  // Parse the service account key from the environment variable
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    // Initialize the app with the correct credentials
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    // Initialize Firestore and Auth after app initialization
    auth = admin.auth();
    db = admin.firestore();

    console.log("Firebase Admin SDK initialized successfully for project:", serviceAccount.project_id);
  
  } catch (error: any) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY or initialize Firebase Admin SDK:', error.message);
    throw new Error('Could not initialize Firebase Admin SDK. Please check your service account key.');
  }
}

// Ensure Firebase is initialized only once
if (!admin.apps.length) {
  initializeFirebaseAdmin();
} else {
  // If already initialized (e.g., due to hot-reloading), just get the instances
  auth = admin.auth();
  db = admin.firestore();
}


export { auth, db };
