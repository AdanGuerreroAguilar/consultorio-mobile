import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

// Placeholder temporal mejorado
const PlaceholderScreen = ({ title }) => {
  const { theme } = useTheme();
  const { logout, user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Ionicons name="construct-outline" size={80} color={theme.colors.primary} />
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Pantalla en desarrollo
      </Text>
      
      {/* Info del usuario */}
      <View style={[styles.userInfo, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.userText, { color: theme.colors.text }]}>
          👤 {user?.nombre} {user?.apellido}
        </Text>
        <Text style={[styles.userText, { color: theme.colors.textSecondary }]}>
          📧 {user?.email}
        </Text>
        <Text style={[styles.userText, { color: theme.colors.primary }]}>
          🔑 Rol: {user?.rol}
        </Text>
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.colors.danger }]}
        onPress={logout}
      >
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const AdminNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tab.Screen 
        name="Dashboard"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <PlaceholderScreen title="Dashboard Admin" />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Usuarios"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <PlaceholderScreen title="Gestión de Usuarios" />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Pacientes"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medical-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <PlaceholderScreen title="Gestión de Pacientes" />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Perfil"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <PlaceholderScreen title="Mi Perfil" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  userInfo: {
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
    width: '90%',
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    marginVertical: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 10,
    marginTop: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminNavigator;