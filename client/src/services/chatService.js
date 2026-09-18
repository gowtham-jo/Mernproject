import api from './api';

export const chatService = {
  getConversations: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },

  getOrCreateConversation: async (participantId, courseId) => {
    const response = await api.post('/conversations', { participantId, courseId });
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await api.post('/messages', { conversationId, content });
    return response.data;
  },
};

export default chatService;
