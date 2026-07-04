import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { Send } from 'lucide-react';
import * as Icons from 'lucide-react';
import ChatBubble from '../ChatBubble/ChatBubble';
import { saveMessage } from '../../services/firestore'; // Leaving for potential fallback if needed
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification/Notification';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './ChatWindow.css';

const ChatWindow = ({ mode, conversationId }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [failedText, setFailedText] = useState('');
  const { currentUser } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  
  const IconComponent = Icons[mode.icon] || Icons.Smile;
  const MAX_CHARS = 500;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!conversationId) return;

    // Real-time listener for messages
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => doc.data());
      setMessages(loadedMessages);
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const handleSend = useCallback(async (retryMessage = null) => {
    const textToSend = typeof retryMessage === 'string' ? retryMessage : inputText.trim();
    if (textToSend === '' || isSending || !currentUser) return;
    
    // Clear previous errors
    setError(null);
    setFailedText('');

    // Optimistic UI Update: Instantly show the user's message on screen
    const optimisticMessage = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    if (typeof retryMessage !== 'string') {
      setInputText(''); 
    }
    setIsSending(true);
    
    // Force a scroll down instantly for the optimistic message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    
    try {
      const token = await currentUser.getIdToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: textToSend,
          conversationId,
          mode: mode.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || errorData?.message || 'Failed to send message to the backend.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m !== optimisticMessage));
      setError(err.message || 'Unable to reach the server.');
      setFailedText(textToSend);
      // Restore the input text so they don't lose their message if they don't use retry
      if (typeof retryMessage !== 'string') {
        setInputText(textToSend); 
      }
    } finally {
      setIsSending(false);
    }
  }, [inputText, conversationId, mode.id, currentUser, isSending]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInputChange = useCallback((e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setInputText(e.target.value);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="chat-window" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="chat-window">
      <header className="chat-header">
        <div className="chat-header-icon" style={{ color: mode.color }}>
          <IconComponent size={24} />
        </div>
        <div className="chat-header-info">
          <h2>{mode.name} Mode</h2>
          <div className="chat-status">
            <span className="status-dot"></span>
            Online
          </div>
        </div>
      </header>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
            <p>This is the start of your conversation with {mode.name}.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {isSending && (
        <div className="ai-typing-indicator">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </div>
      )}

      {error && (
        <div style={{ padding: '0 16px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <Notification 
            message={error} 
            type="error" 
            onDismiss={() => setError(null)} 
            onRetry={failedText ? () => handleSend(failedText) : null}
          />
        </div>
      )}

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            placeholder="Type your message here..."
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="Message input"
          />
          <button 
            className="chat-send-btn"
            onClick={handleSend}
            disabled={inputText.trim() === '' || isSending}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
        <span className="char-counter">
          {inputText.length}/{MAX_CHARS} characters
        </span>
      </div>
    </div>
  );
};

export default ChatWindow;
