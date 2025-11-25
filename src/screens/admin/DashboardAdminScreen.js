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
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const DashboardAdminScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalDoctores: 0,
    totalCitas: 0,
    citasHoy: 0,
    citasPendientes: 0,
    citasCompletadas: 0,
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const [pacientes, usuarios, citas] = await Promise.all([
        apiClient.get('/pacientes'),
        apiClient.get('/usuarios'),
        apiClient.get('/citas'),
      ]);

      const doctores = usuarios.data.filter(u => u.especialidad);
      const hoy = new Date().toISOString().split('T')[0];
      const citasHoy = citas.data.filter(c => c.fecha_hora.startsWith(hoy));
      const citasPendientes = citas.data.filter(c => c.estado === 'Programada' || c.estado === 'Confirmada');
      const citasCompletadas = citas.data.filter(c => c.estado === 'Completada');

      setStats({
        totalPacientes: pacientes.data.length,
        totalDoctores: doctores.length,
        totalCitas: citas.data.length,
        citasHoy: citasHoy.length,
        citasPendientes: citasPendientes.length,
        citasCompletadas: citasCompletadas.length,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, iconColor, title, value, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
    </TouchableOpacity>
  );

  const MenuButton = ({ icon, iconColor, title, subtitle, onPress }) => (
    <TouchableOpacity
      style={[styles.menuButton, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: theme.colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={cargarEstadisticas} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.welcomeText}>Panel de Administración</Text>
        <Text style={styles.nameText}>{user?.nombre} {user?.apellido}</Text>
      </View>

      {/* Estadísticas Principales */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Estadísticas Generales
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="people"
            iconColor={theme.colors.primary}
            title="Pacientes"
            value={stats.totalPacientes}
            onPress={() => navigation.navigate('GestionPacientes')}
          />
          <StatCard
            icon="medical"
            iconColor={theme.colors.success}
            title="Doctores"
            value={stats.totalDoctores}
            onPress={() => navigation.navigate('GestionUsuarios')}
          />
          <StatCard
            icon="calendar"
            iconColor={theme.colors.warning}
            title="Citas Totales"
            value={stats.totalCitas}
            onPress={() => navigation.navigate('GestionCitas')}
          />
          <StatCard
            icon="today"
            iconColor={theme.colors.info}
            title="Citas Hoy"
            value={stats.citasHoy}
          />
        </View>
      </View>

      {/* Estado de Citas */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Estado de Citas
        </Text>
        <View style={styles.citasStatusContainer}>
          <View style={[styles.statusCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.statusHeader}>
              <Ionicons name="time" size={24} color={theme.colors.warning} />
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                {stats.citasPendientes}
              </Text>
            </View>
            <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
              Pendientes
            </Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.statusHeader}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                {stats.citasCompletadas}
              </Text>
            </View>
            <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
              Completadas
            </Text>
          </View>
        </View>
      </View>

      {/* Menú de Gestión */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Gestión
        </Text>

        <MenuButton
          icon="people"
          iconColor={theme.colors.primary}
          title="Gestión de Usuarios"
          subtitle="Doctores, staff y administradores"
          onPress={() => navigation.navigate('GestionUsuarios')}
        />

        <MenuButton
          icon="person-add"
          iconColor={theme.colors.success}
          title="Crear Usuario"
          subtitle="Agregar nuevo doctor o administrador"
          onPress={() => navigation.navigate('CrearUsuario')}
        />

        <MenuButton
          icon="people-circle"
          iconColor={theme.colors.info}
          title="Gestión de Pacientes"
          subtitle="Ver y administrar pacientes"
          onPress={() => navigation.navigate('GestionPacientes')}
        />

        <MenuButton
          icon="calendar"
          iconColor={theme.colors.warning}
          title="Gestión de Citas"
          subtitle="Todas las citas del consultorio"
          onPress={() => navigation.navigate('GestionCitas')}
        />

        <MenuButton
          icon="stats-chart"
          iconColor={theme.colors.danger}
          title="Reportes"
          subtitle="Estadísticas y reportes"
          onPress={() => navigation.navigate('Reportes')}
        />
      </View>

      {/* Configuración */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Configuración
        </Text>

        <MenuButton
          icon="settings"
          iconColor={theme.colors.textSecondary}
          title="Configuración General"
          subtitle="Ajustes del sistema"
          onPress={() => navigation.navigate('Configuracion')}
        />

        <MenuButton
          icon="person"
          iconColor={theme.colors.primary}
          title="Mi Perfil"
          subtitle="Información personal"
          onPress={() => navigation.navigate('Perfil')}
        />
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsSection: {
    padding: 20,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  citasStatusContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statusCard: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statusLabel: {
    fontSize: 14,
  },
  menuButton: {
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
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
  },
});

export default DashboardAdminScreen;
