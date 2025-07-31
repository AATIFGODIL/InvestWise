
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAdBMaAXBV2PSjJr3jzw9obDJcBB3fbhc",
  authDomain: "investwise-f9rch.firebaseapp.com",
  projectId: "investwise-f9rch",
  storageBucket: "investwise-f9rch.appspot.com",
  messagingSenderId: "509703968960",
  appId: "1:509703968960:web:4920eb3cbfa5d86094f525",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence only on the client-side
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
}


export { app, auth, db, storage };
