const { getProvider } = require('../providers/providerFactory');
const { logInfo, logError } = require('../utils/logger');
const { buildSystemPrompt, personalitiesConfig } = require('./promptService');
const { saveMessage, getRecentMessages } = require('./conversationService');
const { PERSONALITIES } = require('../constants');
const aiConfig = require('../config/aiConfig');
const AppError = require('../utils/AppError');

/**
 * Orchestrates the complete lifecycle of a single AI request with timeouts and retries.
 */
const processChatRequest = async ({ userId, conversationId, message, mode, reqId }) => {
  const startTime = Date.now();
  
  try {
    // 1. Save User Message immediately
    await saveMessage(conversationId, 'user', message, mode);

    // 2. Fetch Context (Recent History)
    const recentMessages = await getRecentMessages(conversationId, aiConfig.maxHistory);
    const config = personalitiesConfig[mode] || personalitiesConfig[PERSONALITIES.FRIEND];

    // 3. Build Prompt Layers
    const systemPrompt = buildSystemPrompt({ mode, userProfile: {}, conversationSummary: '' });

    // 4. Provider Call with Timeout and Retry Logic
    const provider = getProvider();
    let response;
    let attempt = 0;
    const maxRetries = 1;
    const timeoutMs = 15000; // 15 seconds

    while (attempt <= maxRetries) {
      try {
        const aiPromise = provider.generateMessage({
          systemPrompt,
          messages: recentMessages,
          generationConfig: {
            temperature: config.generationConfig?.temperature ?? parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7'),
            maxOutputTokens: config.generationConfig?.maxOutputTokens ?? undefined
          }
        });

        // Race the AI provider against a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new AppError("I'm taking longer than expected. Please try again.", 504, "AI_TIMEOUT")), timeoutMs);
        });

        response = await Promise.race([aiPromise, timeoutPromise]);
        break; // Success, exit retry loop
      } catch (err) {
        attempt++;
        // Don't retry if it's our own timeout or an auth/bad request error (4xx)
        if (err.errorCode === 'AI_TIMEOUT' || (err.status >= 400 && err.status < 500)) {
          throw err; 
        }
        
        if (attempt > maxRetries) {
          console.error("Original AI Error before retry exhausted:", err);
          throw new AppError("The AI service is currently unavailable. Please try again later.", 502, "AI_ERROR");
        }
        
        // Exponential backoff: wait 1s, 2s, etc.
        const backoffMs = attempt * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }

    const latency = Date.now() - startTime;

    // 5. Save AI Message
    const enrichedMetadata = {
      ...response.metadata,
      personality: config.id,
      version: config.version
    };
    await saveMessage(conversationId, 'assistant', response.text, mode, enrichedMetadata);

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
  processChatRequest,
  processChatStream
};

/**
 * Streams an AI response via Server-Sent Events (SSE).
 * Architecture: provider (async generator) → engine (accumulates) → SSE writer → ONE Firestore write.
 * The Gemini provider has zero knowledge of SSE or Firestore.
 *
 * @param {object} params - { userId, conversationId, message, mode, res, signal, reqId }
 */
async function processChatStream({ userId, conversationId, message, mode, res, signal, reqId }) {
  const startTime = Date.now();

  // Helper to send typed SSE events
  const sendEvent = (event, data) => {
    try {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch (_) { /* connection may be closed */ }
  };

  try {
    // 1. Save User Message immediately
    await saveMessage(conversationId, 'user', message, mode);

    // 2. Fetch Context + Build Prompt
    const recentMessages = await getRecentMessages(conversationId, aiConfig.maxHistory);
    const config = personalitiesConfig[mode] || personalitiesConfig[PERSONALITIES.FRIEND];
    const systemPrompt = buildSystemPrompt({ mode, userProfile: {}, conversationSummary: '' });

    // 3. Get provider's async generator
    const provider = getProvider();
    const tokenStream = provider.generateMessageStream({
      systemPrompt,
      messages: recentMessages,
      generationConfig: {
        temperature: config.generationConfig?.temperature ?? parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7'),
        maxOutputTokens: config.generationConfig?.maxOutputTokens ?? undefined
      },
      signal
    });

    // 4. Send start event
    sendEvent('start', { conversationId });

    // 5. Stream tokens — accumulate in memory (NO per-token Firestore write)
    let fullText = '';
    for await (const chunk of tokenStream) {
      if (signal?.aborted) break;
      fullText += chunk;
      sendEvent('token', { text: chunk });
    }

    const latency = Date.now() - startTime;

    // 6. ONE single Firestore write after generation completes
    if (fullText) {
      const enrichedMetadata = {
        provider: 'gemini',
        model: aiConfig.model,
        personality: config.id,
        version: config.version,
        latency,
        finishReason: signal?.aborted ? 'ABORTED' : 'STOP'
      };
      await saveMessage(conversationId, 'assistant', fullText, mode, enrichedMetadata);
    }

    // 7. Send final events
    sendEvent('metadata', { latency, provider: 'gemini', model: aiConfig.model });
    sendEvent('end', { finishReason: signal?.aborted ? 'ABORTED' : 'STOP' });

    logInfo('AI Stream Successful', {
      requestId: reqId,
      userId,
      conversationId,
      latencyMs: latency,
      aborted: signal?.aborted ?? false
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    logError('AI Stream Failed', error, { requestId: reqId, userId, conversationId, latencyMs: latency });
    sendEvent('error', { message: error.message || 'An unexpected error occurred.' });
  } finally {
    res.end();
  }
}
