const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Ensure variables are loaded if used directly
dotenv.config();

// Default initialized state
let isInitialized = false;

try {
  // Use environment variables for the service account
  // In production, you might load this from a secret manager
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    // Replace literal \n with actual newlines in private key
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  };

  if (!admin.apps?.length && serviceAccount.projectId && serviceAccount.privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isInitialized = true;
    console.log('Firebase Admin initialized securely via environment variables.');
  } else if (!serviceAccount.projectId) {
    console.warn('Firebase Admin skipped initialization. Missing FIREBASE_ADMIN_PROJECT_ID');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
}

module.exports = {
  admin,
  db: isInitialized ? admin.firestore() : null,
  auth: isInitialized ? admin.auth() : null
};
