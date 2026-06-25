import React from 'react';
import './ChatBubble.css';

const ChatBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-bubble-container ${isUser ? 'user' : 'ai'}`}>
      <div className={`chat-bubble ${isUser ? 'user' : 'ai'}`}>
        <p>{message.text}</p>
        <span className="chat-timestamp">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
};

export default ChatBubble;
