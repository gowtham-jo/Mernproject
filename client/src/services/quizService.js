import api from './api';

export const quizService = {
  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },

  getQuizById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  updateQuiz: async (id, quizData) => {
    const response = await api.put(`/quizzes/${id}`, quizData);
    return response.data;
  },

  deleteQuiz: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },

  submitQuiz: async (id, answers) => {
    const response = await api.post(`/quizzes/${id}/submit`, { answers });
    return response.data;
  },

  getResults: async (params = {}) => {
    const response = await api.get('/results', { params });
    return response.data;
  },

  getResultById: async (id) => {
    const response = await api.get(`/results/${id}`);
    return response.data;
  },

  getTeacherQuizzes: async () => {
    const response = await api.get('/quizzes/teacher/all');
    return response.data;
  },
};

export default quizService;
