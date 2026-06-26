# Database Schema (Firestore)

Kindred utilizes a flat, NoSQL structure in Firestore to optimize for real-time reads and minimal deep-nesting costs.

## Current Collections (Phase 2)

### `users`
Stores global profile information.
- `uid` (String): Primary Key
- `displayName` (String)
- `email` (String)
- `favoriteMode` (String): References personality ID.
- `theme` (String): 'dark' | 'light'

### `conversations`
Metadata for a single chat thread.
- `id` (String): Composite ID (`{userId}_{modeId}_{timestamp}`)
- `userId` (String): Foreign Key to `users`
- `mode` (String): Personality ID
- `title` (String): Auto-generated or user-defined title
- `createdAt` (ISO String)
- `updatedAt` (ISO String): Used for sorting recent chats

### `messages`
Individual chat bubbles. Flat collection for rapid pagination and real-time updates.
- `id` (String): Composite ID (`{convoId}_{timestamp}`)
- `conversationId` (String): Foreign Key to `conversations`
- `sender` (String): 'user' | 'ai'
- `text` (String): Markdown payload
- `timestamp` (ISO String)
- `mode` (String): The personality active during this message

## Future Collections (Phase 3+)
- `userMemories`: Long-term factual extraction for vector search.
- `conversationSummaries`: Token-saving summaries of past chats.
