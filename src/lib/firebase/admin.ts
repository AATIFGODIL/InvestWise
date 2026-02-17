// InvestWise - Firebase Admin SDK initialization for server-side operations
import { initializeApp, getApps, cert, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getEnvVar } from '@/lib/env';

let app: App | null = null;
let db: Firestore | null = null;

// Project ID from Firebase config (hardcoded as fallback)
const PROJECT_ID = 'investwise-f9rch';

function getProjectId(): string {
    // Try to parse from NEXT_PUBLIC_FIREBASE_CONFIG
    try {
        const firebaseConfig = getEnvVar('NEXT_PUBLIC_FIREBASE_CONFIG');
        if (firebaseConfig) {
            const config = JSON.parse(firebaseConfig);
            return config.projectId || PROJECT_ID;
        }
    } catch (e) {
        console.warn('Could not parse NEXT_PUBLIC_FIREBASE_CONFIG');
    }
    return PROJECT_ID;
}

export function getAdminApp(): App {
    if (app) return app;

    if (getApps().length > 0) {
        app = getApps()[0];
        return app;
    }

    const projectId = getProjectId();

    // Check if explicit service account credentials are available (local dev)
    const firebaseProjectId = getEnvVar('FIREBASE_PROJECT_ID');
    const firebaseClientEmail = getEnvVar('FIREBASE_CLIENT_EMAIL');
    const firebasePrivateKey = getEnvVar('FIREBASE_PRIVATE_KEY');

    if (firebaseProjectId && firebaseClientEmail && firebasePrivateKey) {
        console.log('Initializing Firebase Admin with explicit credentials');
        app = initializeApp({
            credential: cert({
                projectId: firebaseProjectId,
                clientEmail: firebaseClientEmail,
                privateKey: firebasePrivateKey.replace(/\\n/g, '\n'),
            }),
        });
    } else {
        // Use Application Default Credentials (works on Firebase App Hosting, Cloud Run, etc.)
        console.log('Initializing Firebase Admin with ADC, projectId:', projectId);
        app = initializeApp({
            credential: applicationDefault(),
            projectId,
        });
    }

    return app;
}

export function getAdminDb(): Firestore {
    if (db) return db;

    getAdminApp(); // Ensure app is initialized
    db = getFirestore();
    return db;
}
