
import * as admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It checks if the app is already initialized to prevent errors.
export function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    
    // In a Firebase or Google Cloud environment, the SDK automatically
    // discovers credentials, so no need to pass them explicitly.
    return admin.initializeApp();
}

// Export firestore and auth instances for use in other server-side files.
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
