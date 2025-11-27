// api/usuarios.js
import client from "./client";

export const usuariosAPI = {
  // Obtener todos los usuarios
  getUsuarios: async (rol = null) => {
    const params = rol ? `?rol=${rol}` : "";
    const response = await client.get(`/api/usuarios${params}`);
    return response.data;
  },

  // Obtener un usuario por ID
  getUsuario: async (id) => {
    const response = await client.get(`/api/usuarios/${id}`);
    return response.data;
  },

  // Crear usuario
  crearUsuario: async (datos) => {
    const response = await client.post("/api/usuarios", datos);
    return response.data;
  },

  // Actualizar usuario
  actualizarUsuario: async (id, datos) => {
    const response = await client.put(`/api/usuarios/${id}`, datos);
    return response.data;
  },

  // Eliminar usuario
  eliminarUsuario: async (id) => {
    const response = await client.delete(`/api/usuarios/${id}`);
    return response.data;
  },

  // Actualizar perfil propio
  actualizarPerfil: async (datos) => {
    const response = await client.put("/api/perfil", datos);
    return response.data;
  },

  // Obtener doctores
  getDoctores: async () => {
    const response = await client.get("/api/doctores");
    return response.data;
  },
};

export default usuariosAPI;