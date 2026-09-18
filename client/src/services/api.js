import axios from 'axios';

// Smart base URL resolution for production (Render) vs local development
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If running in browser and on localhost / 127.0.0.1
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  // Production fallback (Render API backend)
  return 'https://mernproject-3ht6.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
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
