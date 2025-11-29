import client, { setAuthToken } from './client';

const authAPI = {

  // LOGIN

  login: async (email, password) => {
    try {
      console.log(' [AUTH] Intentando login:', email);
      
      const response = await client.post('/api/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });

      console.log(' [AUTH] Login exitoso');
      console.log('    Usuario:', response.data.usuario?.nombre);
      console.log('    Rol:', response.data.usuario?.rol);

      // Guardar el token automáticamente
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
      }

      return response.data;
    } catch (error) {
      console.error(' [AUTH] Error en login:', error.response?.data || error.message);
      throw error;
    }
  },


  //  REGISTRO DE PACIENTE

  registroPaciente: async (datos) => {
    try {
      console.log(' [AUTH] Registrando paciente:', datos.email);
      
      const response = await client.post('/api/auth/registro-paciente', {
        email: datos.email.toLowerCase().trim(),
        password: datos.password,
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        telefono: datos.telefono || null,
        fecha_nacimiento: datos.fecha_nacimiento || null,
        genero: datos.genero || 'Otro',
        direccion: datos.direccion || null,
        alergias: datos.alergias || null,
        tipo_sangre: datos.tipo_sangre || null,
      });

      console.log(' [AUTH] Registro exitoso');
      return response.data;
    } catch (error) {
      console.error(' [AUTH] Error en registro:', error.response?.data || error.message);
      throw error;
    }
  },

  // OBTENER USUARIO ACTUAL

  me: async () => {
    try {
      console.log(' [AUTH] Obteniendo usuario actual...');
      const response = await client.get('/api/auth/me');
      console.log(' [AUTH] Usuario obtenido:', response.data?.nombre);
      return response.data;
    } catch (error) {
      console.error(' [AUTH] Error obteniendo usuario:', error.response?.data || error.message);
      throw error;
    }
  },


  logout: () => {
    setAuthToken(null);
    console.log(' [AUTH] Sesión cerrada');
  },
};

export default authAPI;