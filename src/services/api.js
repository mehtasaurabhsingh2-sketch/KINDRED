const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

/**
 * Initializes a new conversation via the backend API.
 * The backend handles creating the Firestore document and the initial AI greeting.
 * 
 * @param {string} token - The Firebase Auth JWT token
 * @param {string} modeId - The selected personality mode (e.g. 'friend')
 * @param {string} title - Optional title for the conversation
 * @returns {Promise<{ conversationId: string }>}
 */
export const createConversationApi = async (token, modeId, title) => {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ mode: modeId, title })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to create conversation via API.');
  }

  const data = await response.json();
  return data.data; // { conversationId }
};
