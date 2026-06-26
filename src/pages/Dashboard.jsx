import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';
import ModeCard from '../components/ModeCard/ModeCard';
import { personalities } from '../data/personalities';
import { AuthContext } from '../context/AuthContext';
import { getUserConversations, getMessages, createConversation } from '../services/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const { userProfile, currentUser } = useContext(AuthContext);
  const [recentChats, setRecentChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const modesList = Object.values(personalities);

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser) return;
      const { conversations, error } = await getUserConversations(currentUser.uid);
      if (!error && conversations) {
        // Fetch the last message for the top 3 recent conversations
        const chatsWithMessages = await Promise.all(
          conversations.slice(0, 3).map(async (convo) => {
            const { messages } = await getMessages(convo.id);
            const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1] : null;
            return { ...convo, lastMsg };
          })
        );
        setRecentChats(chatsWithMessages);
      }
      setLoadingChats(false);
    };

    fetchChats();
  }, [currentUser]);

  if (!userProfile) return <LoadingSpinner fullScreen />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        
        <div className="welcome-card">
          <div className="welcome-text">
            <h1>Welcome back, {userProfile.displayName}!</h1>
            <p>Ready for your next meaningful conversation?</p>
          </div>
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-value">{recentChats.length}</span>
              <span className="stat-label">Recent Chats</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{textTransform: 'capitalize'}}>{userProfile.favoriteMode}</span>
              <span className="stat-label">Top Mode</span>
            </div>
          </div>
        </div>

        {loadingChats ? (
          <div style={{ padding: '2rem 0' }}><LoadingSpinner /></div>
        ) : recentChats.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Recent Chats</h2>
              <Link to="/chat" className="view-all">View All</Link>
            </div>
            <div className="recent-chats-grid">
              {recentChats.map(convo => {
                const modeDef = personalities[convo.mode] || personalities.friend;
                const IconComponent = Icons[modeDef.icon] || Icons.Smile;
                
                return (
                  <Link to={`/chat?mode=${convo.mode}&cid=${convo.id}`} key={convo.id} className="recent-chat-card">
                    <div style={{ color: modeDef.color, backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                      <IconComponent size={24} />
                    </div>
                    <div className="recent-chat-info">
                      <div className="recent-chat-name">{convo.title}</div>
                      <div className="recent-chat-preview">{convo.lastMsg?.text || 'No messages yet'}</div>
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
            {modesList.map(mode => (
              <ModeCard key={mode.id} mode={mode} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
