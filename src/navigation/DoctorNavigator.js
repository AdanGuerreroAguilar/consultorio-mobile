import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import CitasDoctorScreen from '../screens/doctor/CitasDoctorScreen';
import ListaPacientesScreen from '../screens/doctor/ListaPacientesScreen';
import CrearNotaScreen from '../screens/doctor/CrearNotaScreen';
import RegistrarSignosScreen from '../screens/doctor/RegistrarSignosScreen';
import FichaPacienteScreen from '../screens/doctor/FichaPacienteScreen';
import EditarPerfilUsuarioScreen from '../screens/shared/EditarPerfilUsuarioScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CitasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CitasDoctor" component={CitasDoctorScreen} options={{ title: "Mis Citas" }} />
    </Stack.Navigator>
  );
}

function PacientesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ListaPacientes" component={ListaPacientesScreen} options={{ title: "Pacientes" }} />
      <Stack.Screen name="FichaPaciente" component={FichaPacienteScreen} options={{ title: "Ficha del Paciente" }} />
      <Stack.Screen name="CrearNota" component={CrearNotaScreen} options={{ title: "Nueva Nota" }} />
      <Stack.Screen name="RegistrarSignos" component={RegistrarSignosScreen} options={{ title: "Registrar Signos" }} />
    </Stack.Navigator>
  );
}

function PerfilStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PerfilDoctor" component={EditarPerfilUsuarioScreen} options={{ title: "Mi Perfil" }} />
    </Stack.Navigator>
  );
}

export default function DoctorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarIcon: ({ color }) => {
          const icons = {
            Citas: 'calendar-outline',
            Pacientes: 'people-outline',
            Perfil: 'person-circle-outline'
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Citas" component={CitasStack} />
      <Tab.Screen name="Pacientes" component={PacientesStack} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  );
}
