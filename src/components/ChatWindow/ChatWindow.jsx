import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { Send, Square } from 'lucide-react';
import * as Icons from 'lucide-react';
import ChatBubble from '../ChatBubble/ChatBubble';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification/Notification';
import { chatStreamApi } from '../../services/api';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './ChatWindow.css';



const ChatWindow = ({ mode, conversationId }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState(null);
  const [failedText, setFailedText] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isNearBottomRef = useRef(true);

  const IconComponent = Icons[mode.icon] || Icons.Smile;
  const MAX_CHARS = 500;

  // --- Smart Auto-Scroll ---
  const checkIfNearBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return true;
    const threshold = 150; // px from bottom
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= threshold;
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    if (force || isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const nearBottom = checkIfNearBottom();
    isNearBottomRef.current = nearBottom;
    setShowScrollBtn(!nearBottom);
  }, [checkIfNearBottom]);

  // --- Real-time Firestore listener ---
  useEffect(() => {
    if (!conversationId) return;

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => doc.data());
      setMessages(loadedMessages);
      setIsLoading(false);
      setTimeout(() => scrollToBottom(true), 100);
    }, (err) => {
      console.error('Error fetching messages:', err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId, scrollToBottom]);

  // Auto-scroll during streaming if near bottom
  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [streamingText, isStreaming, scrollToBottom]);

  // --- Stop streaming ---
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // --- Send message via SSE stream ---
  const handleSend = useCallback(async (retryMessage = null) => {
    const textToSend = typeof retryMessage === 'string' ? retryMessage : inputText.trim();
    if (textToSend === '' || isStreaming || !currentUser) return;

    setError(null);
    setFailedText('');
    if (typeof retryMessage !== 'string') setInputText('');

    // Optimistic user message (displayed immediately, before Firestore confirms)
    const optimisticMsg = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
      _optimistic: true
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(true), 50);

    setIsStreaming(true);
    setStreamingText('');

    try {
      const token = await currentUser.getIdToken();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await chatStreamApi(
        token,
        { message: textToSend, conversationId, mode: mode.id },
        controller.signal
      );

      // Robust SSE parser — pairs event: + data: lines correctly
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // hold incomplete last line

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.slice(6).trim();
          } else if (trimmed.startsWith('data:')) {
            try {
              const payload = JSON.parse(trimmed.slice(5).trim());
              if (currentEvent === 'token' && payload.text) {
                accumulated += payload.text;
                setStreamingText(accumulated);
              } else if (currentEvent === 'error') {
                throw new Error(payload.message || 'Stream error from server');
              }
              // 'start', 'metadata', 'end' events — no UI action needed here
            } catch (parseErr) {
              if (parseErr.message.includes('Stream error')) throw parseErr;
              // else skip malformed JSON
            }
            currentEvent = ''; // reset after data line
          }
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        // User intentionally stopped — not an error
        console.log('Stream aborted by user.');
      } else {
        console.error('Streaming error:', err);
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => !m._optimistic));
        setError(err.message || 'Unable to reach the server.');
        setFailedText(textToSend);
        if (typeof retryMessage !== 'string') setInputText(textToSend);
      }
    } finally {
      setIsStreaming(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  }, [inputText, conversationId, mode.id, currentUser, isStreaming, scrollToBottom]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInputChange = useCallback((e) => {
    if (e.target.value.length <= MAX_CHARS) setInputText(e.target.value);
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
            <span className={`status-dot ${isStreaming ? 'streaming' : ''}`}></span>
            {isStreaming ? 'Thinking…' : 'Online'}
          </div>
        </div>
      </header>

      <div
        className="chat-messages"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {messages.filter(m => !m._optimistic).length === 0 && !isStreaming ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
            <p>This is the start of your conversation with {mode.name}.</p>
          </div>
        ) : (
          messages
            .filter(m => !m._optimistic)
            .map((msg, index) => (
              <ChatBubble key={msg.id || index} message={msg} />
            ))
        )}

        {/* Optimistic user messages (not yet confirmed by Firestore) */}
        {messages
          .filter(m => m._optimistic)
          .map((msg, index) => (
            <ChatBubble key={`optimistic-${index}`} message={msg} />
          ))
        }

        {/* Live streaming bubble */}
        {isStreaming && streamingText && (
          <ChatBubble
            message={{ role: 'assistant', text: streamingText, timestamp: new Date().toISOString() }}
            isStreaming={true}
          />
        )}

        {/* Typing dots while waiting for first token */}
        {isStreaming && !streamingText && (
          <div className="ai-typing-indicator">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Smart scroll button */}
      {showScrollBtn && (
        <button
          className="scroll-to-bottom-btn"
          onClick={() => scrollToBottom(true)}
          aria-label="Jump to latest message"
        >
          ↓ Latest
        </button>
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
            placeholder={isStreaming ? 'Waiting for response…' : 'Type your message here...'}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isStreaming}
            aria-label="Message input"
          />
          {isStreaming ? (
            <button
              className="chat-stop-btn"
              onClick={handleStop}
              aria-label="Stop generating"
              title="Stop generating"
            >
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={inputText.trim() === ''}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          )}
        </div>
        <span className="char-counter">
          {inputText.length}/{MAX_CHARS} characters
        </span>
      </div>
    </div>
  );
};

export default ChatWindow;
