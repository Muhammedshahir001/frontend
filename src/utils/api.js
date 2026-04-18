import axios from 'axios';
import store from '../store';
import { logout } from '../store/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { auth: { userInfo } } = store.getState();
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      const isAdminPath = currentPath.startsWith('/admin');
      
      store.dispatch(logout());
      
      if (isAdminPath && currentPath !== '/admin-login') {
        window.location.href = '/admin-login';
      } else if (!isAdminPath && currentPath !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
