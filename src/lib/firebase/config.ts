// InvestWise - A modern stock trading and investment education platform for young investors

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

/**
 * InvestWise's Firebase web app. These values identify the project to the
 * browser SDK; they are public by design (access is controlled by Firebase
 * Auth and the Firestore rules, not by keeping them hidden).
 */
const PROJECT_CONFIG: FirebaseOptions = {
  apiKey: "AIzaSyAAdBMaAXBV2PSjJr3jzw9obDJcBB3fbhc",
  authDomain: "investwise-f9rch.firebaseapp.com",
  projectId: "investwise-f9rch",
  storageBucket: "investwise-f9rch.firebasestorage.app",
  messagingSenderId: "509703968960",
  appId: "1:509703968960:web:4920eb3cbfa5d86094f525",
  measurementId: "G-W7R8T3FZ9P",
};

// An environment config (set on the host) takes precedence; anything it
// leaves out, such as the Analytics measurement ID, comes from the project.
const getFirebaseConfig = (): FirebaseOptions => {
  try {
    if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
      return { ...PROJECT_CONFIG, ...JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG) };
    }
  } catch (e) {
    console.error("Could not parse NEXT_PUBLIC_FIREBASE_CONFIG", e);
  }
  return PROJECT_CONFIG;
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Browser-only setup.
if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time.
            console.warn('Firestore persistence failed: multiple tabs open.');
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the features required to enable persistence
            console.warn('Firestore persistence is not supported by this browser.');
        }
    });

    // Google Analytics for Firebase, where the browser supports it.
    if (firebaseConfig.measurementId) {
        isSupported()
            .then((supported) => {
                if (supported) getAnalytics(app);
            })
            .catch(() => {});
    }
}

export { app, auth, db, storage };
