# KINDRED AI — Bug Report, Audit & Resolution Document

**Date:** September 29, 2026  
**Auditor:** Antigravity AI Engine  
**Project:** KINDRED (AI Companion Web Application)  
**Status:** All issues resolved & verified  

---

## 1. Executive Summary

A comprehensive end-to-end health audit was conducted across the KINDRED codebase covering frontend, backend, routing, API endpoints, streaming responses, and data layers. 

All 8 AI personality modes (`friend`, `mentor`, `motivation`, `study`, `relationship`, `wellness`, `career`, `custom`), real-time Gemini streaming via Server-Sent Events (SSE), Firebase Authentication, Firestore message persistence, and UI page rendering were validated.

During this inspection, **6 distinct issues/bugs** were identified and successfully resolved.

---

## 2. Issues Discovered and Resolved

### Bug 1: File Corruption / Invalid UTF-16 Encoding in Server Services
- **Location:** [`server/src/services/memoryService.js`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/server/src/services/memoryService.js) and [`server/src/services/safetyService.js`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/server/src/services/safetyService.js)
- **Symptom:** Linter and tooling failed with `"stream did not contain valid UTF-8"` (`Buffer <ff fe ...>`).
- **Root Cause:** Files were previously created/saved with UTF-16 LE encoding with BOM (typical of Windows PowerShell output redirection).
- **Fix:** Recreated both service files with valid UTF-8 encoding and clean exports matching the architecture interfaces.
- **Verification:** Both files now parse cleanly without linter or runtime errors.

---

### Bug 2: Public Health Endpoint 401 Unauthorized Under `/api/health`
- **Location:** [`server/src/routes/index.js`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/server/src/routes/index.js)
- **Symptom:** Calling `GET /api/health` returned `401 Unauthorized: No token provided`.
- **Root Cause:** Health check was registered only at `GET /health`, while the Firebase auth middleware was registered as `router.use('/api', verifyFirebaseToken)`. Any health check probe hitting `/api/health` was caught by the auth middleware.
- **Fix:** Added `router.get('/api/health', apiLimiter, checkHealth)` before the `/api` auth middleware so both `/health` and `/api/health` are accessible to load balancers, health probes, and uptime monitors.
- **Verification:** Tested both `http://localhost:3000/health` and `http://localhost:3000/api/health`, both returning `{ status: 'ok', firebase: true, gemini: true }`.

---

### Bug 3: Infinite Fetch / Re-render Loop in Conversation History
- **Location:** [`src/pages/History.jsx`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/src/pages/History.jsx)
- **Symptom:** Entering the History page caused infinite fetching of conversations, repeatedly updating `lastVisible` state.
- **Root Cause:** `fetchChats` was wrapped in `useCallback` with `[currentUser, lastVisible]` in its dependency array. In `useEffect`, `fetchChats` was called, which updated `lastVisible`, causing `fetchChats` to get a new reference, re-triggering `useEffect` infinitely.
- **Fix:** Separated `fetchInitialChats` (only depends on `currentUser`) from `fetchMoreChats` (handles paginated 'Load More' clicks).
- **Verification:** History page now loads exactly once on mount, and smoothly paginates when clicking "Load More".

---

### Bug 4: Mode Switch Lockout in Chat Route Lifecycle
- **Location:** [`src/pages/Chat.jsx`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/src/pages/Chat.jsx)
- **Symptom:** Switching between modes (e.g. from `/chat?mode=friend&cid=...` to `/chat?mode=mentor`) without unmounting could get stuck without creating the new conversation.
- **Root Cause:** `initializingRef.current` remained `true` from the previous conversation creation when the route remained mounted on `/chat`.
- **Fix:** Explicitly reset `initializingRef.current = false` when an active `cid` is opened and clear the error state on new initialization cycles.
- **Verification:** Switching between modes from sidebar, cards, and direct URLs seamlessly initializes fresh conversations.

---

### Bug 5: Unused Import in Dashboard Triggering Lint Warnings
- **Location:** [`src/pages/Dashboard.jsx`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/src/pages/Dashboard.jsx)
- **Symptom:** Lint warning for unused `createConversation` import.
- **Root Cause:** Dashboard only queries user conversations and recent messages; conversation creation is performed by `Chat.jsx` via backend API.
- **Fix:** Removed unused `createConversation` import.

---

### Bug 6: Linter Parameter Warnings across AI and Middleware Layers
- **Location:** [`server/src/controllers/chatController.js`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/server/src/controllers/chatController.js), [`server/src/middleware/errorHandler.js`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/server/src/middleware/errorHandler.js), [`src/components/MarkdownRenderer/MarkdownRenderer.jsx`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/src/components/MarkdownRenderer/MarkdownRenderer.jsx), [`src/services/firestore.js`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/src/services/firestore.js), [`src/services/ai/`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/src/services/ai/)
- **Symptom:** Multiple warnings for unused imports (`logError`, `PERSONALITIES`), unused variables (`reqId`), and signature parameters.
- **Fix:** Cleaned up unused imports/variables and prefixed interface parameters with underscores (`_node`, `_next`, `_userId`, etc.).
- **Verification:** `npm run lint` now runs with 0 errors.

---

---

## 3. System Verification Results

| Component | Status | Test Details |
| :--- | :--- | :--- |
| **Backend Health** | ✅ Passed | `GET /health` & `GET /api/health` return HTTP 200 with `firebase: true`, `gemini: true` |
| **8 AI Personalities** | ✅ Passed | Validated prompts, goals, greetings, and configs for all 8 modes |
| **Gemini AI Streaming** | ✅ Passed | SSE streaming token generator tested live against Gemini API |
| **Frontend Production Build** | ✅ Passed | `npm run build` bundled successfully in Vite with 0 errors |
| **Code Linter** | ✅ Passed | `npm run lint` executed with 0 errors (5 pre-existing context warnings) |
| **Navigation & Pages** | ✅ Passed | Home, Login, Register, Dashboard, Chat, History, Settings verified |
| **Conversation Init (E2E)** | ✅ Passed | Real Firebase user created real Firestore conversations via backend API |
| **New Chat Button (E2E)** | ✅ Passed | Two distinct conversation IDs confirmed: `..._friend_1790774886158` vs `..._friend_1790775026089` |
| **CORS (Dynamic Port)** | ✅ Fixed | Backend now allows all `localhost:*` origins in development |
| **Initialization Guards** | ✅ Fixed | Race condition in cleanup/finally fixed; spinner can no longer get stuck |

---

## 4. Phase 5A.2 Bugs (New Chat Feature — Post-Launch Audit)

### Bug 7: Initialization Guard Gets Stuck When Deps Change Mid-Flight
- **Location:** [`src/pages/Chat.jsx`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/src/pages/Chat.jsx) — `useEffect` cleanup
- **Symptom:** If URL params changed (e.g. `currentUser` token refresh or rapid mode switching) while a `createConversationApi` call was in-flight, the subsequent effect run would see `initializingRef.current = true` and bail out silently. The loading spinner would also freeze permanently because `setIsInitializing(false)` was guarded by `!isCancelled`.
- **Root Cause (two sub-bugs):**
  1. `useEffect` cleanup only set `isCancelled = true` but never reset `initializingRef.current`. The next run saw the stuck guard and returned early.
  2. `finally { if (!isCancelled) setIsInitializing(false) }` meant a cancelled-mid-flight request never cleared the spinner.
- **Fix applied in `Chat.jsx`:**
  ```js
  // In cleanup:
  return () => {
    isCancelled = true;
    initializingRef.current = false; // ← NEW: unblock the next effect run
  };

  // In finally:
  if (!isCancelled) {
    initializingRef.current = false; // only reset ref for non-stale requests
  }
  setIsInitializing(false); // ← always clear spinner (React 18+ safe)
  ```
- **Why the guard reset is guarded by `!isCancelled`:** If the stale request's `finally` ran *after* the new request had already set the ref to `true`, resetting it unconditionally would allow a third creation attempt. The cleanup already handles the reset before the new request starts.
- **Verification:** Traced all three scenarios (normal success, error, dep-change mid-flight) — no stuck guard, no stuck spinner in any case.

---

### Bug 8: CORS Port Mismatch Blocks All Backend Requests in Development
- **Location:** [`server/src/app.js`](file:///c:/Users/saura/OneDrive/Desktop/project_web_3/KINDRED/server/src/app.js) — CORS origin resolver
- **Symptom:** All `POST /api/conversations` and `POST /api/chat/stream` calls failed with `"Failed to create conversation via API."` when Vite started on any port other than `5173` (e.g. `5174`, `5175`, `5176`). The backend returned a CORS-blocked response, which `fetch()` surfaced as a network error.
- **Root Cause:** The default `allowedOrigins` fallback was `['http://localhost:5173']`. Vite increments the port when `5173` is already in use. Any port beyond `5173` was blocked by the CORS policy before reaching the auth middleware.
- **Fix applied in `server/src/app.js`:**
  ```js
  if (process.env.NODE_ENV === 'development' && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return callback(null, true); // allow any localhost port in dev
  }
  ```
- **Production safety:** This check is gated on `NODE_ENV === 'development'`. In production, the explicit `CORS_ORIGIN` environment variable is always used — no change to production security posture.
- **Verification:** E2E test confirmed that `http://localhost:5176` (Vite's dynamically selected port) successfully reached the backend and received valid Firebase-authenticated responses.

---

## 5. E2E Test Results (Phase 5A.2)

**Test environment:** `testuser2@example.com` on local dev stack (Vite + Express + Firebase + Gemini)

| Test | Result | Evidence |
| :--- | :--- | :--- |
| Login & Dashboard | ✅ Pass | "Welcome back, Test User 2!" visible |
| Mode card → Conversation creation | ✅ Pass | `cid = ..._friend_1790774886158` created in Firestore |
| New Chat button → New cid | ✅ Pass | `cid = ..._friend_1790775026089` — distinct from first |
| Old conversation accessible by URL | ✅ Pass | Navigation to old `cid` URL loaded without error |
| No double conversation creation | ✅ Pass | `isCreatingRef` guard confirmed no duplicates |
