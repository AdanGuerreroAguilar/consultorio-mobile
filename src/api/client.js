import axios from 'axios';

// ✅ IP ACTUALIZADA: 192.168.0.198
const API_BASE_URL = "http://192.168.0.198:8000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging
client.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => {
    console.log(`✅ Respuesta exitosa de ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ Error API:', {
        url: error.config.url,
        status: error.response.status,
        message: error.response.data.detail || error.response.data.message || 'Error desconocido',
      });
    } else if (error.request) {
      console.error('❌ Error de red:', error.message);
    }
    return Promise.reject(error);
  }
);

// Función para establecer el token de autenticación
export const setAuthToken = (token) => {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Token configurado');
  } else {
    delete client.defaults.headers.common['Authorization'];
    console.log('🔓 Token eliminado');
  }
};

export default client;