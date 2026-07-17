// src/firebase.ts
// Inicialización modular de Firebase (SDK v9+)
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Prefer Vite env vars (import.meta.env.VITE_...) but fall back to older REACT_APP_* names
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY ?? process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN ?? process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID ?? process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID ?? process.env.REACT_APP_FIREBASE_APP_ID,
  // measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID ?? process.env.REACT_APP_FIREBASE_MEASUREMENT_ID // opcional
};

// Basic validation to surface clear error earlier
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // eslint-disable-next-line no-console
  console.warn('[firebase] Firebase config incomplete. apiKey or projectId missing.');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
