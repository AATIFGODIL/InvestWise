
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // This will ensure the secrets are loaded for server-side environments
    await import('dotenv/config');
  }
}
