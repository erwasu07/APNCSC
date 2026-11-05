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

const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const procEnv = (typeof process !== 'undefined' && process.env) || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || procEnv.VITE_FIREBASE_API_KEY || rawConfig.apiKey || "AIzaSyB3AR7b2uhkoyCu-asAii3QniAM-L5yr6Q",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || procEnv.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain || "gen-lang-client-0229148353.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || procEnv.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId || "gen-lang-client-0229148353",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || procEnv.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket || "gen-lang-client-0229148353.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || procEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId || "949991303699",
  appId: metaEnv.VITE_FIREBASE_APP_ID || procEnv.VITE_FIREBASE_APP_ID || rawConfig.appId || "1:949991303699:web:7644b6ab9249d745ce6de6",
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || procEnv.VITE_FIREBASE_DATABASE_ID || rawConfig.firestoreDatabaseId || "ai-studio-apnacscdigitalcy-13bad14b-8101-4982-a9df-be8f6af316b4"
};

// Initialize Firebase App
let appInstance: any;
try {
  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn('Firebase initializeApp warning:', e);
  appInstance = getApps()[0] || null;
}
const app = appInstance;

// Initialize Firestore safely
let firestoreDb: ReturnType<typeof getFirestore>;
try {
  const dbId = firebaseConfig.firestoreDatabaseId;
  firestoreDb = (dbId && dbId !== '(default)') ? getFirestore(app, dbId) : getFirestore(app);
} catch (e) {
  console.warn('Named Firestore database init failed, falling back to default:', e);
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;

