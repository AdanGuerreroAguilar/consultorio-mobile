import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// SCREENS DEL DOCTOR
import HomeDoctorScreen from "../screens/doctor/HomeDoctorScreen";
import ListaPacientesScreen from "../screens/doctor/ListaPacientesScreen";
import FichaPacienteScreen from "../screens/doctor/FichaPacienteScreen";
import EditarPacienteScreen from "../screens/doctor/EditarPacienteScreen";
import RegistrarSignosScreen from "../screens/doctor/RegistrarSignosScreen";
import CrearNotaScreen from "../screens/doctor/CrearNotaScreen";

// Subir imágenes médicas 
import SubirImagenScreen from "../screens/doctor/SubirImagenScreen";

// Perfil compartido
import PerfilScreen from "../screens/shared/PerfilScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


// HOME DEL DOCTOR

function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeDoctor"
        component={HomeDoctorScreen}
        options={{ title: "Inicio" }}
      />
    </Stack.Navigator>
  );
}

// PACIENTES DEL DOCTOR

function PacientesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ListaPacientes"
        component={ListaPacientesScreen}
        options={{ title: "Pacientes" }}
      />

      <Stack.Screen
        name="FichaPaciente"
        component={FichaPacienteScreen}
        options={{ title: "Ficha del Paciente" }}
      />

      <Stack.Screen
        name="EditarPaciente"
        component={EditarPacienteScreen}
        options={{ title: "Editar Paciente" }}
      />

      <Stack.Screen
        name="RegistrarSignos"
        component={RegistrarSignosScreen}
        options={{ title: "Registrar Signos Vitales" }}
      />

      <Stack.Screen
        name="CrearNota"
        component={CrearNotaScreen}
        options={{ title: "Crear Nota Médica" }}
      />

      <Stack.Screen
        name="SubirImagen"
        component={SubirImagenScreen}
        options={{ title: "Adjuntar Imagen" }}
      />
    </Stack.Navigator>
  );
}


// PERFIL DEL DOCTOR

function PerfilStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PerfilDoctor"
        component={PerfilScreen}
        options={{ title: "Mi Perfil" }}
      />
    </Stack.Navigator>
  );
}


// NAVEGADOR PRINCIPAL DEL DOCTOR

export default function DoctorNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,

        tabBarIcon: ({ color }) => {
          const icons = {
            Inicio: "home-outline",
            Pacientes: "people-outline",
            Perfil: "person-circle-outline",
          };

          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={DashboardStack} />
      <Tab.Screen name="Pacientes" component={PacientesStack} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  );
}
