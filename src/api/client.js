// src/api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ CAMBIA ESTA IP POR LA DE TU MAC
const API_URL = 'http://192.168.1.72:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`🔑 Token: ${token ? 'Presente (' + token.substring(0, 20) + '...)' : 'NO ENCONTRADO'}`);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`✅ Header Authorization agregado`);
      } else {
        console.warn(`⚠️ No se encontró token en AsyncStorage - Request sin autenticación`);
      }
    } catch (error) {
      console.error('❌ Error crítico al obtener token:', error);
      // Si hay un error al obtener el token, aún devolvemos la config
      // pero el request fallará en el backend con 401/403
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`❌ Error ${error.response.status}:`, error.response.data);
      
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }
    } else if (error.request) {
      console.error('❌ Error de red:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_URL };