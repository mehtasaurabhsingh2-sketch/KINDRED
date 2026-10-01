import React, { useEffect, useState, useRef, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import { personalities } from '../data/personalities';
import { AuthContext } from '../context/AuthContext';
import { createConversationApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification/Notification';
import './Chat.css';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const modeId = searchParams.get('mode');
  const cid = searchParams.get('cid');
  const navigate = useNavigate();

  const { currentUser } = useContext(AuthContext);
  const [activeConvoId, setActiveConvoId] = useState(cid);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);

  // Guard against React StrictMode double-firing the effect in development.
  // Without this, two conversations would be created on the first mount.
  const initializingRef = useRef(false);

  // Separate guard for the imperative "New Chat" button — prevents double-clicks
  // from racing each other while a creation request is already in flight.
  const isCreatingRef = useRef(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const selectedMode = personalities[modeId];

  // Lock the body so only the chat message list scrolls — not the whole page.
  // Cleaned up automatically when the user leaves the chat route.
  useEffect(() => {
    document.body.classList.add('chat-open');
    return () => document.body.classList.remove('chat-open');
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const initializeChat = async () => {
      // Path A: a specific conversation ID is already in the URL — just open it.
      if (cid) {
        setActiveConvoId(cid);
        initializingRef.current = false;
        return;
      }

      // Path B: mode is set but no cid — always create a brand-new conversation.
      if (modeId && currentUser) {
        // Prevent StrictMode double-fire from creating two conversations.
        if (initializingRef.current) return;
        initializingRef.current = true;

        setIsInitializing(true);
        setError(null);
        try {
          const token = await currentUser.getIdToken();
          const title = `${personalities[modeId]?.name || 'New'} Conversation`;
          const { conversationId } = await createConversationApi(token, modeId, title);

          if (!isCancelled && conversationId) {
            // Replace the current history entry so the Back button is not broken.
            navigate(`/chat?mode=${modeId}&cid=${conversationId}`, { replace: true });
          }
        } catch (err) {
          if (!isCancelled) {
            console.error('Failed to initialize chat:', err);
            setError('Failed to initialize conversation. Please ensure the backend is running.');
          }
        } finally {
          // ─── Guard reset ───────────────────────────────────────────────
          // Only reset initializingRef when this specific request was NOT
          // cancelled. If it was cancelled, the cleanup already reset the ref
          // and a new request may have already set it to true — resetting it
          // here would unblock a third, unwanted creation attempt.
          if (!isCancelled) {
            initializingRef.current = false;
          }
          // ─── Spinner ────────────────────────────────────────────────────
          // Always clear the loading spinner, even for stale (cancelled)
          // requests. React 18+ safely ignores setState calls after unmount.
          // Without this, a dep-change mid-flight leaves the spinner frozen.
          setIsInitializing(false);
        }
      }
    };

    initializeChat();

    return () => {
      isCancelled = true;
      // ─── Critical: reset the guard in the cleanup ────────────────────
      // If deps changed while an API call was in flight, the next effect run
      // must be allowed to create a new conversation. Without this reset,
      // the new run sees initializingRef=true and bails out silently, leaving
      // the user with a frozen spinner and no conversation.
      initializingRef.current = false;
    };
  }, [modeId, cid, currentUser, navigate]);

  /**
   * Imperative handler for the "New Chat" button.
   * Runs independently of the useEffect lifecycle — always creates a fresh
   * conversation in the current mode and navigates to it.
   */
  const handleNewChat = async () => {
    if (!modeId || !currentUser || isCreatingRef.current) return;

    isCreatingRef.current = true;
    setIsCreatingChat(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const title = `${personalities[modeId]?.name || 'New'} Conversation`;
      const { conversationId } = await createConversationApi(token, modeId, title);

      if (conversationId) {
        // Push a new history entry so the user can press Back to return to the
        // previous conversation. We do NOT use replace:true here.
        navigate(`/chat?mode=${modeId}&cid=${conversationId}`);
      }
    } catch (err) {
      console.error('Failed to create new chat:', err);
      setError('Failed to start a new conversation. Please try again.');
    } finally {
      isCreatingRef.current = false;
      setIsCreatingChat(false);
    }
  };

  return (
    <div className="chat-page-layout">
      <Sidebar />
      <main className="chat-main">
        {error ? (
          <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <Notification
              message={error}
              type="error"
              onDismiss={() => {
                setError(null);
                navigate('/dashboard#modes');
              }}
              onRetry={!activeConvoId ? handleNewChat : null}
            />
          </div>
        ) : isInitializing ? (
          <LoadingSpinner fullScreen={false} />
        ) : selectedMode && activeConvoId ? (
          <ChatWindow
            mode={selectedMode}
            conversationId={activeConvoId}
            onNewChat={handleNewChat}
            isCreatingChat={isCreatingChat}
          />
        ) : (
          <div className="no-mode-selected">
            <h2>Select a Companion</h2>
            <p>Choose an AI personality from the dashboard to start a meaningful conversation.</p>
            <Link to="/dashboard#modes" className="btn-primary">
              View Modes
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
