import axios from 'axios';
import store from '../store';
import { logout, adminLogout } from '../store/authSlice';

// Use the Render backend URL as the primary production fallback
let BACKEND_URL = import.meta.env.VITE_API_URL || 'https://backend-x1u8.onrender.com';

// Normalize URL to remove trailing slash if present
if (BACKEND_URL.endsWith('/')) {
  BACKEND_URL = BACKEND_URL.slice(0, -1);
}

const api = axios.create({
  baseURL: BACKEND_URL,
});

// Set global axios default baseURL as well to support files that import axios directly
axios.defaults.baseURL = BACKEND_URL;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { auth: { userInfo, adminInfo } } = store.getState();
    const isAdminPath = window.location.pathname.startsWith('/admin');
    
    // Prioritize admin token for admin paths
    if (isAdminPath && adminInfo?.token) {
      config.headers.Authorization = `Bearer ${adminInfo.token}`;
      console.log('Using Admin Token for path:', window.location.pathname);
    } else if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
      console.log('Using User Token for path:', window.location.pathname);
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
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
