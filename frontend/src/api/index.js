import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://quickpoll-api-l9db.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  getProfile: () => api.get('/auth/me'),
};

// Polls API
export const pollsAPI = {
  getAll: () => api.get('/polls/'),
  getById: (id) => api.get(`/polls/${id}`),
  create: (pollData) => api.post('/polls/', pollData),
  delete: (id) => api.delete(`/polls/${id}`),
};

// Votes API
export const votesAPI = {
  vote: (pollId, optionId) => api.post('/votes/', { poll_id: pollId, option_id: optionId }),
  getResults: (pollId) => api.get(`/votes/results/${pollId}`),
};

// Likes API
export const likesAPI = {
  like: (pollId) => api.post('/likes/', { poll_id: pollId }),
  unlike: (pollId) => api.delete(`/likes/${pollId}`),
};

export default api;