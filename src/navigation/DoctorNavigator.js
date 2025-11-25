import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Importar pantallas de Doctor
import HomeDoctorScreen from '../screens/doctor/HomeDoctorScreen';
import ListaPacientesScreen from '../screens/doctor/ListaPacientesScreen';
import CrearPacienteScreen from '../screens/doctor/CrearPacienteScreen';
import EditarPacienteScreen from '../screens/doctor/EditarPacienteScreen';
import FichaPacienteScreen from '../screens/doctor/FichaPacienteScreen';
import CrearNotaScreen from '../screens/doctor/CrearNotaScreen';
import RegistrarSignosScreen from '../screens/doctor/RegistrarSignosScreen';
import CitasDoctorScreen from '../screens/doctor/CitasDoctorScreen';
import EditarPerfilUsuarioScreen from '../screens/shared/EditarPerfilUsuarioScreen';

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
        component={HomeDoctorScreen}
        options={{ title: 'Inicio' }}
      />
    </Stack.Navigator>
  );
};

// Stack de Pacientes
const PacientesStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen 
        name="ListaPacientes" 
        component={ListaPacientesScreen}
        options={{ title: 'Mis Pacientes' }}
      />
      <Stack.Screen 
        name="CrearPaciente" 
        component={CrearPacienteScreen}
        options={{ title: 'Nuevo Paciente' }}
      />
      <Stack.Screen 
        name="EditarPaciente" 
        component={EditarPacienteScreen}
        options={{ title: 'Editar Paciente' }}
      />
      <Stack.Screen 
        name="FichaPaciente" 
        component={FichaPacienteScreen}
        options={{ title: 'Ficha del Paciente' }}
      />
      <Stack.Screen 
        name="CrearNota" 
        component={CrearNotaScreen}
        options={{ title: 'Nueva Nota Médica' }}
      />
      <Stack.Screen 
        name="RegistrarSignos" 
        component={RegistrarSignosScreen}
        options={{ title: 'Registrar Signos Vitales' }}
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
        name="CitasDoctor" 
        component={CitasDoctorScreen}
        options={{ title: 'Mis Citas' }}
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
const DoctorNavigator = () => {
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
        name="Home"
        component={HomeStack}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Pacientes"
        component={PacientesStack}
        options={{
          title: 'Pacientes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Citas"
        component={CitasStack}
        options={{
          title: 'Citas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
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

export default DoctorNavigator;
