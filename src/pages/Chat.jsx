import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import { modes } from '../data/modes';
import './Chat.css';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const modeId = searchParams.get('mode');

  const selectedMode = modes.find(m => m.id === modeId);

  return (
    <div className="chat-page-layout">
      <Sidebar />
      <main className="chat-main">
        {selectedMode ? (
          <ChatWindow mode={selectedMode} />
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
