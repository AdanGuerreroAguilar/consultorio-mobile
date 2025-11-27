// api/citas.js
import client from "./client";

export const citasAPI = {
  // Obtener todas las citas
  getCitas: async () => {
    const response = await client.get("/api/citas");
    return response.data;
  },

  // Obtener una cita por ID
  getCita: async (id) => {
    const response = await client.get(`/api/citas/${id}`);
    return response.data;
  },

  // Crear cita
  crearCita: async (datos) => {
    const response = await client.post("/api/citas", datos);
    return response.data;
  },

  // Actualizar cita
  actualizarCita: async (id, datos) => {
    const response = await client.put(`/api/citas/${id}`, datos);
    return response.data;
  },

  // Cancelar cita (cambiar estado)
  cancelarCita: async (id) => {
    const response = await client.put(`/api/citas/${id}`, { estado: "cancelada" });
    return response.data;
  },

  // Eliminar cita
  eliminarCita: async (id) => {
    const response = await client.delete(`/api/citas/${id}`);
    return response.data;
  },
};

export default citasAPI;