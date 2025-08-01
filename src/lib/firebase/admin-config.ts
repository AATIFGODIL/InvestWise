
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const appName = 'firebase-admin-app-' + new Date().getTime();

export function initFirebaseAdminApp(): App {
  const existingApp = getApps().find((app) => app.name.startsWith('firebase-admin-app'));
  if (existingApp) {
    return existingApp;
  }

  // When running in a Google Cloud environment, the SDK can discover credentials automatically.
  return initializeApp({}, appName);
}
