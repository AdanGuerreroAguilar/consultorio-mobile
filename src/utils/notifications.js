import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configuración de cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function pedirPermisosNotificaciones() {
  if (!Device.isDevice) return false;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Programar notificación
export async function programarNotificacion(title, body, fecha) {
  return await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true, priority: "high" },
    trigger: fecha, // Fecha exacta
  });
}

// Cancelar todas
export async function cancelarTodas() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
