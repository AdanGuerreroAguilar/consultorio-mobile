import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const DashboardAdminScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalDoctores: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const response = await apiClient.get('/usuarios');
      
      const usuarios = response.data;
      const doctores = usuarios.filter(u => u.especialidad);
      
      setStats({
        totalUsuarios: usuarios.length,
        totalDoctores: doctores.length,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarEstadisticas();
    setRefreshing(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Cargando...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>¡Hola Administrador!</Text>
            <Text style={styles.nameText}>
              {user?.nombre} {user?.apellido}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="people" size={32} color={theme.colors.primary} />
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>
            {stats.totalUsuarios}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total Usuarios
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="medical" size={32} color={theme.colors.success} />
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>
            {stats.totalDoctores}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Doctores
          </Text>
        </View>
      </View>

      {/* Menú de opciones */}
      <View style={styles.menuContainer}>
        <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
          Gestión del Sistema
        </Text>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('GestionUsuarios')}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>
              Gestión de Usuarios
            </Text>
            <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>
              Administrar doctores y personal
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('CrearUsuario')}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.success + '20' }]}>
            <Ionicons name="person-add-outline" size={24} color={theme.colors.success} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>
              Crear Usuario
            </Text>
            <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>
              Registrar nuevo usuario o paciente
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('GestionPacientes')}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.info + '20' }]}>
            <Ionicons name="fitness-outline" size={24} color={theme.colors.info} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>
              Gestión de Pacientes
            </Text>
            <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>
              Ver y administrar pacientes
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('GestionCitas')}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.warning + '20' }]}>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.warning} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>
              Gestión de Citas
            </Text>
            <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>
              Administrar todas las citas
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    padding: 30,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  menuContainer: {
    padding: 15,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 15,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default DashboardAdminScreen;