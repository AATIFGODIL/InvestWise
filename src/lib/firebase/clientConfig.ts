mport { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyAAdBMaAXBV2PSjJr3jzw9obDJcBB3fbhc",
 authDomain: "investwise-f9rch.firebaseapp.com",
 projectId: "investwise-f9rch",
 storageBucket: "investwise-f9rch.appspot.com",
 messagingSenderId: "509703968960",
 appId: "1:509703968960:web:4920eb3cbfa5d86094f525",
};
// Initialize Firebase app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Enable offline persistence (only on client side)
if (typeof window !== "undefined") {
 enableIndexedDbPersistence(db)
   .then(() => {
     console.log("Firestore offline persistence enabled.");
   })
   .catch((err) => {
     if (err.code === "failed-precondition") {
       console.warn("Persistence failed: multiple tabs open.");
     } else if (err.code === "unimplemented") {
       console.warn("Persistence not supported by this browser.");
     } else {
       console.error("Unexpected error enabling persistence:", err);
     }
   });
}
export { app, auth, db, storage };

