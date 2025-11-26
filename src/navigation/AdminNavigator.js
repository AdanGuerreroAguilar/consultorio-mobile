import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Screens Admin
import GestionUsuariosScreen from '../screens/admin/GestionUsuariosScreen';
import GestionPacientesScreen from '../screens/admin/GestionPacientesScreen';
import GestionCitasScreen from '../screens/admin/GestionCitasScreen';
import EditarPerfilUsuarioScreen from '../screens/shared/EditarPerfilUsuarioScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function UsuariosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="UsuariosLista" component={GestionUsuariosScreen} options={{ title: "Usuarios" }} />
    </Stack.Navigator>
  );
}

function PacientesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PacientesLista" component={GestionPacientesScreen} options={{ title: "Pacientes" }} />
    </Stack.Navigator>
  );
}

function CitasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CitasLista" component={GestionCitasScreen} options={{ title: "Citas" }} />
    </Stack.Navigator>
  );
}

function PerfilStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PerfilAdmin" component={EditarPerfilUsuarioScreen} options={{ title: "Mi Perfil" }} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fdfdfd', borderTopWidth: 0 },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#999',
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Usuarios: 'people-outline',
            Pacientes: 'person-outline',
            Citas: 'calendar-outline',
            Perfil: 'settings-outline'
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Usuarios" component={UsuariosStack} />
      <Tab.Screen name="Pacientes" component={PacientesStack} />
      <Tab.Screen name="Citas" component={CitasStack} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  );
}
