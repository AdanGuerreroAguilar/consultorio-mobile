import React from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
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

const Stack = createNativeStackNavigator();

// ========================================
// 🔄 PANTALLA DE CARGA
// ========================================
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

// ========================================
// 🧭 NAVEGADOR PRINCIPAL
// ========================================
export default function AppNavigator() {
  const { user, isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();

  // Mostrar pantalla de carga mientras verifica la sesión
  if (loading) {
    return <LoadingScreen />;
  }

  console.log("🧭 [AppNavigator] Estado actual:");
  console.log("   - isAuthenticated:", isAuthenticated);
  console.log("   - user:", user?.nombre, "(", user?.rol, ")");

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
        // ========================================
        // 🔐 NO AUTENTICADO - Mostrar Auth Stack
        // ========================================
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
        // ========================================
        // ✅ AUTENTICADO - Mostrar Navigator según rol
        // ========================================
        <>
          {user?.rol === "admin" && (
            <>
              {console.log("🔴 [AppNavigator] Cargando AdminNavigator")}
              <AdminNavigator />
            </>
          )}
          
          {user?.rol === "doctor" && (
            <>
              {console.log("🟢 [AppNavigator] Cargando DoctorNavigator")}
              <DoctorNavigator />
            </>
          )}
          
          {user?.rol === "paciente" && (
            <>
              {console.log("🔵 [AppNavigator] Cargando PacienteNavigator")}
              <PacienteNavigator />
            </>
          )}

          {/* Si el rol no es reconocido, mostrar error */}
          {!["admin", "doctor", "paciente"].includes(user?.rol) && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                Error: Rol de usuario no reconocido
              </Text>
              <Text style={[styles.errorSubtext, { color: theme.colors.textSecondary }]}>
                Rol actual: {user?.rol || "ninguno"}
              </Text>
            </View>
          )}
        </>
      )}
    </NavigationContainer>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});