
import admin from 'firebase-admin';

// This function determines the credential to use for Firebase Admin.
const getFirebaseCredentials = () => {
  // If the service account key is available in environment variables, use it.
  // This is the preferred method for explicit project configuration.
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return admin.credential.cert(serviceAccount);
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
      // Fall through to applicationDefault if parsing fails
    }
  }

  // If running in a Google Cloud environment (like App Engine, Cloud Run),
  // the SDK can automatically discover credentials.
  // This is the default behavior if the service account key isn't provided or is invalid.
  return admin.credential.applicationDefault();
};

// Initialize Firebase Admin SDK only once.
if (!admin.apps.length) {
  try {
    const credential = getFirebaseCredentials();
    admin.initializeApp({
      credential,
    });
    console.log("Firebase Admin SDK initialized successfully.");
    // Log the project ID the Admin SDK is configured for, to be certain.
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
       const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
       console.log(`Admin SDK configured for project: ${serviceAccount.project_id}`);
    } else {
       console.log("Admin SDK configured using application default credentials.");
    }
   
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.stack);
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db };
