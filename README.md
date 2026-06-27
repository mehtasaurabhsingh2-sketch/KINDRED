# KINDRED: AI Companion System

Kindred is a full-stack AI companion platform built with React, Firebase, and Node.js. It features a complete architecture separating the frontend UI from the backend AI intelligence.

## Quick Start (Under 10 Minutes)

Follow these steps to get Kindred running locally.

### 1. Clone the Repository
```bash
git clone https://github.com/mehtasaurabhsingh2-sketch/KINDRED.git
cd KINDRED
```

### 2. Install Client Dependencies
```bash
npm install
```

### 3. Install Server Dependencies
```bash
cd server
npm install
```

### 4. Create Environment Files
You need two `.env` files: one for the client and one for the server.

**Client Environment (`KINDRED/.env.local`):**
Create `.env.local` in the root `KINDRED/` folder:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:3000
```

**Server Environment (`KINDRED/server/.env`):**
Copy the example file in the `server/` directory:
```bash
# Still in the server directory
cp .env.example .env
```
Open `server/.env` and add your Firebase Admin credentials (from Firebase Console -> Project Settings -> Service Accounts) and your Gemini API Key.

### 5. Run the Server
While inside the `server/` directory:
```bash
npm run dev
# OR: node src/server.js
```
*The server will start on http://localhost:3000.*

### 6. Run the Client
Open a **new terminal window**, navigate back to the `KINDRED/` root directory, and run:
```bash
npm run dev
```
*The client will start on http://localhost:5173.*

### 7. Open Localhost
Visit `http://localhost:5173` in your browser. You can now register, log in, select a theme, and interact with the AI engine!

---

## Architecture Overview
- **Client (`KINDRED/`):** React SPA (Vite) handling routing, themes, user auth, and chat UI.
- **Server (`KINDRED/server/`):** Node/Express backend enforcing Firebase Auth verification, rate-limiting, and AI provider orchestration (Gemini/Claude). No React component ever talks directly to the AI.
