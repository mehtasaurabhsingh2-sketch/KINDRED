const { PERSONALITIES } = require('../constants');
const personalitiesConfig = require('../config/personalities');

/**
 * Builds the system instruction prompt in layers using rich personality configurations.
 */
const buildSystemPrompt = ({ mode, userProfile = {}, conversationSummary = '' }) => {
  const config = personalitiesConfig[mode] || personalitiesConfig[PERSONALITIES.FRIEND];
  const layers = [];

  // 1. CORE SYSTEM RULES & GOAL
  layers.push('CORE DIRECTIVE: You are an AI companion named Kindred. Never break character.');
  if (config.conversationGoal) {
    layers.push(`CONVERSATION GOAL: ${config.conversationGoal}`);
  }

  // 2. PERSONALITY
  layers.push(`\nPERSONALITY:\n${config.systemPrompt}`);
  
  // 3. COMMUNICATION TRAITS (optional — only present on rich personality configs)
  if (config.communication) {
    const comms = config.communication;
    layers.push(`\nCOMMUNICATION TRAITS (0-10 scale):
- Empathy: ${comms.empathy ?? 5}/10
- Humor: ${comms.humor ?? 5}/10
- Directness: ${comms.directness ?? 5}/10
- Verbosity: ${comms.verbosity ?? 5}/10
- Formality: ${comms.formality ?? 5}/10
- Emoji Usage: ${comms.emojiLevel ?? 3}/10`);
  }

  // 4. STYLE GUIDELINES (optional)
  if (config.styleGuidelines) {
    layers.push(`\nSTYLE GUIDELINES:\n${config.styleGuidelines}`);
  }

  // 5. BEHAVIORAL RULES (optional)
  if (config.behavioralRules?.dos?.length > 0) {
    layers.push(`\nBEHAVIORAL RULES:\nDO:\n- ${config.behavioralRules.dos.join('\n- ')}`);
  }
  if (config.behavioralRules?.donts?.length > 0) {
    layers.push(`\nDO NOT:\n- ${config.behavioralRules.donts.join('\n- ')}`);
  }
  
  // 6. FORBIDDEN TOPICS (optional)
  if (config.forbiddenTopics?.length > 0) {
    layers.push(`\nFORBIDDEN TOPICS:\n- ${config.forbiddenTopics.join('\n- ')}`);
  }

  // 7. EXAMPLES (optional — Few-Shot)
  if (config.examples?.length > 0) {
    const formattedExamples = config.examples.map(ex => `${ex.role.toUpperCase()}: ${ex.content}`).join('\n');
    layers.push(`\nEXAMPLE INTERACTIONS:\n${formattedExamples}`);
  }

  // 8. USER PROFILE (Placeholder for future phases)
  if (Object.keys(userProfile).length > 0) {
    layers.push(`\nUSER CONTEXT:\nThe user you are speaking with has the following profile: ${JSON.stringify(userProfile)}`);
  }

  // 9. CONVERSATION SUMMARY (Placeholder for future long-term memory)
  if (conversationSummary) {
    layers.push(`\nCONVERSATION HISTORY SUMMARY:\n${conversationSummary}`);
  }

  return layers.join('\n');
};

module.exports = {
  buildSystemPrompt,
  personalitiesConfig
};
