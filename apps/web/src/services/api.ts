import axios from 'axios';

// Instancia para MS-Auth (autenticación)
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_URL || 'http://localhost:3000',
});

// Instancia para MS-Admin (requiere JWT)
export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_ADMIN_URL || 'http://localhost:3009',
});

// Interceptor para inyectar token en las llamadas al adminApi
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Opcional: interceptor de respuesta para auto-refresh (se puede expandir)
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si expira, podríamos intentar refrescar aquí
      console.warn("Token expirado o inválido");
    }
    return Promise.reject(error);
  }
);
