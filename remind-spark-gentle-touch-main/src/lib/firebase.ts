import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Use environment variables if available, otherwise use placeholder values for testing
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA2uqeE8aXn7OPTIcFVCQgvZpkK65XnOBA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "remind-ai-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "remind-ai-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "remind-ai-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "759813214099",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:759813214099:web:d17d7bfc3db6c16a9f3c05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export Firebase app instance
export default app; 