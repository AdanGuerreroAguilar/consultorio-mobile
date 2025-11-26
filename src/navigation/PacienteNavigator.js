// navigation/PacienteNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Screens Paciente
import HomePacienteScreen from '../screens/paciente/HomePacienteScreen';
import MisCitasScreen from '../screens/paciente/MisCitasScreen';
import MiHistorialScreen from '../screens/paciente/MiHistorialScreen';
import PerfilScreen from '../screens/shared/PerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function InicioStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="InicioPaciente" 
        component={HomePacienteScreen} 
        options={{ title: "Inicio" }} 
      />
    </Stack.Navigator>
  );
}

function CitasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="MisCitas" 
        component={MisCitasScreen} 
        options={{ title: "Mis Citas" }} 
      />
    </Stack.Navigator>
  );
}

function HistorialStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="MiHistorial" 
        component={MiHistorialScreen} 
        options={{ title: "Mi Historial" }} 
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

export default function PacienteNavigator() {
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
            Inicio: 'home-outline',
            Citas: 'calendar-outline',
            Historial: 'folder-open-outline',
            Perfil: 'person-circle-outline'
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Inicio" component={InicioStack} />
      <Tab.Screen name="Citas" component={CitasStack} />
      <Tab.Screen name="Historial" component={HistorialStack} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  );
}