import axios from 'axios';
import store from '../store';
import { logout, adminLogout } from '../store/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Set global axios default baseURL as well to support files that import axios directly
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { auth: { userInfo, adminInfo } } = store.getState();
    const isAdminPath = window.location.pathname.startsWith('/admin');
    
    // Prioritize admin token for admin paths
    if (isAdminPath && adminInfo?.token) {
      config.headers.Authorization = `Bearer ${adminInfo.token}`;
    } else if (userInfo?.token) {
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
      
      if (isAdminPath) {
        store.dispatch(adminLogout());
        if (currentPath !== '/admin-login') {
          window.location.href = '/admin-login';
        }
      } else {
        store.dispatch(logout());
        if (currentPath !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
