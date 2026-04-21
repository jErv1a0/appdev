import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, getApp, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './firebaseConfig';

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
};

function isConfigured() {
  const requiredValues = [
    firebaseConfig.apiKey,
    firebaseConfig.authDomain,
    firebaseConfig.projectId,
    firebaseConfig.storageBucket,
    firebaseConfig.messagingSenderId,
    firebaseConfig.appId,
  ];

  return requiredValues.every(value => value && !value.startsWith('REPLACE_WITH_FIREBASE_'));
}

function createFirebaseServices(): FirebaseServices | null {
  if (!isConfigured()) {
    return null;
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  let auth: Auth;
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }

  return {
    app,
    auth,
    db: getFirestore(app),
    storage: getStorage(app),
  };
}

let firebaseServices: FirebaseServices | null = createFirebaseServices();

export function getFirebaseServices() {
  if (!firebaseServices) {
    firebaseServices = createFirebaseServices();
  }

  return firebaseServices;
}

export function isFirebaseReady() {
  return getFirebaseServices() !== null;
}

export function assertFirebaseReady(): FirebaseServices {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error(
      'Firebase is not configured. Update .env.mobile with your Firebase project keys.',
    );
  }

  return services;
}

export const firebaseApp = getFirebaseServices()?.app ?? null;
export const firebaseAuth = getFirebaseServices()?.auth ?? null;
export const firebaseDb = getFirebaseServices()?.db ?? null;
export const firebaseStorage = getFirebaseServices()?.storage ?? null;