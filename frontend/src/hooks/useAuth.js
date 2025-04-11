import { create } from 'zustand';
import axios from '../config/axios';
import { toast } from 'react-toastify';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token'),
  setUser: (user) => {
    const userData = {
      ...user,
      isAdmin: user.role === 'admin' || user.is_admin === true
    };
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
    toast.info('با موفقیت خارج شدید', {
      icon: '👋'
    });
  },
  register: async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token: access_token, user });
      toast.success('ثبت‌نام با موفقیت انجام شد');
      return { success: true, user, token: access_token };
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || 'خطا در ثبت‌نام');
      return { success: false, error };
    }
  },
  login: async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });
      
      const { access_token, user } = response.data;
      const userData = {
        ...user,
        isAdmin: user.role === 'admin' || user.is_admin === true
      };
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      set({ token: access_token, user: userData });
      
      toast.success('خوش آمدید 👋');
      return { success: true, user: userData, token: access_token };
    } catch (error) {
      toast.error('نام کاربری یا رمز عبور اشتباه است');
      throw error;
    }
  },
  fetchUser: async () => {
    try {
      const response = await axios.get('/api/auth/me');
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
      return true;
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      return false;
    }
  },
}));

export default useAuthStore;