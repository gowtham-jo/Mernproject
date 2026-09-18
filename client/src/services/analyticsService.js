import api from './api';

export const analyticsService = {
  getAdminAnalytics: async () => {
    const response = await api.get('/analytics/admin');
    return response.data;
  },

  getTeacherAnalytics: async () => {
    const response = await api.get('/analytics/teacher');
    return response.data;
  },

  getStudentAnalytics: async () => {
    const response = await api.get('/analytics/student');
    return response.data;
  },
};

export default analyticsService;
