
import * as admin from 'firebase-admin';

let app: admin.app.App;

export function initializeAdminApp() {
    if (admin.apps.length === 0) {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
        }
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (e) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
            throw new Error('Could not initialize Firebase Admin SDK. Please check your FIREBASE_SERVICE_ACCOUNT environment variable.');
        }
    } else {
        app = admin.apps[0]!;
    }
}

// These are now getters to ensure they are accessed after initialization.
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
