# Kindred Manual Test Checklist

This checklist should be executed before any major release (e.g., Phase 3 AI Integration) to ensure all core functionality is working as expected.

## 1. Authentication Flow
- [ ] User can register a new account with a valid email and password.
- [ ] User is prevented from registering if passwords do not match.
- [ ] User is prevented from registering with a weak password (< 6 chars).
- [ ] User is prevented from registering with an invalid email format.
- [ ] Existing user can log in with email and password.
- [ ] Existing user can log in using Google OAuth.
- [ ] User receives a friendly error message for invalid credentials.
- [ ] User can successfully log out, returning to the login page.

## 2. Protected Routes & Navigation
- [ ] Unauthenticated users are redirected to `/login` when trying to access `/dashboard`.
- [ ] Authenticated users cannot access `/login` or `/register` (redirected to `/dashboard`).
- [ ] Deep linking to `/chat` without a `mode` parameter gracefully prompts the user to select a mode.
- [ ] Unknown routes (e.g., `/does-not-exist`) display the 404 Not Found page.
- [ ] Browser Back and Forward buttons work as expected across the app.

## 3. Conversation Flow
- [ ] Clicking a mode on the Dashboard creates a new conversation in Firestore.
- [ ] Creating a new conversation navigates the user to the Chat interface.
- [ ] User can send a message and it appears instantly in the Chat Window.
- [ ] Messages persist upon browser refresh.
- [ ] The `textarea` automatically grows/scrolls, and character limit (500) is enforced.
- [ ] `Enter` sends the message, `Shift+Enter` adds a new line.

## 4. History & Dashboard
- [ ] Dashboard correctly displays the total number of recent chats.
- [ ] Dashboard displays the 3 most recent chats with correct preview messages.
- [ ] History page (`/history`) displays all past conversations.
- [ ] History page "Load More" button works correctly (paginates 10 at a time).
- [ ] Clicking a chat in History resumes that exact conversation.
- [ ] Clicking the "Delete" trash can removes the conversation (after confirmation).

## 5. UI/UX & Edge Cases
- [ ] "Loading..." spinners appear correctly during authentication, data fetching, and navigation.
- [ ] "No conversations yet" empty states look polished on Dashboard and History.
- [ ] Mobile Viewport (375px): Sidebar collapses or fits cleanly, Chat Window input doesn't break off-screen.
- [ ] Dark mode theme applies correctly across all pages without flashing white on load.
- [ ] Hover effects and micro-animations perform smoothly without lag.
