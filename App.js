import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

import { pedirPermisosNotificaciones } from './src/utils/notifications';

console.log('🚀 App iniciando...');

export default function App() {

  useEffect(() => {
    const initNotificaciones = async () => {
      const permiso = await pedirPermisosNotificaciones();
      console.log("🔔 Permiso notificaciones:", permiso);
    };

    initNotificaciones();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
