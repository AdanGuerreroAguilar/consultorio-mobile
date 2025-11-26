import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomePacienteScreen from '../screens/paciente/HomePacienteScreen';
import MisCitasScreen from '../screens/paciente/MisCitasScreen';
import MiHistorialScreen from '../screens/paciente/MiHistorialScreen';
import EditarPerfilUsuarioScreen from '../screens/shared/EditarPerfilUsuarioScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function InicioStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="InicioPaciente" component={HomePacienteScreen} options={{ title: "Inicio" }} />
    </Stack.Navigator>
  );
}

function CitasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MisCitas" component={MisCitasScreen} options={{ title: "Mis Citas" }} />
    </Stack.Navigator>
  );
}

function HistorialStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MiHistorial" component={MiHistorialScreen} options={{ title: "Historial Médico" }} />
    </Stack.Navigator>
  );
}

function PerfilStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PerfilPaciente" component={EditarPerfilUsuarioScreen} options={{ title: "Mi Perfil" }} />
    </Stack.Navigator>
  );
}

export default function PacienteNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
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
