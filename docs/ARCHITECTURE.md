# Architecture

Kindred uses a multi-layered architecture designed to keep the React UI entirely decoupled from the underlying AI Provider. This ensures that we can swap between OpenAI, Gemini, Claude, or Local models without changing a single React component.

## Layers

1. **UI Layer (React Context & Components)**
   - Responsible for rendering state.
   - Never calls AI APIs directly.
   - Communicates user intent to the Context/Service layers.

2. **Service Layer**
   - `auth.js` / `firestore.js`: Handles backend persistence.
   - `ai/`: Handles AI orchestration.

3. **AI Abstraction Layer**
   - `promptBuilder.js`: Compiles user profiles, memories, and context into a standard prompt payload.
   - `provider.js`: The ONLY file allowed to communicate with an external AI API.
   - `memory.js`: Orchestrates vector retrieval and summarization.
   - `safety.js`: Validates inputs/outputs for toxicity and prompt injection.
   - `responseFormatter.js`: Handles stream parsing and markdown rendering for the UI.
