/**
 * Gemini Provider Interface Placeholder
 * Implements the standard AI Provider Interface expected by the ConversationEngine.
 */

const generateMessage = async ({ prompt, context, options }) => {
  // TODO: Phase 3 - Implement actual Gemini API call
  return {
    success: true,
    text: "[Placeholder] Gemini would respond here.",
    metadata: {
      provider: 'gemini',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      tokensUsed: 0,
      latency: 0
    }
  };
};

module.exports = {
  generateMessage
};
