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
  layers.push(`CONVERSATION GOAL: ${config.conversationGoal}`);

  // 2. PERSONALITY & COMMUNICATION
  layers.push(`\nPERSONALITY:\n${config.systemPrompt}`);
  
  const comms = config.communication;
  layers.push(`\nCOMMUNICATION TRAITS (0-10 scale):
- Empathy: ${comms.empathy}/10
- Humor: ${comms.humor}/10
- Directness: ${comms.directness}/10
- Verbosity: ${comms.verbosity}/10
- Formality: ${comms.formality}/10
- Emoji Usage: ${comms.emojiLevel}/10`);

  // 3. STYLE GUIDELINES
  layers.push(`\nSTYLE GUIDELINES:\n${config.styleGuidelines}`);

  // 4. BEHAVIORAL RULES
  layers.push(`\nBEHAVIORAL RULES:\nDO:\n- ${config.behavioralRules.dos.join('\n- ')}`);
  layers.push(`\nDO NOT:\n- ${config.behavioralRules.donts.join('\n- ')}`);
  
  if (config.forbiddenTopics && config.forbiddenTopics.length > 0) {
    layers.push(`\nFORBIDDEN TOPICS:\n- ${config.forbiddenTopics.join('\n- ')}`);
  }

  // 5. EXAMPLES (Few-Shot)
  if (config.examples && config.examples.length > 0) {
    const formattedExamples = config.examples.map(ex => `${ex.role.toUpperCase()}: ${ex.content}`).join('\n');
    layers.push(`\nEXAMPLE INTERACTIONS:\n${formattedExamples}`);
  }

  // 6. USER PROFILE (Placeholder for future phases)
  if (Object.keys(userProfile).length > 0) {
    layers.push(`\nUSER CONTEXT:\nThe user you are speaking with has the following profile: ${JSON.stringify(userProfile)}`);
  }

  // 7. CONVERSATION SUMMARY (Placeholder for future long-term memory)
  if (conversationSummary) {
    layers.push(`\nCONVERSATION HISTORY SUMMARY:\n${conversationSummary}`);
  }

  return layers.join('\n');
};

module.exports = {
  buildSystemPrompt,
  personalitiesConfig
};
