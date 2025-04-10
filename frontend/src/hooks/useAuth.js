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
        password: userData.password
      });
      const { access_token, user } = response.data;
      useAuthStore.getState().setToken(access_token);
      useAuthStore.getState().setUser(user);
      toast.success('ثبت‌نام با موفقیت انجام شد');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
      console.log('Error headers:', error.response?.headers);
      
      if (error.response?.data?.detail) {
        // Handle array of error messages
        if (Array.isArray(error.response.data.detail)) {
          error.response.data.detail.forEach(message => {
            toast.error(`خطای اعتبارسنجی: ${message}`);
          });
        } else {
          toast.error(`خطای سرور: ${error.response.data.detail}`);
        }
      } else if (error.response?.data?.errors) {
        // Show validation errors
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          messages.forEach(message => toast.error(`${field}: ${message}`));
        });
      } else if (error.response?.data) {
        // If the error response has data but not in the expected format
        toast.error(`خطای اعتبارسنجی: ${JSON.stringify(error.response.data)}`);
      } else {
        toast.error('خطا در ثبت‌نام: لطفاً ورودی‌های خود را بررسی کنید');
      }
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