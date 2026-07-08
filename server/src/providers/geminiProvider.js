const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiConfig = require('../config/aiConfig');

// 1. Initialize once at startup (Recommendation: Secure Gemini Initialization)
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Maps Gemini-specific errors to our standard backend error format
 */
const mapGeminiError = (error) => {
  const errMsg = error.message || '';
  
  if (errMsg.includes('API key not valid') || errMsg.includes('API key not found')) {
    return new Error('Invalid or missing API key configuration.');
  }
  if (errMsg.includes('quota') || errMsg.includes('429')) {
    return new Error('Provider rate limit exceeded. Please try again later.');
  }
  if (errMsg.includes('fetch failed') || errMsg.includes('timeout')) {
    return new Error('Provider connection timeout. Please try again.');
  }
  
  return new Error(`Provider failed: ${errMsg}`);
};

/**
 * Executes a structured request against the Gemini API.
 * Expected input: { systemPrompt, messages, generationConfig }
 * Expected output: { success, text, model, usage, finishReason, latency }
 */
const generateMessage = async ({ systemPrompt, messages, generationConfig = {} }) => {
  if (!genAI) {
    throw new Error('Gemini API is not properly initialized on the server.');
  }

  const startTime = Date.now();
  const modelName = aiConfig.model;
  
  try {
    // 2. Initialize the model
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt || undefined,
    });

    // Merge passed config with defaults from aiConfig
    const finalConfig = {
      temperature: generationConfig.temperature ?? 0.7,
      maxOutputTokens: generationConfig.maxOutputTokens ?? aiConfig.maxOutputTokens,
      topP: generationConfig.topP,
      topK: generationConfig.topK,
    };

    // 3. Format the chat history for Gemini
    // Gemini expects an array of { role: 'user' | 'model', parts: [{ text }] }
    let formattedHistory = (messages || []).slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    // Gemini STRICTLY requires the history to start with a 'user' role.
    // Since our DB stores the initial AI greeting first, we must drop any leading 'model' messages.
    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }
    
    // The actual message to send is the last one in the array
    const latestMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';

    if (!latestMessage) {
      throw new Error('No user message provided to generateMessage.');
    }

    // 4. Start Chat Session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: finalConfig,
    });

    // 5. Send Message
    const result = await chat.sendMessage(latestMessage);
    const response = await result.response;
    const text = response.text();

    const latency = Date.now() - startTime;

    // Optional usage stats if the SDK provides them
    const usageMetadata = response.usageMetadata || {};

    // 6. Return standard structured response (Recommendation 1)
    return {
      success: true,
      text: text,
      metadata: {
        provider: 'gemini',
        model: modelName,
        tokensUsed: usageMetadata.totalTokenCount || 0,
        latency: latency,
        finishReason: response.candidates?.[0]?.finishReason || 'STOP'
      }
    };

  } catch (error) {
    throw mapGeminiError(error);
  }
};

module.exports = {
  generateMessage
};
