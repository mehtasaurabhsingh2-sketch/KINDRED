import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import { personalities } from '../data/personalities';
import { AuthContext } from '../context/AuthContext';
import { getUserConversations } from '../services/firestore';
import { createConversationApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Chat.css';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const modeId = searchParams.get('mode');
  const cid = searchParams.get('cid');
  const navigate = useNavigate();
  
  const { currentUser } = useContext(AuthContext);
  const [activeConvoId, setActiveConvoId] = useState(cid);
  const [isInitializing, setIsInitializing] = useState(false);

  const selectedMode = personalities[modeId];

  useEffect(() => {
    const initializeChat = async () => {
      if (modeId && !cid && currentUser) {
        setIsInitializing(true);
        try {
          // Check if there is an existing conversation for this mode
          const { conversations } = await getUserConversations(currentUser.uid);
          const existingConvo = conversations.find(c => c.mode === modeId);
          
          if (existingConvo) {
            navigate(`/chat?mode=${modeId}&cid=${existingConvo.id}`, { replace: true });
          } else {
            // Create new conversation via backend API to ensure greeting is initialized
            const token = await currentUser.getIdToken();
            const title = `${personalities[modeId]?.name || 'New'} Conversation`;
            const { conversationId } = await createConversationApi(token, modeId, title);
            
            if (conversationId) {
              navigate(`/chat?mode=${modeId}&cid=${conversationId}`, { replace: true });
            }
          }
        } catch (err) {
          console.error("Failed to initialize chat:", err);
          alert("Failed to initialize conversation. Please ensure the backend is running.");
        } finally {
          setIsInitializing(false);
        }
      } else if (cid) {
        setActiveConvoId(cid);
      }
    };

    initializeChat();
  }, [modeId, cid, currentUser, navigate]);

  return (
    <div className="chat-page-layout">
      <Sidebar />
      <main className="chat-main">
        {isInitializing ? (
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
