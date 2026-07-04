const { db } = require('../config/firebaseAdmin');

/**
 * Persists a message to Firestore.
 */
const saveMessage = async (conversationId, role, text, mode, metadata = null) => {
  if (!db) {
    console.warn('Firebase Admin is not connected. Skipping saveMessage.');
    return null;
  }

  const messagesRef = db.collection('messages');
  const newMessage = {
    conversationId,
    role, // 'user' or 'assistant'
    text,
    mode,
    timestamp: new Date().toISOString(),
    ...(metadata && { metadata })
  };

  const docRef = await messagesRef.add(newMessage);
  return { id: docRef.id, ...newMessage };
};

/**
 * Retrieves the recent message history for a conversation to send to the AI.
 */
const getRecentMessages = async (conversationId, limit = 15) => {
  if (!db) return [];

  try {
    const messagesRef = db.collection('messages');
    const snapshot = await messagesRef
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'asc')
      .get();
      
    const allMessages = snapshot.docs.map(doc => doc.data());
    
    // We only need the last `limit` messages for context
    const recentMessages = allMessages.slice(-limit).map(msg => ({
      role: msg.role,
      content: msg.text
    }));
    
    return recentMessages;
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    return [];
  }
};

module.exports = {
  saveMessage,
  getRecentMessages
};
