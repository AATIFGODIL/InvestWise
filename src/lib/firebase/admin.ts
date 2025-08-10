
import admin from 'firebase-admin';

// When deployed to a Google Cloud environment (like Firebase Hosting with server-side functions, Cloud Run, App Engine),
// the SDK automatically discovers the service account credentials and initializes.
// No need to pass any credentials manually.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error: any) {
    // In a local development environment, you may need to set up GOOGLE_APPLICATION_CREDENTIALS
    // https://firebase.google.com/docs/admin/setup#initialize-sdk-with-application-default-credentials
    console.error('Firebase Admin Initialization Error. If running locally, ensure GOOGLE_APPLICATION_CREDENTIALS is set.', error.stack);
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db };
