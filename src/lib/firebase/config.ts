
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
