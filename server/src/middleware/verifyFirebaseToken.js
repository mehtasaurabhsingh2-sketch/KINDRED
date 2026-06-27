const { auth } = require('../config/firebaseAdmin');

/**
 * Middleware to verify Firebase Auth ID token from Authorization header
 */
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided',
      error: 'UNAUTHORIZED'
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    if (!auth) {
      // If Firebase Admin failed to init (e.g. missing env vars in dev), 
      // we might want to fail closed or allow a mock user for local testing.
      // For production, we must fail closed.
      if (process.env.NODE_ENV === 'development') {
        console.warn('Firebase Admin not initialized. Using mock user for development.');
        req.user = { uid: 'mock-user-123', email: 'mock@example.com' };
        return next();
      }
      throw new Error('Firebase Admin Auth not initialized.');
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken; // contains uid, email, etc.
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token',
      error: error.message
    });
  }
};

module.exports = verifyFirebaseToken;
