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

  const selectedMode = personalities[modeId];

  useEffect(() => {
    const initializeChat = async () => {
      // Path A: a specific conversation ID is already in the URL — just open it.
      if (cid) {
        setActiveConvoId(cid);
        return;
      }

      // Path B: mode is set but no cid — always create a brand-new conversation.
      if (modeId && currentUser) {
        // Prevent StrictMode double-fire from creating two conversations.
        if (initializingRef.current) return;
        initializingRef.current = true;

        setIsInitializing(true);
        try {
          const token = await currentUser.getIdToken();
          const title = `${personalities[modeId]?.name || 'New'} Conversation`;
          const { conversationId } = await createConversationApi(token, modeId, title);

          if (conversationId) {
            // Replace the current history entry so the Back button is not broken.
            navigate(`/chat?mode=${modeId}&cid=${conversationId}`, { replace: true });
          }
        } catch (err) {
          console.error('Failed to initialize chat:', err);
          setError('Failed to initialize conversation. Please ensure the backend is running.');
          // Reset the guard on failure so the user can retry.
          initializingRef.current = false;
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializeChat();
  }, [modeId, cid, currentUser, navigate]);

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
            />
          </div>
        ) : isInitializing ? (
          <LoadingSpinner fullScreen={false} />
        ) : selectedMode && activeConvoId ? (
          <ChatWindow mode={selectedMode} conversationId={activeConvoId} />
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
