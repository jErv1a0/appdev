import { type FirebaseOptions } from 'firebase/app';
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from '@env';

function readValue(value?: string) {
  return value?.trim() ?? '';
}

export const firebaseConfig: FirebaseOptions = {
  apiKey: readValue(FIREBASE_API_KEY),
  authDomain: readValue(FIREBASE_AUTH_DOMAIN),
  projectId: readValue(FIREBASE_PROJECT_ID),
  storageBucket: readValue(FIREBASE_STORAGE_BUCKET),
  messagingSenderId: readValue(FIREBASE_MESSAGING_SENDER_ID),
  appId: readValue(FIREBASE_APP_ID),
  // Optional on React Native. Keep only if you use Analytics with a web app too.
  measurementId: readValue(FIREBASE_MEASUREMENT_ID),
};
