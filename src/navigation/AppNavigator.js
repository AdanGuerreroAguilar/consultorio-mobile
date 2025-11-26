import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegistroScreen from '../screens/auth/RegistroScreen';
import AdminNavigator from './AdminNavigator';
import DoctorNavigator from './DoctorNavigator';
import PacienteNavigator from './PacienteNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading, isAuthenticated } = useAuth();

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        // Usuario NO autenticado - mostrar pantallas de auth
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistroScreen} />
        </Stack.Navigator>
      ) : (
        // Usuario autenticado - mostrar navegador según rol
        <>
          {user?.rol === 'admin' && <AdminNavigator />}
          {user?.rol === 'doctor' && <DoctorNavigator />}
          {user?.rol === 'paciente' && <PacienteNavigator />}
        </>
      )}
    </NavigationContainer>
  );
}