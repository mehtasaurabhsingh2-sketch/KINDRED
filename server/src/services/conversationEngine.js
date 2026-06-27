const { getProvider } = require('../providers/providerFactory');
const { logInfo, logError } = require('../utils/logger');
// Placeholder imports for Phase 3
// const promptService = require('./promptService');
// const memoryService = require('./memoryService');
// const safetyService = require('./safetyService');

/**
 * Orchestrates the complete lifecycle of a single AI request.
 * 1. Checks safety
 * 2. Fetches/Builds memory context
 * 3. Constructs the final prompt
 * 4. Calls the specific AI Provider
 * 5. Validates/Formats output
 */
const processChatRequest = async ({ userId, conversationId, message, mode, reqId }) => {
  const startTime = Date.now();
  
  try {
    // 1. Safety Check (Placeholder)
    // if (!safetyService.isSafe(message)) throw new Error('Unsafe content');
    
    // 2. Memory Context (Placeholder)
    // const memoryContext = await memoryService.getRelevantMemories(userId, message);

    // 3. Build Prompt (Placeholder)
    // const finalPrompt = promptService.buildPrompt(message, mode, memoryContext);
    
    // 4. Provider Call
    const provider = getProvider(); // uses env.AI_PROVIDER
    
    // Simulate API delay
    await new Promise(res => setTimeout(res, 500));
    
    const response = await provider.generateMessage({
      prompt: message, // passing raw message for now
      context: [], 
      options: {
        temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7')
      }
    });

    const latency = Date.now() - startTime;

    // Log privacy-safe metadata
    logInfo('AI Request Successful', {
      requestId: reqId,
      userId,
      conversationId,
      latencyMs: latency,
      provider: response.metadata.provider,
      model: response.metadata.model
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
    throw error; // Let the controller handle it
  }
};

module.exports = {
  processChatRequest
};
