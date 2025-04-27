import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.firebase.apiKey,
  authDomain: Constants.expoConfig.extra.firebase.authDomain,
  projectId: Constants.expoConfig.extra.firebase.projectId,
  storageBucket: Constants.expoConfig.extra.firebase.storageBucket,
  messagingSenderId: Constants.expoConfig.extra.firebase.messagingSenderId,
  appId: Constants.expoConfig.extra.firebase.appId,
};

// Initialize Firebase
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Initialize Firebase services with platform-specific configuration
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Enable persistence for web platform
if (Platform.OS === 'web') {
  // Enable offline persistence for web
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
}

export { firebaseApp, auth, db }; 