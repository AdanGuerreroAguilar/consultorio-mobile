import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IP de tu Mac en la red local
const API_URL = 'http://192.168.1.72:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Error con respuesta del servidor
      console.error('Error API:', error.response.data);
      
      // Si es 401, limpiar token y redirigir a login
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        // Aquí podrías disparar un evento para navegar al login
      }
    } else if (error.request) {
      // Error de red
      console.error('Error de red:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_URL };