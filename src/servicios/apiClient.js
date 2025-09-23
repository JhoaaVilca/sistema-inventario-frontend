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

// Puedes agregar interceptores si necesitas manejar tokens/errores globales
// apiClient.interceptors.request.use((config) => {
//   // Agrega Authorization si corresponde
//   return config;
// });
// apiClient.interceptors.response.use(
//   (resp) => resp,
//   (error) => {
//     // Manejo global de errores
//     return Promise.reject(error);
//   }
// );

export default apiClient;
