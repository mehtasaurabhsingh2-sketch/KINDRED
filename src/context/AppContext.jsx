import React, { createContext, useState, useEffect } from 'react';
import { mockChats, getMockAutoReply } from '../data/mockChats';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentMode, setCurrentMode] = useState(null);
  const [chats, setChats] = useState(mockChats);
  const [theme, setTheme] = useState('dark');

  // Load chats from local storage or use mockChats on initial render if desired, 
  // but for MVP we will just keep them in memory.
  
  const sendMessage = (modeId, text) => {
    const newMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setChats(prev => {
      const modeChats = prev[modeId] ? [...prev[modeId]] : [];
      return {
        ...prev,
        [modeId]: [...modeChats, newMessage]
      };
    });

    // Simulate AI typing delay and reply
    setTimeout(() => {
      const aiReply = {
        sender: 'ai',
        text: getMockAutoReply(modeId),
        timestamp: new Date().toISOString()
      };
      
      setChats(prev => {
        const currentChats = prev[modeId] || [];
        return {
          ...prev,
          [modeId]: [...currentChats, aiReply]
        };
      });
    }, 1500); // 1.5 second delay for realism
  };

  const clearChat = (modeId) => {
    setChats(prev => ({
      ...prev,
      [modeId]: []
    }));
  };

  const getChatHistory = (modeId) => {
    return chats[modeId] || [];
  };

  const value = {
    currentMode,
    setCurrentMode,
    chats,
    sendMessage,
    getChatHistory,
    clearChat,
    theme,
    setTheme
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
