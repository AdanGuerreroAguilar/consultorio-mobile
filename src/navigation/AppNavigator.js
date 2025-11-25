import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ROLES } from '../constants/roles';

import LoginScreen from '../screens/auth/LoginScreen';
import RegistroScreen from '../screens/auth/RegistroScreen';

import PacienteNavigator from './PacienteNavigator';
import DoctorNavigator from './DoctorNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
      {!isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistroScreen} />
        </Stack.Navigator>
      ) : (
        <>
          {user?.rol === ROLES.PACIENTE && <PacienteNavigator />}
          {user?.rol === ROLES.DOCTOR && <DoctorNavigator />}
          {user?.rol === ROLES.ADMINISTRADOR && <AdminNavigator />}
        </>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;