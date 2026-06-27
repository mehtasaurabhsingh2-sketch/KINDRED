# Kindred Backend

This is the Node.js/Express backend for Kindred, responsible for safely orchestrating AI API calls, managing memory extraction, and enforcing security/rate limiting.

**The frontend React application NEVER communicates with AI providers directly. All prompts flow through this server.**

## Folder Architecture

```
server/
├── src/
│   ├── config/          # Firebase Admin & Provider init
│   ├── constants/       # Enums, models, provider names
│   ├── controllers/     # Route logic (Chat, Health, Title)
│   ├── middleware/      # Auth, Rate limiting, Error Handling, Request IDs
│   ├── providers/       # Factory pattern for AI abstractions (Gemini, Claude, etc.)
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic (Safety, Memory, Orchestration)
│   ├── utils/           # Custom loggers (Privacy-safe)
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point
├── package.json
└── .env                 # Secrets (NEVER commit this)
```

## Running the Project Locally

### 1. Configure Environment Variables
Copy `.env.example` to `.env` (or create one based on the template) and fill in your Firebase Admin SDK credentials and Gemini API key.

### 2. Start the Server
Navigate to the `server/` directory:
```bash
npm install
npm run dev # (If you have nodemon set up) or node src/server.js
```
The server will run on port 3000 by default.

### 3. Start the Client
Open a new terminal window, navigate to the project root (`../`), and run:
```bash
npm run dev
```
The frontend runs on port 5173.

## Environment Variables
- `FIREBASE_ADMIN_*`: Credentials for verifying frontend Firebase ID tokens securely.
- `AI_PROVIDER`, `GEMINI_API_KEY`, `GEMINI_MODEL`: Configuration for the AI factory.
- `REQUEST_TIMEOUT_MS`, `MAX_OUTPUT_TOKENS`: Limits to control costs and latency.
- `CORS_ORIGIN`: Ensures only our frontend can hit this backend.
