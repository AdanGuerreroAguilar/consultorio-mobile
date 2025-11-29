import React from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegistroScreen from "../screens/auth/RegistroScreen";

// Navigators por rol
import AdminNavigator from "./AdminNavigator";
import DoctorNavigator from "./DoctorNavigator";
import PacienteNavigator from "./PacienteNavigator";

// Pantalla para subir imágenes médicas
import SubirImagenScreen from "../screens/doctor/SubirImagenScreen";

const Stack = createNativeStackNavigator();

//  PANTALLA DE CARGA

const LoadingScreen = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        Cargando...
      </Text>
    </View>
  );
};

//  NAVEGADOR PRINCIPAL

export default function AppNavigator() {
  const { user, isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {!isAuthenticated ? (

        //  LOGIN & REGISTRO

        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistroScreen} />
        </Stack.Navigator>
      ) : (

        // NAVEGACIÓN POR TIPO DE USUARIO
        <Stack.Navigator screenOptions={{ headerShown: false }}>

          {user?.rol === "admin" && (
            <Stack.Screen name="Admin" component={AdminNavigator} />
          )}

          {user?.rol === "doctor" && (
            <Stack.Screen name="Doctor" component={DoctorNavigator} />
          )}

          {user?.rol === "paciente" && (
            <Stack.Screen name="Paciente" component={PacienteNavigator} />
          )}

          <Stack.Screen
            name="SubirImagen"
            component={SubirImagenScreen}
            options={{ headerShown: true, title: "Subir Imagen Médica" }}
          />

        </Stack.Navigator>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
});
