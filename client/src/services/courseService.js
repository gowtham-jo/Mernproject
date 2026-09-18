import api from './api';

export const courseService = {
  getCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  toggleCourseStatus: async (id, status) => {
    const response = await api.put(`/courses/${id}/status`, { status });
    return response.data;
  },

  getMyTeacherCourses: async () => {
    const response = await api.get('/courses/teacher/my-courses');
    return response.data;
  },

  // Modules & Lessons
  getModules: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/modules`);
    return response.data;
  },

  createModule: async (courseId, moduleData) => {
    const response = await api.post(`/courses/${courseId}/modules`, moduleData);
    return response.data;
  },

  updateModule: async (moduleId, moduleData) => {
    const response = await api.put(`/modules/${moduleId}`, moduleData);
    return response.data;
  },

  deleteModule: async (moduleId) => {
    const response = await api.delete(`/modules/${moduleId}`);
    return response.data;
  },

  createLesson: async (moduleId, lessonData) => {
    const response = await api.post(`/modules/${moduleId}/lessons`, lessonData);
    return response.data;
  },

  updateLesson: async (lessonId, lessonData) => {
    const response = await api.put(`/lessons/${lessonId}`, lessonData);
    return response.data;
  },

  deleteLesson: async (lessonId) => {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default courseService;
