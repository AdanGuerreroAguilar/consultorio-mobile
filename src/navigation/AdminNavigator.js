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
    
    const rol = user.rol?.toLowerCase();
    
    // Si tiene especialidad, es doctor
    if (user.especialidad) {
      return 'doctor';
    }
    
    // Si el email contiene 'admin', es admin
    if (user.email?.toLowerCase().includes('admin')) {
      return 'admin';
    }
    
    // Verificar el rol explícito
    if (rol === 'administrador' || rol === 'admin') {
      return 'admin';
    }
    
    if (rol === 'doctor') {
      return 'doctor';
    }
    
    // Por defecto es paciente
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

  // Debug - Agregar esto temporalmente para ver qué está pasando
  console.log('🔍 Usuario:', user);
  console.log('🔍 Rol detectado:', userRole);
  console.log('🔍 Autenticado:', isAuthenticated);

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
          {userRole === 'paciente' && <PacienteNavigator />}
          {userRole === 'doctor' && <DoctorNavigator />}
          {userRole === 'admin' && <AdminNavigator />}
          
          {/* Fallback si no se detecta el rol */}
          {!userRole && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
              <Text style={{ color: theme.colors.danger, fontSize: 16 }}>
                Error: No se pudo determinar el rol del usuario
              </Text>
              <Text style={{ color: theme.colors.textSecondary, marginTop: 10 }}>
                Rol recibido: {user?.rol}
              </Text>
            </View>
          )}
        </>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;