import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy,
  updateDoc,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from './firebase';

// Helper to get user profile
export const getUserProfile = async (uid) => {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      return { profile: userSnap.data(), error: null };
    }
    return { profile: null, error: 'User profile not found' };
  } catch (error) {
    return { profile: null, error: error.message };
  }
};

// Helper to update user profile
export const updateUserProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, 'users', uid), data);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Helper to create a new conversation
export const createConversation = async (userId, modeId, title) => {
  try {
    const convoId = `${userId}_${modeId}_${Date.now()}`;
    const data = {
      id: convoId,
      userId,
      mode: modeId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'conversations', convoId), data);
    return { conversation: data, error: null };
  } catch (error) {
    return { conversation: null, error: error.message };
  }
};

// Helper to get user conversations
export const getUserConversations = async (userId) => {
  try {
    const q = query(
      collection(db, 'conversations'), 
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const convos = snapshot.docs.map(d => d.data());
    return { conversations: convos, error: null };
  } catch (error) {
    return { conversations: [], error: error.message };
  }
};

// Helper to get paginated user conversations
export const getPaginatedUserConversations = async (userId, lastVisibleDoc = null, limitCount = 10) => {
  try {
    let q;
    if (lastVisibleDoc) {
      q = query(
        collection(db, 'conversations'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        startAfter(lastVisibleDoc),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, 'conversations'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
    }
    const snapshot = await getDocs(q);
    const convos = snapshot.docs.map(d => d.data());
    
    // Return the last document for the next pagination query
    const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return { conversations: convos, lastVisible, error: null };
  } catch (error) {
    return { conversations: [], lastVisible: null, error: error.message };
  }
};

// Helper to save a message
export const saveMessage = async (conversationId, sender, text, mode) => {
  try {
    const msgId = `${conversationId}_${Date.now()}`;
    const data = {
      conversationId,
      sender,
      text,
      timestamp: new Date().toISOString(),
      mode
    };
    await setDoc(doc(db, 'messages', msgId), data);
    
    // Update conversation updatedAt
    await updateDoc(doc(db, 'conversations', conversationId), {
      updatedAt: data.timestamp
    });
    
    return { message: data, error: null };
  } catch (error) {
    return { message: null, error: error.message };
  }
};

// Helper to load messages for a conversation
export const getMessages = async (conversationId) => {
  try {
    const q = query(
      collection(db, 'messages'), 
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(d => d.data());
    return { messages, error: null };
  } catch (error) {
    return { messages: [], error: error.message };
  }
};

// ==========================================
// Phase 3: AI Architecture Placeholders
// ==========================================

export const saveConversationSummary = async (conversationId, summaryText) => {
  // TODO: Phase 3 - Store AI-generated summaries to save context window tokens
  return { summary: null, error: "Not implemented" };
};

export const getConversationSummary = async (conversationId) => {
  // TODO: Phase 3 - Retrieve summary for prompt injection
  return { summary: null, error: "Not implemented" };
};

export const saveUserMemory = async (userId, key, value) => {
  // TODO: Phase 3 - Store long-term facts about the user (e.g. "User has a dog named Max")
  return { memory: null, error: "Not implemented" };
};

export const getUserMemories = async (userId) => {
  // TODO: Phase 3 - Retrieve all long-term memories
  return { memories: [], error: "Not implemented" };
};

export const updateUserPreferences = async (userId, preferences) => {
  // TODO: Phase 3 - Store AI-specific preferences (e.g. verbosity, custom instructions)
  return { error: "Not implemented" };
};

