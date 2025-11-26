// src/api/auth.js
import apiClient from './apiClient';

export const authAPI = {
  registerPaciente: async (datos) => {
    const res = await apiClient.post('/auth/register-paciente', datos);
    return res.data;
  },

  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  me: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  verificarEmail: async (token) => {
    const res = await apiClient.get(`/auth/verificar-email?token=${token}`);
    return res.data;
  },
};
