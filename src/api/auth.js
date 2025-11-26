// src/api/auth.js
import apiClient from './client';

export const authAPI = {
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  registro: async (datos) => {
    // Registrar como paciente (sin cuenta de usuario)
    const res = await apiClient.post('/pacientes', datos);
    return res.data;
  },
};