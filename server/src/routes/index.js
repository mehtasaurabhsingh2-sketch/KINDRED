const express = require('express');
const router = express.Router();

const { handleCreateConversation, handleChat, handleTitle, handleChatStream } = require('../controllers/chatController');
const { checkHealth } = require('../controllers/healthController');

const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const { apiLimiter, aiInferenceLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/health', apiLimiter, checkHealth);

// Protected routes (Require Authentication)
router.use('/api', verifyFirebaseToken);

// AI Inference routes (Stricter rate limits)
router.post('/api/conversations', apiLimiter, handleCreateConversation);
router.post('/api/chat', aiInferenceLimiter, handleChat);
router.post('/api/chat/stream', aiInferenceLimiter, handleChatStream); // SSE streaming
router.post('/api/title', apiLimiter, handleTitle);

module.exports = router;
