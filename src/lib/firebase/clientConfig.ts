// This file is intended to run only on the client side.
import { db } from './config';
import { enablePersistence } from 'firebase/firestore';

enablePersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('Firestore persistence failed: multiple tabs open.');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn('Firestore persistence not available in this browser.');
    }
});
