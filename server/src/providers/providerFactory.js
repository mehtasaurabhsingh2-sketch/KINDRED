const geminiProvider = require('./geminiProvider');
// const anthropicProvider = require('./anthropicProvider'); // Example for future
const { PROVIDERS } = require('../constants');

/**
 * Factory pattern to return the appropriate AI provider implementation.
 * Ensures that swapping AI models (Gemini -> Claude -> OpenAI) 
 * does not require changing the controller or conversation engine logic.
 */
const getProvider = (providerName = process.env.AI_PROVIDER) => {
  switch (providerName) {
    case PROVIDERS.GEMINI:
      return geminiProvider;
    // case PROVIDERS.ANTHROPIC:
    //   return anthropicProvider;
    default:
      throw new Error(`Unsupported AI Provider: ${providerName}`);
  }
};

module.exports = {
  getProvider
};
