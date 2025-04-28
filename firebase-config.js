import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Debug logging function
const debugLog = (message, data = null) => {
  if (__DEV__) {
    console.log(`[Firebase Config] ${message}`, data ? data : '');
  }
};

// Validate Firebase configuration
const validateFirebaseConfig = (config) => {
  debugLog('Validating Firebase config:', config);
  
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    const error = new Error(`Missing required Firebase configuration fields: ${missingFields.join(', ')}`);
    debugLog('Configuration validation failed:', error);
    throw error;
  }
  
  debugLog('Configuration validation successful');
  return true;
};

// Get Firebase configuration from environment variables
const getFirebaseConfig = () => {
  debugLog('Getting Firebase config from Constants');
  
  const config = Constants.expoConfig?.extra?.firebase;
  
  if (!config) {
    const error = new Error('Firebase configuration is missing. Please check your app.config.js and environment variables.');
    debugLog('Configuration missing:', error);
    throw error;
  }
  
  validateFirebaseConfig(config);
  return config;
};

// Initialize Firebase
let firebaseApp;
try {
  const firebaseConfig = getFirebaseConfig();
  debugLog('Initializing Firebase with config:', { ...firebaseConfig, apiKey: '[REDACTED]' });
  
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    debugLog('Firebase initialized successfully');
  } else {
    firebaseApp = getApps()[0];
    debugLog('Using existing Firebase app instance');
  }
} catch (error) {
  debugLog('Error initializing Firebase:', error);
  throw error;
}

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
debugLog('Firebase services initialized');

// Enable persistence for web platform
if (Platform.OS === 'web') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      debugLog('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      debugLog('The current browser does not support persistence.');
    } else {
      debugLog('Error enabling persistence:', err);
    }
  });
}

export { firebaseApp, auth, db }; 