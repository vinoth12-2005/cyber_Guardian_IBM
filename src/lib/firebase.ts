import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDjPVMc_frUBiZUFp5kR6emxRlJk53N5TQ",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ibmhack-c98c2.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "ibmhack-c98c2",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ibmhack-c98c2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "171990569872",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:171990569872:web:3c9f874dec899f1a319915",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FRWER45KNC",
};

// Initialize or reuse Firebase App instance
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Cloud Firestore & Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Analytics (Browser-safe initialization)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment (e.g. SSR, test runners)
  });
}


