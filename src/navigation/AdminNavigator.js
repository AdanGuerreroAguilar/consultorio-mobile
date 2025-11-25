import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

// Pantalla Dashboard
const DashboardScreen = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.welcomeText}>¡Hola Administrador!</Text>
          <Text style={styles.nameText}>{user?.nombre} {user?.apellido}</Text>
        </View>

        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Información del Usuario
          </Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {user?.email}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.success} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              Rol: {user?.rol}
            </Text>
          </View>

          {user?.especialidad && (
            <View style={styles.infoRow}>
              <Ionicons name="medical-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {user?.especialidad}
              </Text>
            </View>
          )}
        </View>

        {/* Mensaje temporal */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="construct-outline" size={48} color={theme.colors.warning} style={styles.icon} />
          <Text style={[styles.developmentTitle, { color: theme.colors.text }]}>
            Pantallas de Administrador
          </Text>
          <Text style={[styles.developmentText, { color: theme.colors.textSecondary }]}>
            Las pantallas de administración están en desarrollo.
          </Text>
          <Text style={[styles.developmentText, { color: theme.colors.textSecondary }]}>
            Por ahora, puedes cerrar sesión y registrarte como paciente para ver todas las funcionalidades.
          </Text>
        </View>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.danger }]}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Pantalla placeholder para otras tabs
const PlaceholderScreen = ({ title }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.placeholderContent}>
        <Ionicons name="construct-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={[styles.placeholderTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
          En desarrollo
        </Text>
      </View>
    </View>
  );
};

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
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Usuarios"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <PlaceholderScreen title="Usuarios" />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Pacientes"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medical-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <PlaceholderScreen title="Pacientes" />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Perfil"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <PlaceholderScreen title="Perfil" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  developmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  developmentText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginVertical: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    gap: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  placeholderText: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default AdminNavigator;