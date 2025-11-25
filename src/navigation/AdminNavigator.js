import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Pantallas Admin
import DashboardAdminScreen from '../screens/admin/DashboardAdminScreen';
import GestionUsuariosScreen from '../screens/admin/GestionUsuariosScreen';
import CrearUsuarioScreen from '../screens/admin/CrearUsuarioScreen';
import GestionPacientesScreen from '../screens/admin/GestionPacientesScreen';
import GestionCitasScreen from '../screens/admin/GestionCitasScreen';
import EditarPerfilUsuarioScreen from '../screens/edit/EditarPerfilUsuarioScreen';
import EditarPacienteScreen from '../screens/edit/EditarPacienteScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="DashboardAdmin"
        component={DashboardAdminScreen}
        options={{ title: 'Panel de Control' }}
      />
      <Stack.Screen
        name="GestionUsuarios"
        component={GestionUsuariosScreen}
        options={{ title: 'Gestión de Usuarios' }}
      />
      <Stack.Screen
        name="CrearUsuario"
        component={CrearUsuarioScreen}
        options={{ title: 'Crear Usuario' }}
      />
      <Stack.Screen
        name="GestionPacientes"
        component={GestionPacientesScreen}
        options={{ title: 'Gestión de Pacientes' }}
      />
      <Stack.Screen
        name="GestionCitas"
        component={GestionCitasScreen}
        options={{ title: 'Gestión de Citas' }}
      />
      <Stack.Screen
        name="EditarPaciente"
        component={EditarPacienteScreen}
        options={{ title: 'Editar Paciente' }}
      />
    </Stack.Navigator>
  );
}

function PerfilStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Perfil"
        component={EditarPerfilUsuarioScreen}
        options={{ title: 'Mi Perfil' }}
      />
    </Stack.Navigator>
  );
}

const AdminNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={PerfilStack}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;