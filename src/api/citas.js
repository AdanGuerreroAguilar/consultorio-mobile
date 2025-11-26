import apiClient from './client';
import { programarNotificacion } from '../utils/notifications';

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

    try {
      const fechaCita = new Date(datos.fecha_hora);

      // RECORDATORIO 24 HORAS ANTES
      const recordatorio1 = new Date(fechaCita.getTime() - 24 * 60 * 60 * 1000);

      await programarNotificacion(
        "Recordatorio de cita",
        "Tienes una cita mañana.",
        recordatorio1
      );

      // RECORDATORIO 30 MINUTOS ANTES
      const recordatorio2 = new Date(fechaCita.getTime() - 30 * 60 * 1000);

      await programarNotificacion(
        "Tu cita está por comenzar",
        "Tu cita inicia en 30 minutos.",
        recordatorio2
      );

      // OPCIONAL: NOTIFICACIÓN INSTANTÁNEA DE PRUEBA (5 segundos)
      await programarNotificacion(
        "Cita creada",
        "Tu cita se registró correctamente.",
        new Date(Date.now() + 5000)
      );

    } catch (error) {
      console.log("Error al programar notificaciones:", error);
    }

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
