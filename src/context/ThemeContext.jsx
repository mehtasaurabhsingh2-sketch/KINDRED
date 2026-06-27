import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { getUserTheme, updateUserTheme } from '../services/firestore';
import { applyTheme, saveThemeLocally, getThemeLocally } from '../utils/themeManager';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getThemeLocally());
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);

  // Load theme on mount or when user changes
  useEffect(() => {
    const initializeTheme = async () => {
      let activeTheme = getThemeLocally();
      
      if (currentUser) {
        // If logged in, prioritize Firestore
        const { themeId } = await getUserTheme(currentUser.uid);
        if (themeId) {
          activeTheme = themeId;
          saveThemeLocally(themeId);
        }
      }
      
      setThemeState(activeTheme);
      applyTheme(activeTheme);
    };

    initializeTheme();
  }, [currentUser]);

  const setTheme = async (themeId) => {
    // 1. Update React state
    setThemeState(themeId);
    
    // 2. Apply CSS variables globally
    applyTheme(themeId);
    
    // 3. Save to localStorage (fallback/cache)
    saveThemeLocally(themeId);
    
    // 4. Save to Firestore if logged in
    if (currentUser) {
      await updateUserTheme(currentUser.uid, themeId);
    }
  };

  const toggleSwitcher = () => {
    setIsSwitcherOpen(!isSwitcherOpen);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isSwitcherOpen, toggleSwitcher, setIsSwitcherOpen }}>
      {children}
    </ThemeContext.Provider>
  );
};
