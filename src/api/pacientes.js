import client from "./client";

export const pacientesAPI = {
  // Obtener todos los pacientes
  getPacientes: async (search = null) => {
    const params = search ? `?search=${search}` : "";
    const response = await client.get(`/api/pacientes${params}`);
    return response.data;
  },

  // Obtener un paciente por ID
  getPaciente: async (id) => {
    const response = await client.get(`/api/pacientes/${id}`);
    return response.data;
  },

  // Obtener historial médico
  getHistorial: async (id) => {
    const response = await client.get(`/api/pacientes/${id}/historial`);
    return response.data;
  },

  // Crear paciente
  crearPaciente: async (datos) => {
    const response = await client.post("/api/pacientes", datos);
    return response.data;
  },

  // Actualizar paciente
  actualizarPaciente: async (id, datos) => {
    const response = await client.put(`/api/pacientes/${id}`, datos);
    return response.data;
  },

  // Eliminar paciente
  eliminarPaciente: async (id) => {
    const response = await client.delete(`/api/pacientes/${id}`);
    return response.data;
  },
};

export default pacientesAPI;