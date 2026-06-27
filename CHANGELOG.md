# Changelog

All notable changes to the Kindred project will be documented in this file.

## [v0.2.7] - Current
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
