import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with custom config
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
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

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  register: async (userData) => {
    try {
      console.log('Attempting registration with:', userData);
      const response = await api.post('/api/auth/register', {
        email: userData.email,
        username: userData.username,
        name: userData.name,
        password: userData.password
      });
      const { access_token, user } = response.data;
      useAuthStore.getState().setToken(access_token);
      useAuthStore.getState().setUser(user);
      toast.success('ثبت‌نام با موفقیت انجام شد');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || 'خطا در ثبت‌نام');
      return false;
    }
  },
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { access_token, user } = response.data;
      useAuthStore.getState().setToken(access_token);
      useAuthStore.getState().setUser(user);
      toast.success('ورود با موفقیت انجام شد');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'خطا در ورود');
      return false;
    }
  },
  fetchUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      set({ user: response.data });
      return true;
    } catch (error) {
      console.error('Fetch user error:', error);
      return false;
    }
  },
}));

export default useAuthStore;