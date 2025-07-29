
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAdBMaAXBV2PSjJr3jzw9obDJcBB3fbhc",
  authDomain: "investwise-f9rch.firebaseapp.com",
  projectId: "investwise-f9rch",
  storageBucket: "investwise-f9rch.firebasestorage.app",
  messagingSenderId: "509703968960",
  appId: "1:509703968960:web:4920eb3cbfa5d86094f525",
};

// Initialize Firebase for SSR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

let db: Firestore;

// Check if we are in a browser environment before enabling persistence
if (typeof window !== 'undefined') {
  try {
    db = getFirestore(app);
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          // This can happen if multiple tabs are open.
          console.warn("Firestore offline persistence failed: Multiple tabs open.");
        } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          console.warn("Firestore offline persistence failed: Browser not supported.");
        }
      });
  } catch (e) {
    console.error("Error initializing Firestore with persistence:", e);
    // Fallback to default firestore instance
    db = getFirestore(app);
  }
} else {
  // For server-side rendering, just get the firestore instance
  db = getFirestore(app);
}


export { app, auth, db, storage };
