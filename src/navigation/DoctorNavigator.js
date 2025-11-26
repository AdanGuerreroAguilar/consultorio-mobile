// navigation/DoctorNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Screens Doctor
import HomeDoctorScreen from '../screens/doctor/HomeDoctorScreen';
import CitasDoctorScreen from '../screens/doctor/CitasDoctorScreen';
import ListaPacientesScreen from '../screens/doctor/ListaPacientesScreen';
import FichaPacienteScreen from '../screens/doctor/FichaPacienteScreen';
import CrearNotaScreen from '../screens/doctor/CrearNotaScreen';
import RegistrarSignosScreen from '../screens/doctor/RegistrarSignosScreen';
import CrearCitaScreen from '../screens/admin/CrearCitaScreen';
import PerfilScreen from '../screens/shared/PerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function InicioStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="HomeDoctor" 
        component={HomeDoctorScreen} 
        options={{ title: "Inicio" }} 
      />
    </Stack.Navigator>
  );
}

function CitasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="CitasDoctor" 
        component={CitasDoctorScreen} 
        options={{ title: "Mis Citas" }} 
      />
      <Stack.Screen 
        name="CrearCita" 
        component={CrearCitaScreen} 
        options={{ title: "Nueva Cita" }} 
      />
    </Stack.Navigator>
  );
}

function PacientesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
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
        name="CrearNota" 
        component={CrearNotaScreen} 
        options={{ title: "Nueva Nota" }} 
      />
      <Stack.Screen 
        name="RegistrarSignos" 
        component={RegistrarSignosScreen} 
        options={{ title: "Signos Vitales" }} 
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

export default function DoctorNavigator() {
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
            Pacientes: 'people-outline',
            Perfil: 'person-circle-outline'
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Inicio" component={InicioStack} />
      <Tab.Screen name="Citas" component={CitasStack} />
      <Tab.Screen name="Pacientes" component={PacientesStack} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  );
}