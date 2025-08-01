
import * as admin from 'firebase-admin';

let app: admin.app.App;

export function initializeAdminApp() {
    if (admin.apps.length > 0) {
        app = admin.apps[0]!;
    } else {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
