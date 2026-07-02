const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const dotenv = require('dotenv');

// Ensure variables are loaded if used directly
dotenv.config();

// Default initialized state
let isInitialized = false;
let db = null;
let auth = null;

try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  };

  if (!getApps().length && serviceAccount.projectId && serviceAccount.privateKey) {
    initializeApp({
      credential: cert(serviceAccount)
    });
    isInitialized = true;
    db = getFirestore();
    auth = getAuth();
    console.log('Firebase Admin initialized securely via environment variables.');
  } else if (!serviceAccount.projectId) {
    console.warn('Firebase Admin skipped initialization. Missing FIREBASE_ADMIN_PROJECT_ID');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
}

module.exports = {
  db,
  auth
};
