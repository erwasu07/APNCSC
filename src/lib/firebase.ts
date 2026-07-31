import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Safely load config from firebase-applet-config.json if available, or environment variables
let rawConfig: Record<string, any> = {};

try {
  // import.meta.glob with eager: true allows optional file inclusion without build failure
  const configModules = import.meta.glob('../../firebase-applet-config.json', { eager: true });
  const configPath = '../../firebase-applet-config.json';
  if (configModules[configPath]) {
    rawConfig = (configModules[configPath] as any).default || configModules[configPath];
  }
} catch (e) {
  // Fallback if file does not exist
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawConfig.apiKey || "AIzaSyB3AR7b2uhkoyCu-asAii3QniAM-L5yr6Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain || "gen-lang-client-0229148353.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId || "gen-lang-client-0229148353",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket || "gen-lang-client-0229148353.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId || "949991303699",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawConfig.appId || "1:949991303699:web:7644b6ab9249d745ce6de6",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || rawConfig.firestoreDatabaseId || "ai-studio-apnacscdigitalcy-13bad14b-8101-4982-a9df-be8f6af316b4"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if provided
const dbId = firebaseConfig.firestoreDatabaseId;
export const db = dbId && dbId !== '(default)'
  ? getFirestore(app, dbId)
  : getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;

