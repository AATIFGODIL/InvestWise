
import admin from 'firebase-admin';

// This is a global variable that will be cached across invocations.
let app: admin.app.App;

/**
 * Initializes and returns the Firebase Admin SDK app instance.
 * It ensures that initialization only happens once, making it safe for
 * serverless environments where code might be re-initialized.
 */
function getFirebaseAdmin() {
  // If the app is already initialized, return it to prevent re-initialization.
  if (app) {
    return app;
  }

  // Check for the service account key in environment variables.
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. The Admin SDK cannot be initialized.');
  }

  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    // Initialize the app with the service account credentials.
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log("Firebase Admin SDK initialized successfully.");
    return app;
  } catch (error: any) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY or initialize Firebase Admin SDK:', error.message);
    throw new Error('Could not initialize Firebase Admin SDK. Please check your service account key.');
  }
}

// Immediately call the function to initialize and cache the app instance.
const initializedApp = getFirebaseAdmin();

// Export the initialized services for use in other server-side files.
export const auth = initializedApp.auth();
export const db = initializedApp.firestore();

    