
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
    }
    
    const serviceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db };
