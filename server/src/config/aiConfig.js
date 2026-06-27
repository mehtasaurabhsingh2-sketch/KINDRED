const aiConfig = {
  provider: process.env.AI_PROVIDER || "gemini",
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  maxHistory: Number(process.env.MAX_HISTORY || 15),
  timeout: Number(process.env.REQUEST_TIMEOUT || 30000),
  maxOutputTokens: Number(process.env.MAX_OUTPUT_TOKENS || 1024),
};

module.exports = aiConfig;
