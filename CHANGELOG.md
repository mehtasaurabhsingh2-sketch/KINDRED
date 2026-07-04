# Changelog

All notable changes to the Kindred project will be documented in this file.

## [v0.4.0-beta] - 2026-07-04
### 🚀 Features
- **Personality Intelligence Engine**: Introduced centralized personality configurations with psychological traits (Empathy, Humor, Directness, Verbosity), strict behavioral boundaries, and dynamic prompt assembly.
- **Hybrid Conversation Init**: The backend now owns conversation creation (`POST /api/conversations`) and automatically generates and persists the initial AI greeting based on the selected personality mode.
- **Operational Metrics**: Added deep telemetry to firestore message records, tracking `latencyMs`, token usage, selected personality, and version for every AI generation.
- **Evaluation Suite**: Added a 50-scenario regression testing suite (`prompt_evaluation.md`) to verify personality distinctiveness across emotional, professional, philosophical, and safety vectors.

### 🛠 Improvements
- Decoupled frontend from direct Firestore conversation creation. The backend is now the absolute single source of truth for the conversation lifecycle.
- Replaced blocking browser `alert()` popups with a reusable, non-blocking UI `<Notification />` component that supports automatic retry logic.
- Implemented robust error handling in the `ConversationEngine` with timeouts, exponential backoff, and graceful recovery paths that preserve user input during transient network failures.

### 🐛 Bug Fixes
- Added strict Ownership Verification on `/api/chat` and `/api/title` endpoints (returns `403 Forbidden` if a user attempts to interact with another user's conversation ID).
- Fixed silent personality fallbacks: Invalid or unrecognized AI modes now cleanly reject with `400 Bad Request` and structured JSON error codes.

### ⚠️ Breaking Changes
- `createConversation` logic was entirely removed from `firestore.js`. Frontend clients must now use the authenticated `POST /api/conversations` endpoint via `api.js` to create conversations.

## [v0.3.0]
- **Added** Express backend server to proxy Gemini API calls securely.
- **Added** Rate limiting (`apiLimiter`, `aiInferenceLimiter`) for security.
- **Added** Firebase Admin SDK token verification middleware.

## [v0.2.7]
- **Added** Delete conversation feature to permanently remove chats and their messages from Firestore.

## [v0.2.6]
- **Added** Dedicated `History.jsx` page for viewing all previous conversations.
- **Added** Firestore pagination for fetching conversations in chunks of 10.
- **Improved** Navigation in Sidebar and Dashboard to route to the new History page.

## [v0.2.5]
- **Refactored** System architecture to completely decouple AI logic from React components.
- **Added** Centralized `personalities.js` system.
- **Prepared** Empty provider abstractions (`saveConversationSummary`, `saveUserMemory`, etc.) in `firestore.js`.

## [v0.2.0]
- **Added** Firebase Authentication (Email/Password & Google Login).
- **Added** Real-time Firestore database for storing users, conversations, and messages.
- **Added** Secure Protected Routes.

## [v0.1.0]
- **Initial Release:** Complete responsive frontend UI (Home, Dashboard, Chat Window, Settings) using React and Vanilla CSS.
