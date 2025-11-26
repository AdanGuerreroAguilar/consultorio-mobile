// screens/admin/DashboardAdminScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const DashboardAdminScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_usuarios: 0,
    total_doctores: 0,
    total_pacientes: 0,
    citas_hoy: 0,
    citas_pendientes: 0,
  });

  useFocusEffect(
    useCallback(() => {
      cargarStats();
    }, [])
  );

  const cargarStats = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
    </TouchableOpacity>
  );

  const QuickAction = ({ icon, title, color, onPress }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
    >
      <View style={[styles.quickIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickTitle, { color: theme.colors.text }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarStats} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
          ¡Bienvenido!
        </Text>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user?.nombre} {user?.apellido}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="people"
          title="Usuarios"
          value={stats.total_usuarios}
          color="#1E88E5"
          onPress={() => navigation.navigate('Usuarios')}
        />
        <StatCard
          icon="medical"
          title="Doctores"
          value={stats.total_doctores}
          color="#43A047"
        />
        <StatCard
          icon="person"
          title="Pacientes"
          value={stats.total_pacientes}
          color="#FB8C00"
          onPress={() => navigation.navigate('Pacientes')}
        />
        <StatCard
          icon="calendar"
          title="Citas Hoy"
          value={stats.citas_hoy}
          color="#E53935"
          onPress={() => navigation.navigate('Citas')}
        />
      </View>

      {/* Citas pendientes */}
      <View style={[styles.pendingCard, { backgroundColor: theme.colors.primary + '15' }]}>
        <View style={styles.pendingInfo}>
          <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
          <View style={styles.pendingText}>
            <Text style={[styles.pendingTitle, { color: theme.colors.text }]}>
              Citas Pendientes
            </Text>
            <Text style={[styles.pendingSubtitle, { color: theme.colors.textSecondary }]}>
              Próximas citas programadas
            </Text>
          </View>
        </View>
        <Text style={[styles.pendingValue, { color: theme.colors.primary }]}>
          {stats.citas_pendientes}
        </Text>
      </View>

      {/* Acciones rápidas */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Acciones Rápidas
      </Text>

      <View style={styles.quickActions}>
        <QuickAction
          icon="person-add"
          title="Nuevo Usuario"
          color="#1E88E5"
          onPress={() => navigation.navigate('Usuarios', { screen: 'CrearUsuario' })}
        />
        <QuickAction
          icon="person-add-outline"
          title="Nuevo Paciente"
          color="#43A047"
          onPress={() => navigation.navigate('Pacientes', { screen: 'CrearPaciente' })}
        />
        <QuickAction
          icon="calendar-outline"
          title="Nueva Cita"
          color="#FB8C00"
          onPress={() => navigation.navigate('Citas', { screen: 'CrearCita' })}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
  },
  pendingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 20,
    padding: 18,
    borderRadius: 15,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pendingText: {},
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  pendingSubtitle: {
    fontSize: 13,
  },
  pendingValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  quickActions: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 30,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  quickIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  quickTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DashboardAdminScreen;