// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegistroScreen from '../screens/auth/RegistroScreen';

import AdminNavigator from './AdminNavigator';
import DoctorNavigator from './DoctorNavigator';
import PacienteNavigator from './PacienteNavigator';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

// Stack de autenticación (público)
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Registro" component={RegistroScreen} />
    </AuthStack.Navigator>
  );
}

// Stack de la app (privado)
function AppStackNavigator({ userRole }) {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      {userRole === 'admin' && (
        <AppStack.Screen name="AdminApp" component={AdminNavigator} />
      )}
      {userRole === 'doctor' && (
        <AppStack.Screen name="DoctorApp" component={DoctorNavigator} />
      )}
      {userRole === 'paciente' && (
        <AppStack.Screen name="PacienteApp" component={PacienteNavigator} />
      )}
    </AppStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading, isAuthenticated } = useAuth();

  // Pantalla de carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated && user ? (
        // Usuario autenticado - mostrar app según rol
        <AppStackNavigator userRole={user.rol} />
      ) : (
        // Usuario no autenticado - mostrar login
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});