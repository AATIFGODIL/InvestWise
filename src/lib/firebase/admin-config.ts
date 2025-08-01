
import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It checks if the app is already initialized to prevent errors.
function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        throw new Error('Missing Firebase Admin SDK credentials in environment variables.');
    }
    
    // In a Firebase or Google Cloud environment, the SDK automatically
    // discovers credentials. But for local dev and other environments, we explicitly provide them.
    return admin.initializeApp({
         credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
        }),
    });
}

// Do not initialize here directly. Let API routes call the function.
const adminAuth = admin.auth;
const adminDb = admin.firestore;

export { initializeAdminApp, adminAuth, adminDb };
