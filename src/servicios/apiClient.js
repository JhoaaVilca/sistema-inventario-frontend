import axios from 'axios';

// Lee la base URL desde variables de entorno de Vite
// En desarrollo, define VITE_API_BASE_URL en .env.development
// Ejemplo: VITE_API_BASE_URL=http://localhost:8080/api
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL,
  // Si tu backend usa cookies/sesiones, habilita esto:
  // withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adjuntar token JWT si existe
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
// Manejo global de 401 para limpiar sesión si es necesario
apiClient.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      try { localStorage.setItem('sessionExpired', '1'); } catch (_) {}
      if (typeof window !== 'undefined' && window.location) {
        // Redirigir al login inmediatamente
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
