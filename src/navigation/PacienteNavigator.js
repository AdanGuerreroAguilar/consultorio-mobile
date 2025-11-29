import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

// SCREENS DEL PACIENTE
import DashboardPacienteScreen from "../screens/paciente/DashboardPacienteScreen";
import MisCitasScreen from "../screens/paciente/MisCitasScreen";
import DetalleCitaScreen from "../screens/paciente/DetalleCitaScreen";
import CrearCitaPacienteScreen from "../screens/paciente/CrearCitaPacienteScreen";
import MiHistorialScreen from "../screens/paciente/MiHistorialScreen";
import MiPerfilScreen from "../screens/paciente/MiPerfilScreen";
import EditarPerfilScreen from "../screens/paciente/EditarPerfilScreen";
import AjustesScreen from "../screens/paciente/AjustesScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();



// STACK: INICIO (HOME)

function InicioStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardPaciente"
        component={DashboardPacienteScreen}
        options={{ title: "Inicio" }}
      />
    </Stack.Navigator>
  );
}

// STACK: CITAS

function CitasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MisCitas"
        component={MisCitasScreen}
        options={{ title: "Mis Citas" }}
      />

      <Stack.Screen
        name="DetalleCita"
        component={DetalleCitaScreen}
        options={{ title: "Detalle de Cita" }}
      />

      <Stack.Screen
        name="CrearCita"
        component={CrearCitaPacienteScreen}
        options={{ title: "Nueva Cita" }}
      />
    </Stack.Navigator>
  );
}

// STACK: HISTORIAL

function HistorialStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MiHistorial"
        component={MiHistorialScreen}
        options={{ title: "Mi Historial" }}
      />
    </Stack.Navigator>
  );
}

// STACK: PERFIL

function PerfilStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MiPerfil"
        component={MiPerfilScreen}
        options={{ title: "Mi Perfil" }}
      />

      <Stack.Screen
        name="EditarPerfil"
        component={EditarPerfilScreen}
        options={{ title: "Editar Perfil" }}
      />

      <Stack.Screen
        name="Ajustes"
        component={AjustesScreen}
        options={{ title: "Ajustes" }}
      />
    </Stack.Navigator>
  );
}

// BOTTOM TAB NAVIGATOR PRINCIPAL

export default function PacienteNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11 },

        tabBarIcon: ({ color }) => {
          const icons = {
            Inicio: "home-outline",
            Citas: "calendar-outline",
            Historial: "document-text-outline",
            Perfil: "person-circle-outline",
          };
          return <Ionicons name={icons[route.name]} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={InicioStack} />
      <Tab.Screen name="Citas" component={CitasStack} />
      <Tab.Screen name="Historial" component={HistorialStack} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  );
}
