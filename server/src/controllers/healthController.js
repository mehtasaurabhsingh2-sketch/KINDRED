const { db } = require('../config/firebaseAdmin');

const checkHealth = async (req, res, next) => {
  try {
    const isFirebaseConnected = db !== null;
    
    // We don't do a full DB query, just check if the instance exists
    // A robust check might do a lightweight read if strictly necessary

    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      data: {
        status: 'OK',
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV,
        firebaseStatus: isFirebaseConnected ? 'Connected' : 'Disconnected/Skipped',
        providerConfiguration: {
          provider: process.env.AI_PROVIDER || 'gemini',
          model: process.env.GEMINI_MODEL || 'default'
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkHealth
};
