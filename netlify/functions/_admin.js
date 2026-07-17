// netlify/functions/_admin.js (ES module)
// Helper to initialize Firebase Admin SDK using a service account stored in environment or decrypted file

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let cached = null;

export async function initAdmin() {
  if (cached) return cached;

  // dynamic import of firebase-admin (works in ESM)
  let adminModule;
  try {
    adminModule = await import('firebase-admin');
  } catch (e) {
    throw new Error('firebase-admin module is required in Functions environment');
  }
  const admin = adminModule.default ?? adminModule;

  // Try to read decrypted service account file first
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const secretPath = path.join(__dirname, '_secrets', 'service_account.json');

  let serviceAccount = null;
  if (fs.existsSync(secretPath)) {
    const raw = fs.readFileSync(secretPath, 'utf8');
    serviceAccount = JSON.parse(raw);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (e) {
      throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64: ' + e.message);
    }
  } else {
    throw new Error('No Firebase service account configured (neither file nor FIREBASE_SERVICE_ACCOUNT_BASE64).');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const db = admin.firestore();
  cached = { admin, db };
  return cached;
}
