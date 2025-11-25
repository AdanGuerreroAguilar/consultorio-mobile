import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const HomeDoctorScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    citasHoy: 0,
    citasPendientes: 0,
    totalPacientes: 0,
  });
  const [loading, setLoading] = useState(false);
  const [proximasCitas, setProximasCitas] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Obtener citas del doctor
      const responseCitas = await apiClient.get('/citas');
      const misCitas = responseCitas.data.filter(
        cita => cita.doctor_id === user.id
      );

      // Citas de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const citasHoy = misCitas.filter(
        cita => cita.fecha_hora.startsWith(hoy)
      );

      // Citas pendientes
      const pendientes = misCitas.filter(
        cita => cita.estado === 'pendiente'
      );

      // Próximas 3 citas
      const proximas = misCitas
        .filter(cita => new Date(cita.fecha_hora) >= new Date())
        .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
        .slice(0, 3);

      // Obtener pacientes
      const responsePacientes = await apiClient.get('/pacientes');
      
      setStats({
        citasHoy: citasHoy.length,
        citasPendientes: pendientes.length,
        totalPacientes: responsePacientes.data.length,
      });

      setProximasCitas(proximas);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={cargarDatos} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.welcomeText}>¡Hola Doctor!</Text>
        <Text style={styles.nameText}>
          {user?.nombre} {user?.apellido}
        </Text>
        {user?.especialidad && (
          <Text style={styles.especialidadText}>{user.especialidad}</Text>
        )}
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>
            {stats.citasHoy}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Citas Hoy
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="time-outline" size={32} color={theme.colors.warning} />
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>
            {stats.citasPendientes}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Pendientes
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="people-outline" size={32} color={theme.colors.success} />
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>
            {stats.totalPacientes}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Pacientes
          </Text>
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Acciones Rápidas
        </Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('Pacientes')}
          >
            <Ionicons name="people" size={28} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Ver Pacientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('Citas')}
          >
            <Ionicons name="calendar" size={28} color={theme.colors.success} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Mis Citas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('Pacientes', { screen: 'CrearPaciente' })}
          >
            <Ionicons name="person-add" size={28} color={theme.colors.warning} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Nuevo Paciente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Ionicons name="settings" size={28} color={theme.colors.textSecondary} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Ajustes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Próximas citas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Próximas Citas
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Citas')}>
            <Text style={{ color: theme.colors.primary }}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {proximasCitas.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No tienes citas próximas
            </Text>
          </View>
        ) : (
          proximasCitas.map((cita) => (
            <TouchableOpacity
              key={cita.id}
              style={[styles.citaCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate('Citas', { 
                screen: 'DetalleCita', 
                params: { citaId: cita.id } 
              })}
            >
              <View style={styles.citaHeader}>
                <View style={[
                  styles.citaBadge,
                  { backgroundColor: theme.colors.primary + '20' }
                ]}>
                  <Text style={[styles.citaBadgeText, { color: theme.colors.primary }]}>
                    {cita.estado}
                  </Text>
                </View>
              </View>

              <Text style={[styles.citaPaciente, { color: theme.colors.text }]}>
                {cita.nombre} {cita.apellido}
              </Text>

              <View style={styles.citaInfo}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.citaInfoText, { color: theme.colors.textSecondary }]}>
                  {formatearFecha(cita.fecha_hora)}
                </Text>
              </View>

              <Text style={[styles.citaMotivo, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {cita.motivo}
              </Text>
            </TouchableOpacity>
          ))
        )}
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
  especialidadText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: -20,
  },
  statCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  emptyCard: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
  },
  citaCard: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  citaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  citaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  citaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  citaPaciente: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  citaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  citaInfoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  citaMotivo: {
    fontSize: 14,
    marginTop: 8,
  },
});

export default HomeDoctorScreen;