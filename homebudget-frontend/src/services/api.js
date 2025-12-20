import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5021/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Só redireciona se não estivermos já na página de login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Categories Service
export const categoriesService = {
  getAll: () => api.get('/categories'),
  getDefault: () => axios.get(`${API_BASE_URL}/categories/default`), // Sem token de autenticação
  getById: (id) => api.get(`/categories/${id}`),
  create: (category) => api.post('/categories', category),
  update: (id, category) => api.put(`/categories/${id}`, category),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Transactions Service
export const transactionsService = {
  getAll: (params = {}) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (transaction) => api.post('/transactions', transaction),
  update: (id, transaction) => api.put(`/transactions/${id}`, transaction),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: (params = {}) => api.get('/transactions/summary', { params }),
  getMonthlyReport: (year, month) => api.get(`/transactions/monthly-report/${year}/${month}`),
};

// Budgets Service
export const budgetsService = {
  getAll: (params = {}) => api.get('/budgets', { params }),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (budget) => api.post('/budgets', budget),
  update: (id, budget) => api.put(`/budgets/${id}`, budget),
  delete: (id) => api.delete(`/budgets/${id}`),
  getAlerts: () => api.get('/budgets/alerts'),
};

// Piggybanks Service
export const piggybanksService = {
  getAll: () => api.get('/piggybanks'),
  getSummary: () => api.get('/piggybanks/summary'),
  getById: (id) => api.get(`/piggybanks/${id}`),
  create: (piggybank) => api.post('/piggybanks', piggybank),
  update: (id, piggybank) => api.put(`/piggybanks/${id}`, piggybank),
  delete: (id) => api.delete(`/piggybanks/${id}`),
  createTransaction: (id, transaction) => api.post(`/piggybanks/${id}/transactions`, transaction),
  getTransactions: (id) => api.get(`/piggybanks/${id}/transactions`),
  transfer: (transferData) => api.post('/piggybanks/transfer', transferData),
  calculateMonthlyBalance: () => api.post('/piggybanks/calculate-monthly-balance'),
};