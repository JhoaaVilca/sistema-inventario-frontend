import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

apiClient.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const skipRedirectHeader = error?.config?.headers?.['X-Skip-Auth-Redirect'] === '1';
    const skipByUrl = typeof url === 'string' && url.includes('/productos/alertas/sin-stock');
    const skipRedirect = skipRedirectHeader || skipByUrl;

    // 401: sesión inválida → logout
    if (status === 401) {
      if (!skipRedirect && !isRedirecting) {
        isRedirecting = true;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sessionExpired', '1');
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('role');
        }
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    // 403: sin permiso → NO logout (D19)
    return Promise.reject(error);
  }
);

export default apiClient;
