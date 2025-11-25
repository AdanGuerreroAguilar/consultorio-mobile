import apiClient from './client';

export const usuariosAPI = {
  // Obtener todos los usuarios
  getUsuarios: async () => {
    const response = await apiClient.get('/usuarios');
    return response.data;
  },

  // Crear usuario (doctor o admin)
  crearUsuario: async (datos) => {
    const response = await apiClient.post('/usuarios', datos);
    return response.data;
  },

  // Eliminar usuario
  eliminarUsuario: async (id) => {
    const response = await apiClient.delete(`/usuarios/${id}`);
    return response.data;
  },

  // Actualizar perfil
  actualizarPerfil: async (datos) => {
    const response = await apiClient.put('/perfil', datos);
    return response.data;
  },
};