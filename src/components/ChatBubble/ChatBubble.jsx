import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';
import './ChatBubble.css';

const ChatBubble = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user' || message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = useCallback(async () => {
    const text = message.text || message.content || '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [message.text, message.content]);

  return (
    <div className={`chat-bubble-container ${isUser ? 'user' : 'ai'}`}>
      <div className={`chat-bubble ${isUser ? 'user' : 'ai'} ${isStreaming ? 'streaming' : ''}`}>
        {isUser ? (
          <p>{message.text || message.content}</p>
        ) : (
          <MarkdownRenderer
            content={message.text || message.content || ''}
            isStreaming={isStreaming}
          />
        )}
        <div className="chat-bubble-footer">
          <span className="chat-timestamp">{formatTime(message.timestamp)}</span>
          {!isUser && !isStreaming && (
            <button
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              aria-label={copied ? 'Copied!' : 'Copy message'}
              title={copied ? 'Copied!' : 'Copy'}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied ✓' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatBubble);
