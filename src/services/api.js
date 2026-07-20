const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || '';
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

/**
 * Initiates a streaming chat request via SSE.
 * Returns the raw Response — the caller reads the stream.
 *
 * @param {string} token - Firebase Auth JWT
 * @param {object} payload - { message, conversationId, mode }
 * @param {AbortSignal} signal - AbortController signal for cancellation
 * @returns {Promise<Response>}
 */
export const chatStreamApi = async (token, payload, signal) => {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || errorData?.message || 'Failed to start chat stream.');
  }

  return response;
};
