import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegistroScreen from '../screens/auth/RegistroScreen';

import PacienteNavigator from './PacienteNavigator';
import DoctorNavigator from './DoctorNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  // Función para determinar el rol del usuario
  const getUserRole = () => {
    if (!user) return null;
    
    console.log('🔍 Usuario completo:', JSON.stringify(user, null, 2));
    
    const rol = user.rol?.toLowerCase();
    
    // Si tiene especialidad, es doctor
    if (user.especialidad) {
      console.log('✅ Detectado como DOCTOR (tiene especialidad)');
      return 'doctor';
    }
    
    // Si el email contiene 'admin', es admin
    if (user.email?.toLowerCase().includes('admin')) {
      console.log('✅ Detectado como ADMIN (email contiene admin)');
      return 'admin';
    }
    
    // Verificar el rol explícito
    if (rol === 'administrador' || rol === 'admin') {
      console.log('✅ Detectado como ADMIN (rol explícito)');
      return 'admin';
    }
    
    if (rol === 'doctor') {
      console.log('✅ Detectado como DOCTOR (rol explícito)');
      return 'doctor';
    }
    
    // Por defecto es paciente
    console.log('✅ Detectado como PACIENTE (por defecto)');
    return 'paciente';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 10 }}>Cargando...</Text>
      </View>
    );
  }

  const userRole = getUserRole();

  console.log('🔍 isAuthenticated:', isAuthenticated);
  console.log('🔍 Rol final detectado:', userRole);

  return (
    <NavigationContainer
      theme={{
        dark: theme.dark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
      }}
    >
      {!isAuthenticated || !user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistroScreen} />
        </Stack.Navigator>
      ) : (
        <>
          {userRole === 'paciente' && (
            <>
              {console.log('📱 Renderizando PacienteNavigator')}
              <PacienteNavigator />
            </>
          )}
          {userRole === 'doctor' && (
            <>
              {console.log('📱 Renderizando DoctorNavigator')}
              <DoctorNavigator />
            </>
          )}
          {userRole === 'admin' && (
            <>
              {console.log('📱 Renderizando AdminNavigator')}
              <AdminNavigator />
            </>
          )}
          
          {/* Fallback si no se detecta el rol */}
          {!userRole && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
              <Text style={{ color: theme.colors.danger, fontSize: 18, fontWeight: 'bold' }}>
                ⚠️ Error de navegación
              </Text>
              <Text style={{ color: theme.colors.text, marginTop: 20, textAlign: 'center', paddingHorizontal: 20 }}>
                No se pudo determinar el tipo de usuario
              </Text>
              <Text style={{ color: theme.colors.textSecondary, marginTop: 10 }}>
                Rol recibido: {user?.rol || 'Sin rol'}
              </Text>
              <Text style={{ color: theme.colors.textSecondary }}>
                Email: {user?.email || 'Sin email'}
              </Text>
            </View>
          )}
        </>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;