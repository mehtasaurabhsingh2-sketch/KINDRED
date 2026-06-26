import React, { useState, useContext, useEffect } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { updateUserProfile } from '../services/firestore';
import { Loader2 } from 'lucide-react';
import { personalities } from '../data/personalities';
import './Settings.css';

const Settings = () => {
  const { currentUser, userProfile, setUserProfile } = useContext(AuthContext);
  
  const [displayName, setDisplayName] = useState('');
  const [favoriteMode, setFavoriteMode] = useState('friend');
  const [theme, setTheme] = useState('dark');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const modesList = Object.values(personalities);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setFavoriteMode(userProfile.favoriteMode || 'friend');
      setTheme(userProfile.theme || 'dark');
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    setMessage(null);

    const updates = {
      displayName,
      favoriteMode,
      theme,
    };

    const { error } = await updateUserProfile(currentUser.uid, updates);

    if (error) {
      setMessage({ type: 'error', text: error });
    } else {
      setUserProfile(prev => ({ ...prev, ...updates }));
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    }
    
    setIsSaving(false);
  };

  return (
    <div className="settings-layout">
      <Sidebar />
      <main className="settings-content">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your account and preferences.</p>
        </div>

        <div className="settings-card">
          <form className="settings-form" onSubmit={handleSave}>
            
            <div className="settings-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                value={currentUser?.email || ''} 
                disabled 
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="settings-group">
              <label htmlFor="displayName">Display Name</label>
              <input 
                type="text" 
                id="displayName" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="settings-group">
              <label htmlFor="favoriteMode">Favorite Companion Mode</label>
              <select 
                id="favoriteMode" 
                value={favoriteMode} 
                onChange={(e) => setFavoriteMode(e.target.value)}
              >
                {modesList.map(mode => (
                  <option key={mode.id} value={mode.id}>{mode.name}</option>
                ))}
              </select>
            </div>

            <div className="settings-group">
              <label htmlFor="theme">Theme Preference</label>
              <select 
                id="theme" 
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="settings-actions">
              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
            
            {message && (
              <div className={`settings-message ${message.type}`}>
                {message.text}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;
