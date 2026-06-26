/**
 * Constructs the final prompt payload to be sent to the AI provider.
 * 
 * @param {Object} userProfile The logged-in user's profile data.
 * @param {Array} history The recent conversation history for context.
 * @param {Object} personality The selected AI personality configuration.
 * @param {String} latestMessage The newest user message to respond to.
 * @param {Array} relevantMemories Optional injected memories for long-term context.
 * @returns {Object} A structured prompt object.
 */
export const buildPrompt = (userProfile, history, personality, latestMessage, relevantMemories = []) => {
  // TODO: Phase 3 - Implement prompt formatting logic
  return {
    system: personality.systemPrompt,
    context: {
      userName: userProfile?.displayName,
      memories: relevantMemories
    },
    messages: [
      ...history,
      { role: 'user', content: latestMessage }
    ],
    temperature: personality.temperature
  };
};
