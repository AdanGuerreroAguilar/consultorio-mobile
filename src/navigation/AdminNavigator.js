// navigation/AdminNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// ADMIN SCREENS
import DashboardAdminScreen from '../screens/admin/DashboardAdminScreen';
import GestionUsuariosScreen from '../screens/admin/GestionUsuariosScreen';
import CrearUsuarioScreen from '../screens/admin/CrearUsuarioScreen';
import EditarUsuarioScreen from '../screens/admin/EditarUsuarioScreen'; 
import GestionPacientesScreen from '../screens/admin/GestionPacientesScreen';
import EditarPacienteScreen from '../screens/admin/EditarPacienteScreen'; 
import GestionCitasScreen from '../screens/admin/GestionCitasScreen';

// DOCTOR / PACIENTE SCREENS USADAS POR ADMIN
import CrearPacienteScreen from '../screens/admin/CrearPacienteScreen';
import CrearCitaScreen from '../screens/admin/CrearCitaScreen';

// PERFIL
import PerfilScreen from '../screens/shared/PerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ----------------------------
// DASHBOARD
// ----------------------------
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

// ----------------------------
// USUARIOS
// ----------------------------
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
      <Stack.Screen 
        name="EditarUsuario" 
        component={EditarUsuarioScreen} 
        options={{ title: "Editar Usuario" }} 
      />
    </Stack.Navigator>
  );
}

// ----------------------------
// PACIENTES
// ----------------------------
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

// ----------------------------
// CITAS
// ----------------------------
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

// ----------------------------
// PERFIL / CERRAR SESIÓN
// ----------------------------
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

// ----------------------------
// NAVEGADOR PRINCIPAL ADMIN
// ----------------------------
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
        tabBarIcon: ({ color }) => {
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