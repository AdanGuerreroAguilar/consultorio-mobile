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

const HomeDoctorScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalPacientes: 0,
    citasHoy: 0,
    citasPendientes: 0,
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
      const [pacientesRes, citasRes] = await Promise.all([
        apiClient.get('/pacientes'),
        apiClient.get('/citas'),
      ]);

      // Filtrar pacientes del doctor
      const misPacientes = pacientesRes.data.filter(
        p => p.doctor_id === user.id
      );

      // Filtrar citas del doctor
      const misCitas = citasRes.data.filter(
        c => c.doctor_id === user.id
      );

      // Citas de hoy
      const hoy = new Date().toDateString();
      const citasHoy = misCitas.filter(
        c => new Date(c.fecha_hora).toDateString() === hoy
      ).length;

      // Citas pendientes
      const citasPendientes = misCitas.filter(
        c => ['Programada', 'Confirmada'].includes(c.estado)
      ).length;

      setStats({
        totalPacientes: misPacientes.length,
        citasHoy,
        citasPendientes,
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
            <Text style={styles.welcomeText}>¡Hola Doctor!</Text>
            <Text style={styles.nameText}>
              {user?.nombre} {user?.apellido}
            </Text>
            {user?.especialidad && (
              <Text style={styles.especialidadText}>{user.especialidad}</Text>
            )}
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
            {stats.totalPacientes}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Pacientes
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="today" size={32} color={theme.colors.success} />
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>
            {stats.citasHoy}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Citas Hoy
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="time" size={32} color={theme.colors.warning} />
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>
            {stats.citasPendientes}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Pendientes
          </Text>
        </View>
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Acciones Rápidas
        </Text>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Pacientes', { screen: 'ListaPacientes' })}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
              Ver Pacientes
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
              Lista completa de pacientes
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Pacientes', { screen: 'CrearPaciente' })}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.success + '20' }]}>
            <Ionicons name="person-add-outline" size={24} color={theme.colors.success} />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
              Nuevo Paciente
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
              Registrar nuevo paciente
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Citas', { screen: 'CitasDoctor' })}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.info + '20' }]}>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.info} />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
              Mis Citas
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
              Gestionar citas médicas
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
  especialidadText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
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
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionButton: {
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
  actionContent: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default HomeDoctorScreen;