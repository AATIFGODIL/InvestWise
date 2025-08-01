
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

// IMPORTANT: Do not expose this to the client-side.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

const appName = 'firebase-admin-app';

function getAdminApp(): App {
  const a = getApps().find((app) => app.name === appName);
  return a!;
}

export function initFirebaseAdminApp() {
  if (getApps().some((app) => app.name === appName)) {
    return;
  }
  if (!serviceAccount) {
    throw new Error(
      'Missing FIREBASE_SERVICE_ACCOUNT environment variable.'
    );
  }
  initializeApp(
    {
      credential: cert(serviceAccount),
    },
    appName
  );
}
