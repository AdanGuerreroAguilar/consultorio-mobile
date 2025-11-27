import client, { setAuthToken } from './client';

const authAPI = {
  // Login
  login: async (email, password) => {
    try {
      console.log('🔐 Intentando login:', { email });
      
      const response = await client.post('/auth/login', {
        email,
        password,
      });

      console.log('✅ Login exitoso:', response.data);

      // Guardar el token automáticamente
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error en login:', error.response?.data || error.message);
      throw error;
    }
  },

  // Registro de paciente
  registroPaciente: async (datos) => {
    try {
      console.log('📝 Registrando paciente:', datos);
      
      const response = await client.post('/auth/registro-paciente', datos);

      console.log('✅ Registro exitoso:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ Error en registro:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obtener información del usuario actual
  me: async () => {
    try {
      const response = await client.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default authAPI;