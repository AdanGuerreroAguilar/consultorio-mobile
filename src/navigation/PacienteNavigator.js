import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Placeholder screens (las crearemos después)
import HomePacienteScreen from '../screens/paciente/HomePacienteScreen';
import MisCitasScreen from '../screens/paciente/MisCitasScreen';
import MiHistorialScreen from '../screens/paciente/MiHistorialScreen';
import MiPerfilScreen from '../screens/paciente/MiPerfilScreen';
import AjustesScreen from '../screens/paciente/AjustesScreen';
import CrearCitaScreen from '../screens/paciente/CrearCitaScreen';
import DetalleCitaScreen from '../screens/paciente/DetalleCitaScreen';
import EditarPerfilScreen from '../screens/paciente/EditarPerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack de Inicio
const HomeStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomePacienteScreen}
        options={{ title: 'Inicio' }}
      />
    </Stack.Navigator>
  );
};

// Stack de Citas
const CitasStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen 
        name="CitasMain" 
        component={MisCitasScreen}
        options={{ title: 'Mis Citas' }}
      />
      <Stack.Screen 
        name="CrearCita" 
        component={CrearCitaScreen}
        options={{ title: 'Nueva Cita' }}
      />
      <Stack.Screen 
        name="DetalleCita" 
        component={DetalleCitaScreen}
        options={{ title: 'Detalle de Cita' }}
      />
    </Stack.Navigator>
  );
};

// Stack de Historial
const HistorialStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen 
        name="HistorialMain" 
        component={MiHistorialScreen}
        options={{ title: 'Mi Historial' }}
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
        component={MiPerfilScreen}
        options={{ title: 'Mi Perfil' }}
      />
      <Stack.Screen 
        name="EditarPerfil" 
        component={EditarPerfilScreen}
        options={{ title: 'Editar Perfil' }}
      />
      <Stack.Screen 
        name="Ajustes" 
        component={AjustesScreen}
        options={{ title: 'Ajustes' }}
      />
    </Stack.Navigator>
  );
};

// Tabs principales
const PacienteNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Citas') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Historial') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Citas" 
        component={CitasStack}
        options={{ title: 'Citas' }}
      />
      <Tab.Screen 
        name="Historial" 
        component={HistorialStack}
        options={{ title: 'Historial' }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilStack}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

export default PacienteNavigator;