const { processChatRequest } = require('../services/conversationEngine');
const { logError } = require('../utils/logger');

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
  handleChat,
  handleTitle
};
