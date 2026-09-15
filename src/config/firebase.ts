import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  Auth 
} from 'firebase/auth';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB_iHmU_B5CM4PJKHbXgTPhnM0oJaEbeWY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "finanhealth.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "finanhealth",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "finanhealth.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "847053840302",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:847053840302:web:db4502b5eb2c125f5a723f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GJ42J52P47"
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export async function loginWithFirebaseGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function loginWithFirebaseGithub() {
  return await signInWithPopup(auth, githubProvider);
}

// Initialize Firebase Analytics safely (client-side only)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized for FinHealth');
    }
  }).catch((err) => {
    console.warn('Firebase Analytics not supported in this environment:', err);
  });
}

export default app;
