// netlify/functions/_admin.js
// Helper to initialize Firebase Admin SDK using a service account stored in environment
let admin;
let db;

function initAdmin() {
  if (admin && db) return { admin, db };
  try {
    // lazy require
    admin = require('firebase-admin');
  } catch (e) {
    throw new Error('firebase-admin module is required in Functions environment');
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set in environment');
  }

  const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
  const serviceAccount = JSON.parse(serviceAccountJson);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  db = admin.firestore();
  return { admin, db };
}

module.exports = { initAdmin };
