import api from './api';

export const enrollmentService = {
  enrollInCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  getMyCourses: async () => {
    const response = await api.get('/enrollments/my-courses');
    return response.data;
  },

  getCourseProgress: async (courseId) => {
    const response = await api.get(`/progress/course/${courseId}`);
    return response.data;
  },

  toggleLessonComplete: async (courseId, lessonId, isCompleted) => {
    const response = await api.post('/progress/toggle-lesson', {
      courseId,
      lessonId,
      isCompleted,
    });
    return response.data;
  },

  updateLastAccessed: async (courseId, lessonId) => {
    const response = await api.post('/progress/last-accessed', {
      courseId,
      lessonId,
    });
    return response.data;
  },

  getAllEnrollments: async (params = {}) => {
    const response = await api.get('/enrollments', { params });
    return response.data;
  },

  getTeacherStudents: async () => {
    const response = await api.get('/enrollments/teacher/students');
    return response.data;
  },
};

export default enrollmentService;
