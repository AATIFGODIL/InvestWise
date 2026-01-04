
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// This function determines which Firebase config to use.
const getFirebaseConfig = (): FirebaseOptions => {
  try {
    // This variable is set by the next.config.js file in production builds.
    if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
      return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
    }
  } catch (e) {
    console.error("Could not parse NEXT_PUBLIC_FIREBASE_CONFIG", e);
  }

  // Fallback for local development using individual environment variables.
  // These are client-side variables, so they must be prefixed with NEXT_PUBLIC_.
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:1234567890abcdef",
  };
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence only on the client-side
if (typeof window !== 'undefined') {
    // Only attempt persistence if we have a valid config, otherwise it might fail.
    // Check for a real project ID to determine if it's a valid config.
    if (firebaseConfig.projectId !== "mock-project-id") {
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code == 'failed-precondition') {
                // Multiple tabs open, persistence can only be enabled in one tab at a time.
                console.warn('Firestore persistence failed: multiple tabs open.');
            } else if (err.code == 'unimplemented') {
                // The current browser does not support all of the features required to enable persistence
                console.warn('Firestore persistence is not supported by this browser.');
            }
        });
    }
}


export { app, auth, db, storage };
