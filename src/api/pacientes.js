import apiClient from './client';

export const pacientesAPI = {
  getPacientes: async (search = null) => {
    const params = search ? `?search=${search}` : '';
    const response = await apiClient.get(`/pacientes${params}`);
    return response.data;
  },

  getPaciente: async (id) => {
    const response = await apiClient.get(`/pacientes/${id}`);
    return response.data;
  },

  getHistorial: async (id) => {
    const response = await apiClient.get(`/pacientes/${id}/historial`);
    return response.data;
  },

  crearPaciente: async (datos) => {
    const response = await apiClient.post('/pacientes', datos);
    return response.data;
  },

  actualizarPaciente: async (id, datos) => {
    const response = await apiClient.put(`/pacientes/${id}`, datos);
    return response.data;
  },

  eliminarPaciente: async (id) => {
    const response = await apiClient.delete(`/pacientes/${id}`);
    return response.data;
  },
};