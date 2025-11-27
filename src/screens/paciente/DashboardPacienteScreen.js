// screens/paciente/DashboardPacienteScreen.js
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

const DashboardPacienteScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [proximaCita, setProximaCita] = useState(null);
  const [totalCitas, setTotalCitas] = useState(0);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/citas');
      const citas = response.data;
      
      // Filtrar citas del paciente actual (si aplica)
      const ahora = new Date();
      const citasFuturas = citas
        .filter(c => new Date(c.fecha_hora) > ahora && c.estado === 'programada')
        .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
      
      setProximaCita(citasFuturas[0] || null);
      setTotalCitas(citas.length);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarDatos} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
          ¡Hola!
        </Text>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user?.nombre} {user?.apellido}
        </Text>
      </View>

      {/* Próxima Cita */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={24} color={theme.colors.primary} />
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Próxima Cita
          </Text>
        </View>

        {proximaCita ? (
          <View style={styles.citaInfo}>
            <Text style={[styles.citaFecha, { color: theme.colors.primary }]}>
              {formatFecha(proximaCita.fecha_hora)}
            </Text>
            <Text style={[styles.citaMotivo, { color: theme.colors.textSecondary }]}>
              {proximaCita.motivo}
            </Text>
            {proximaCita.doctor_nombre && (
              <View style={styles.doctorRow}>
                <Ionicons name="medical-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.doctorText, { color: theme.colors.textSecondary }]}>
                  Dr. {proximaCita.doctor_nombre} {proximaCita.doctor_apellido}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={[styles.noCita, { color: theme.colors.textSecondary }]}>
            No tienes citas programadas
          </Text>
        )}
      </View>

      {/* Acciones rápidas */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Acciones Rápidas
      </Text>

      <TouchableOpacity
        style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate('Citas')}
      >
        <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
          <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.actionInfo}>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            Mis Citas
          </Text>
          <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
            Ver todas mis citas
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate('Perfil')}
      >
        <View style={[styles.actionIcon, { backgroundColor: '#43A047' + '20' }]}>
          <Ionicons name="person-outline" size={24} color="#43A047" />
        </View>
        <View style={styles.actionInfo}>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            Mi Perfil
          </Text>
          <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
            Ver y editar mi información
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      {/* Estadísticas */}
      <View style={[styles.statsCard, { backgroundColor: theme.colors.primary + '15' }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {totalCitas}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Citas totales
          </Text>
        </View>
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
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  card: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  citaInfo: {},
  citaFecha: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  citaMotivo: {
    fontSize: 14,
    marginBottom: 8,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doctorText: {
    fontSize: 14,
  },
  noCita: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  statsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default DashboardPacienteScreen;