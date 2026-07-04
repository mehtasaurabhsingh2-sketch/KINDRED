const { processChatRequest } = require('../services/conversationEngine');
const { saveMessage } = require('../services/conversationService');
const { db } = require('../config/firebaseAdmin');
const { logError } = require('../utils/logger');
const personalitiesConfig = require('../config/personalities');
const { PERSONALITIES } = require('../constants');

const handleCreateConversation = async (req, res, next) => {
  try {
    const { mode, title } = req.body;
    const userId = req.user.uid;
    const reqId = req.requestId;

    if (!mode) {
      return res.status(400).json({ success: false, message: 'Missing required field: mode' });
    }

    const config = personalitiesConfig[mode] || personalitiesConfig[PERSONALITIES.FRIEND];
    const conversationId = `${userId}_${mode}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. Create Conversation Document
    await db.collection('conversations').doc(conversationId).set({
      id: conversationId,
      userId,
      mode,
      title: title || `${config.name} Conversation`,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    // 2. Insert AI Greeting Message
    const enrichedMetadata = {
      provider: 'system',
      personality: config.id,
      version: config.version,
      latency: 0,
      finishReason: 'GREETING'
    };
    
    await saveMessage(conversationId, 'assistant', config.greeting, mode, enrichedMetadata);

    return res.status(200).json({
      success: true,
      message: 'Conversation initialized successfully',
      data: { conversationId }
    });
  } catch (error) {
    next(error);
  }
};

const handleChat = async (req, res, next) => {
  try {
    const { message, conversationId, mode } = req.body;
    const userId = req.user.uid;
    const reqId = req.requestId;

    if (!message || !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: message or conversationId',
        data: null
      });
    }

    // Hand off to the orchestrator
    const result = await processChatRequest({
      userId,
      conversationId,
      message,
      mode: mode || 'friend',
      reqId
    });

    return res.status(200).json({
      success: true,
      message: 'Chat response generated successfully',
      data: result
    });

  } catch (error) {
    next(error);
  }
};

const handleTitle = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: conversationId',
        data: null
      });
    }
    
    // Placeholder for title generation
    return res.status(200).json({
      success: true,
      message: 'Title generated successfully',
      data: { title: "New AI Conversation" }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateConversation,
  handleChat,
  handleTitle
};
