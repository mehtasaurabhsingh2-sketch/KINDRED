/**
 * Formats AI responses for the React UI.
 * Handles markdown parsing, link hydration, and typing effects.
 */

export const formatMarkdown = (rawText) => {
  // TODO: Phase 3 - Convert markdown to HTML or React elements
  return rawText;
};

export const applyTypingEffect = (text, callback, speed = 30) => {
  // TODO: Phase 3 - Simulate typing effect for non-streaming responses
  let i = 0;
  const timer = setInterval(() => {
    callback(text.substring(0, i));
    i++;
    if (i > text.length) clearInterval(timer);
  }, speed);
  return timer;
};

export const processStreamChunk = (chunk) => {
  // TODO: Phase 3 - Parse streaming JSON chunks from the API
  return chunk;
};
