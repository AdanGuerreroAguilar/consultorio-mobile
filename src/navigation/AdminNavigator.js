import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Importar pantallas de Admin
import DashboardAdminScreen from '../screens/admin/DashboardAdminScreen';
import GestionUsuariosScreen from '../screens/admin/GestionUsuariosScreen';
import CrearUsuarioScreen from '../screens/admin/CrearUsuarioScreen';
import GestionPacientesScreen from '../screens/admin/GestionPacientesScreen';
import GestionCitasScreen from '../screens/admin/GestionCitasScreen';
import EditarPerfilUsuarioScreen from '../screens/shared/EditarPerfilUsuarioScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack de Dashboard
const DashboardStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen 
        name="DashboardMain" 
        component={DashboardAdminScreen}
        options={{ title: 'Panel de Administración' }}
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
    </Stack.Navigator>
  );
};

// Stack de Perfil
const PerfilStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen 
        name="PerfilMain" 
        component={EditarPerfilUsuarioScreen}
        options={{ title: 'Mi Perfil' }}
      />
    </Stack.Navigator>
  );
};

// Tabs principales
const AdminNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Dashboard"
        component={DashboardStack}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Perfil"
        component={PerfilStack}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;