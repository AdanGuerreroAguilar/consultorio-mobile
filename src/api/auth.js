import apiClient from './client';

export const authAPI = {
  registro: async (datos) => {
    const response = await apiClient.post('/auth/registro', datos);
    return response.data;
  },

  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  verificarEmail: async (token) => {
    const response = await apiClient.get(`/auth/verificar-email?token=${token}`);
    return response.data;
  },
};