import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-mind-mentor-clg-3.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests (except auth endpoints)
api.interceptors.request.use(
  (config) => {
    // Don't send token for auth endpoints
    if (!config.url.includes('/auth/')) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Chat APIs
export const chatAPI = {
  sendCareerMessage: (message, sessionId) => 
    api.post('/chat/career', { message, sessionId }),
  sendEmotionalMessage: (message, sessionId) => 
    api.post('/chat/emotional', { message, sessionId }),
};

// Mood APIs
export const moodAPI = {
  logMood: (data) => api.post('/mood', data),
  getMoodHistory: () => api.get('/mood/history'),
  analyzeBurnout: () => api.get('/mood/analyze'),
  getMoodStats: () => api.get('/mood/stats'),
};

// Career APIs
export const careerAPI = {
  generateRoadmap: (data) => api.post('/career/roadmap', data),
  getRoadmap: () => api.get('/career/roadmap'),
  updateProfile: (data) => api.put('/career/profile', data),
  getProfile: () => api.get('/career/profile'),
};

export default api;
