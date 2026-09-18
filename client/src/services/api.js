import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('learnhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors & session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';

    if (status === 401) {
      // Clear token if expired/invalid
      if (localStorage.getItem('learnhub_token')) {
        localStorage.removeItem('learnhub_token');
        localStorage.removeItem('learnhub_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
