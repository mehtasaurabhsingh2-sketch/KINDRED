import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';
import ModeCard from '../components/ModeCard/ModeCard';
import { modes } from '../data/modes';
import { AppContext } from '../context/AppContext';
import './Dashboard.css';

const Dashboard = () => {
  const { chats } = useContext(AppContext);
  
  const mockUser = {
    name: "Demo User",
    conversations: 18,
    favoriteMode: "Friend"
  };

  // Extract recent chats based on context data
  const recentModes = modes.filter(mode => chats[mode.id] && chats[mode.id].length > 0).slice(0, 3);
  
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        
        <div className="welcome-card">
          <div className="welcome-text">
            <h1>Welcome back, {mockUser.name}!</h1>
            <p>Ready for your next meaningful conversation?</p>
          </div>
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-value">{mockUser.conversations}</span>
              <span className="stat-label">Total Chats</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{mockUser.favoriteMode}</span>
              <span className="stat-label">Top Mode</span>
            </div>
          </div>
        </div>

        {recentModes.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Recent Chats</h2>
              <Link to="/chat" className="view-all">View All</Link>
            </div>
            <div className="recent-chats-grid">
              {recentModes.map(mode => {
                const IconComponent = Icons[mode.icon] || Icons.Smile;
                const lastMsg = chats[mode.id][chats[mode.id].length - 1];
                return (
                  <Link to={`/chat?mode=${mode.id}`} key={mode.id} className="recent-chat-card">
                    <div style={{ color: mode.color, backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                      <IconComponent size={24} />
                    </div>
                    <div className="recent-chat-info">
                      <div className="recent-chat-name">{mode.name}</div>
                      <div className="recent-chat-preview">{lastMsg?.text || 'No messages yet'}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section id="modes" className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Available Modes</h2>
          </div>
          <div className="feature-grid" style={{ padding: 0 }}>
            {modes.map(mode => (
              <ModeCard key={mode.id} mode={mode} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
