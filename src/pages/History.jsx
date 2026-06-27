import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getPaginatedUserConversations, deleteConversation } from '../services/firestore';
import { personalities } from '../data/personalities';
import LoadingSpinner from '../components/LoadingSpinner';
import * as Icons from 'lucide-react';
import './History.css';

const History = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchChats = async (isLoadMore = false) => {
    if (!currentUser) return;
    
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    const { conversations: newChats, lastVisible: newLastVisible, error } = await getPaginatedUserConversations(
      currentUser.uid, 
      isLoadMore ? lastVisible : null, 
      10
    );

    if (error) {
      console.error("Error loading chats:", error);
    } else {
      if (newChats.length < 10) {
        setHasMore(false);
      }
      
      if (isLoadMore) {
        setConversations(prev => [...prev, ...newChats]);
      } else {
        setConversations(newChats);
      }
      setLastVisible(newLastVisible);
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchChats();
  }, [currentUser]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const handleOpenChat = (modeId, conversationId) => {
    navigate(`/chat?mode=${modeId}&cid=${conversationId}`);
  };

  const handleDelete = async (e, conversationId) => {
    e.stopPropagation(); // Prevent opening the chat when clicking delete
    
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this conversation?");
    if (!confirmDelete) return;

    // Optimistically update UI
    setConversations(prev => prev.filter(c => c.id !== conversationId));

    const { error } = await deleteConversation(conversationId);
    if (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete conversation. Please try again.");
      // If it fails, refresh the list to ensure accurate state
      fetchChats();
    }
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="history-container loading-container">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="history-container">
      <header className="history-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={24} />
          </button>
          <h1>Recent Chats</h1>
        </div>
      </header>

      <main className="history-content">
        {conversations.length === 0 ? (
          <div className="empty-history">
            <MessageSquare size={48} className="empty-icon" />
            <h2>No conversations yet</h2>
            <p>Start a new chat from the dashboard to see it here.</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="history-list">
            {conversations.map((chat) => {
              const personality = personalities[chat.mode] || personalities['friend'];
              const IconComponent = Icons[personality.icon] || Icons.MessageSquare;
              
              return (
                <div 
                  key={chat.id} 
                  className="history-card"
                  onClick={() => handleOpenChat(chat.mode, chat.id)}
                >
                  <div className="history-card-icon" style={{ backgroundColor: `${personality.color}20`, color: personality.color }}>
                    <IconComponent size={24} />
                  </div>
                  <div className="history-card-details">
                    <h3>{chat.title}</h3>
                    <div className="history-card-meta">
                      <span className="mode-badge">{personality.name} Mode</span>
                      <span className="date-badge">
                        <Calendar size={14} />
                        {formatDate(chat.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="history-card-action">
                    <button 
                      className="delete-chat-btn" 
                      onClick={(e) => handleDelete(e, chat.id)}
                      title="Delete Conversation"
                      aria-label="Delete Conversation"
                    >
                      <Trash2 size={20} />
                    </button>
                    <ChevronRight size={20} style={{ marginLeft: '10px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && conversations.length > 0 && (
          <div className="load-more-container">
            <button 
              className="btn-secondary load-more-btn" 
              onClick={() => fetchChats(true)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
