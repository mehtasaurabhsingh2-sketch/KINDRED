import React, { createContext } from 'react';

// AppContext is now mostly a structural shell since 
// AuthContext handles user state and Firestore handles data state.
// We keep it to avoid breaking any imports that might still rely on it for generic app state in the future.
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const value = {};

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
