import React, { useState, useRef, useEffect, useContext } from 'react';
import { Send } from 'lucide-react';
import * as Icons from 'lucide-react';
import ChatBubble from '../ChatBubble/ChatBubble';
import { AppContext } from '../../context/AppContext';
import './ChatWindow.css';

const ChatWindow = ({ mode }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const { chats, sendMessage } = useContext(AppContext);
  
  const currentChats = chats[mode.id] || [];
  const IconComponent = Icons[mode.icon] || Icons.Smile;
  const MAX_CHARS = 500;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChats]);

  const handleSend = () => {
    if (inputText.trim() === '') return;
    sendMessage(mode.id, inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setInputText(e.target.value);
    }
  };

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
        {currentChats.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
            <p>This is the start of your conversation with {mode.name}.</p>
          </div>
        ) : (
          currentChats.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

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
            disabled={inputText.trim() === ''}
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
