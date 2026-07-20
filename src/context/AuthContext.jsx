import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { loginUser, registerUser, loginWithGoogle, logoutUser } from '../services/auth';
import { getUserProfile } from '../services/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        let { profile } = await getUserProfile(user.uid);
        if (!profile) {
          // If auth exists but Firestore doc doesn't (e.g. after emulator restart), create it
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: user.displayName || 'User',
            email: user.email,
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            favoriteMode: 'friend',
            themeId: 'aurora'
          });
          profile = (await getUserProfile(user.uid)).profile;
        }
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userProfile,
    setUserProfile,
    loading,
    login: loginUser,
    register: registerUser,
    googleLogin: loginWithGoogle,
    logout: logoutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
