const { getProvider } = require('../providers/providerFactory');
const { logInfo, logError } = require('../utils/logger');
const { buildSystemPrompt } = require('./promptService');
const { saveMessage, getRecentMessages } = require('./conversationService');
const aiConfig = require('../config/aiConfig');

/**
 * Orchestrates the complete lifecycle of a single AI request.
 */
const processChatRequest = async ({ userId, conversationId, message, mode, reqId }) => {
  const startTime = Date.now();
  
  try {
    // 1. Save User Message immediately (Recommendation: Predictable persistence)
    await saveMessage(conversationId, 'user', message, mode);

    // 2. Fetch Context (Recent History)
    const recentMessages = await getRecentMessages(conversationId, aiConfig.maxHistory);
    // If the newly saved message isn't returned for some reason, we append it manually.
    // However, getRecentMessages should include it since we just awaited its save.
    // But since it might take a moment to index, let's just make sure we send the correct structure.
    
    // We already have the current message.
    // If we just saved it, it might or might not be in the snapshot yet depending on Firestore consistency.
    // To be perfectly safe, let's pull history BEFORE saving, then append the new message.
    // Actually, getRecentMessages does a query, which is strongly consistent in Firestore.
    // So recentMessages will include the user's message.
    
    // 3. Build Prompt Layers
    const systemPrompt = buildSystemPrompt({ mode, userProfile: {}, conversationSummary: '' });

    // 4. Provider Call
    const provider = getProvider(); // uses env.AI_PROVIDER
    
    const response = await provider.generateMessage({
      systemPrompt,
      messages: recentMessages, // Includes the latest user message
      generationConfig: {
        temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7')
      }
    });

    const latency = Date.now() - startTime;

    // 5. Save AI Message
    await saveMessage(conversationId, 'assistant', response.text, mode);

    // Log privacy-safe metadata
    logInfo('AI Request Successful', {
      requestId: reqId,
      userId,
      conversationId,
      latencyMs: latency,
      provider: response.metadata.provider,
      model: response.metadata.model,
      tokens: response.metadata.tokensUsed
    });

    return {
      success: true,
      text: response.text,
      metadata: response.metadata
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    logError('AI Request Failed', error, {
      requestId: reqId,
      userId,
      conversationId,
      latencyMs: latency
    });
    // The user message is already saved. We throw the error so the controller returns 500,
    // allowing the UI to show an error and offer a retry, without losing the user's input.
    throw error;
  }
};

module.exports = {
  processChatRequest
};
