import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

const mapAuthError = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in.';
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/weak-password':
      return 'The password is too weak. It must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      displayName,
      email,
      photoURL: user.photoURL || '',
      createdAt: new Date().toISOString(),
      favoriteMode: 'friend',
      theme: 'dark'
    });
    
    return { user, error: null };
  } catch (error) {
    console.error("Registration error:", error);
    return { user: null, error: mapAuthError(error) };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("Login error:", error);
    return { user: null, error: mapAuthError(error) };
  }
};

export const loginWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    
    // Check if user exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || 'User',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        favoriteMode: 'friend',
        theme: 'dark'
      });
    }
    
    return { user, error: null };
  } catch (error) {
    console.error("Google login error:", error);
    return { user: null, error: mapAuthError(error) };
  }
};

export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: mapAuthError(error) };
  }
};
