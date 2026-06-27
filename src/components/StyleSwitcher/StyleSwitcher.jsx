import React, { useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Settings, X, Check } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { themes } from '../../data/themes';
import './StyleSwitcher.css';

const StyleSwitcher = () => {
  const { theme, setTheme, isSwitcherOpen, toggleSwitcher, setIsSwitcherOpen } = useContext(ThemeContext);
  const switcherRef = useRef(null);
  const location = useLocation();

  // Hide on auth pages
  const hideOnPages = ['/login', '/register'];
  const shouldHide = hideOnPages.includes(location.pathname);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setIsSwitcherOpen(false);
      }
    };
    
    if (isSwitcherOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSwitcherOpen, setIsSwitcherOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsSwitcherOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setIsSwitcherOpen]);

  if (shouldHide) return null;

  return (
    <div 
      className={`style-switcher-container ${isSwitcherOpen ? 'open' : ''}`}
      ref={switcherRef}
    >
      {/* Toggler Button */}
      <button 
        className="style-switcher-toggler" 
        onClick={toggleSwitcher}
        aria-label="Toggle Theme Settings"
        aria-expanded={isSwitcherOpen}
      >
        <Settings className={isSwitcherOpen ? '' : 'spin-slow'} size={24} />
      </button>

      {/* Panel */}
      <div className="style-switcher-panel">
        <div className="switcher-header">
          <h3>Kindred Themes</h3>
          <button onClick={() => setIsSwitcherOpen(false)} aria-label="Close theme settings" className="close-btn">
            <X size={20} />
          </button>
        </div>
        
        <p className="switcher-subtitle">Personalize your experience.</p>
        
        <div className="theme-list" role="radiogroup" aria-label="Theme Selection">
          {themes.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                className={`theme-option ${isActive ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}
                aria-label={`${t.name} Theme`}
                aria-checked={isActive}
                role="radio"
              >
                <div 
                  className="theme-color-preview"
                  style={{ backgroundColor: t.primary }}
                >
                  {isActive && <Check size={16} color="white" />}
                </div>
                <span className="theme-name">{t.name}</span>
                {isActive && <span className="theme-current-badge">Current</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StyleSwitcher;
