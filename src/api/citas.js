import apiClient from './client';

export const citasAPI = {
  // Obtener todas las citas
  getCitas: async (fecha = null) => {
    const params = fecha ? `?fecha=${fecha}` : '';
    const response = await apiClient.get(`/citas${params}`);
    return response.data;
  },

  // Crear cita
  crearCita: async (datos) => {
    const response = await apiClient.post('/citas', datos);
    return response.data;
  },

  // Actualizar cita
  actualizarCita: async (id, datos) => {
    const response = await apiClient.put(`/citas/${id}`, datos);
    return response.data;
  },

  // Eliminar cita
  eliminarCita: async (id) => {
    const response = await apiClient.delete(`/citas/${id}`);
    return response.data;
  },
};