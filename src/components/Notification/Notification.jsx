import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import './Notification.css';

const Notification = ({ message, type = 'error', onDismiss, onRetry }) => {
  if (!message) return null;

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">
        <AlertCircle size={20} />
      </div>
      <div className="notification-content">
        <p>{message}</p>
      </div>
      <div className="notification-actions">
        {onRetry && (
          <button className="notification-btn retry-btn" onClick={onRetry}>
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        )}
        {onDismiss && (
          <button className="notification-btn dismiss-btn" onClick={onDismiss} aria-label="Dismiss">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;
