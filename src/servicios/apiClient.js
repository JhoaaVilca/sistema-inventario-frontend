import axios from 'axios';

// Lee la base URL desde variables de entorno de Vite
// En desarrollo, define VITE_API_BASE_URL en .env.development
// Ejemplo: VITE_API_BASE_URL=http://localhost:8080/api
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL,
  // Si tu backend usa cookies/sesiones, habilita esto:
  withCredentials: true,
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
// Bandera para evitar múltiples redirecciones simultáneas
let isRedirecting = false;

// Manejo global de 401 para limpiar sesión si es necesario
apiClient.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const skipRedirectHeader = error?.config?.headers?.['X-Skip-Auth-Redirect'] === '1';
    const skipByUrl = typeof url === 'string' && url.includes('/productos/alertas/sin-stock');
    const skipRedirect = skipRedirectHeader || skipByUrl;
    
    if (status === 401 || status === 403) {
      if (!skipRedirect && !isRedirecting) {
        // Marcar que ya estamos redirigiendo para evitar múltiples redirecciones
        isRedirecting = true;
        
        // Limpiar datos de sesión
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sessionExpired', '1');
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('role');
        }
        
        // Redirigir inmediatamente sin alert bloqueante
        if (typeof window !== 'undefined') {
          // Redirigir de forma inmediata sin esperar confirmación del usuario
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
