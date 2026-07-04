const { db } = require('../config/firebaseAdmin');

const checkHealth = async (req, res, next) => {
  try {
    const isFirebaseConnected = db !== null;
    const isGeminiConfigured = !!process.env.GEMINI_API_KEY;

    res.status(200).json({
      status: 'ok',
      firebase: isFirebaseConnected,
      gemini: isGeminiConfigured,
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '0.3.0'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkHealth
};
