// navigation/AdminNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Screens Admin
import DashboardAdminScreen from '/Users/teresaolvera/Desktop/ETC/consultorio-mobile/src/screens/admin/DashboardAdminScreen.js';
import GestionUsuariosScreen from '/Users/teresaolvera/Desktop/ETC/consultorio-mobile/src/screens/admin/GestionUsuariosScreen.js';
import CrearUsuarioScreen from '/Users/teresaolvera/Desktop/ETC/consultorio-mobile/src/screens/admin/CrearUsuarioScreen.js';
import GestionPacientesScreen from '../screens/admin/GestionPacientesScreen.js';
import CrearPacienteScreen from '/Users/teresaolvera/Desktop/ETC/consultorio-mobile/src/screens/doctor/CrearPacienteScreen.js';
import EditarPacienteScreen from '../screens/admin/EditarPacienteScreen';
import GestionCitasScreen from '../screens/admin/GestionCitasScreen';
import CrearCitaScreen from '/Users/teresaolvera/Desktop/ETC/consultorio-mobile/src/screens/paciente/CrearCitaScreen.js';
import PerfilScreen from '../screens/shared/PerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="DashboardAdmin" 
        component={DashboardAdminScreen} 
        options={{ title: "Dashboard" }} 
      />
    </Stack.Navigator>
  );
}

function UsuariosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="UsuariosLista" 
        component={GestionUsuariosScreen} 
        options={{ title: "Usuarios" }} 
      />
      <Stack.Screen 
        name="CrearUsuario" 
        component={CrearUsuarioScreen} 
        options={{ title: "Nuevo Usuario" }} 
      />
    </Stack.Navigator>
  );
}

function PacientesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="PacientesLista" 
        component={GestionPacientesScreen} 
        options={{ title: "Pacientes" }} 
      />
      <Stack.Screen 
        name="CrearPaciente" 
        component={CrearPacienteScreen} 
        options={{ title: "Nuevo Paciente" }} 
      />
      <Stack.Screen 
        name="EditarPaciente" 
        component={EditarPacienteScreen} 
        options={{ title: "Editar Paciente" }} 
      />
    </Stack.Navigator>
  );
}

function CitasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="CitasLista" 
        component={GestionCitasScreen} 
        options={{ title: "Citas" }} 
      />
      <Stack.Screen 
        name="CrearCita" 
        component={CrearCitaScreen} 
        options={{ title: "Nueva Cita" }} 
      />
    </Stack.Navigator>
  );
}

function PerfilStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="MiPerfil" 
        component={PerfilScreen} 
        options={{ title: "Mi Perfil" }} 
      />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: 'grid-outline',
            Usuarios: 'people-outline',
            Pacientes: 'person-outline',
            Citas: 'calendar-outline',
            Perfil: 'settings-outline'
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Usuarios" component={UsuariosStack} />
      <Tab.Screen name="Pacientes" component={PacientesStack} />
      <Tab.Screen name="Citas" component={CitasStack} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  );
}