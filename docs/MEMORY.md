# Long-Term Memory Architecture

To make the AI feel truly personalized, it must remember past conversations. However, feeding entire chat histories into the context window is too expensive and exceeds token limits.

## Our Approach

1. **Short-Term Context (Sliding Window)**
   - We pass only the last `N` messages of the current conversation directly in the prompt array.

2. **Mid-Term Context (Summarization)**
   - When a conversation gets too long, `summarizeConversation()` will condense older messages into a short paragraph.

3. **Long-Term Memory (Entity Extraction & Retrieval)**
   - Key facts about the user (e.g., "User is struggling with imposter syndrome", "User has a dog named Max") will be extracted and saved to `userMemories` in Firestore.
   - When the user starts a new conversation, `retrieveRelevantMemory()` will fetch these facts and inject them into the System Prompt's context block.
