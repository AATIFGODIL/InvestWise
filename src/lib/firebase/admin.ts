
import admin from 'firebase-admin';

// When deployed to a Google Cloud environment (like Firebase Hosting with server-side functions, Cloud Run, App Engine),
// the SDK automatically discovers the service account credentials and initializes.
// No need to pass any credentials manually.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db };
