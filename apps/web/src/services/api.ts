import axios from 'axios';

// Instance for MS-Auth (authentication)
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_URL || 'http://localhost:3000',
});

// Instance for MS-Admin (requires JWT)
export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_ADMIN_URL || 'http://localhost:3009',
});

// Interceptor to inject token in calls to adminApi
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: response interceptor for auto-refresh (can be expanded)
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If it expires, we could try to refresh here
      console.warn("Token expirado o inválido");
    }
    return Promise.reject(error);
  }
);
