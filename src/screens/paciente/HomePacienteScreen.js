import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const HomePacienteScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [proxCitas, setProxCitas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Obtener próximas citas del paciente
      const response = await apiClient.get('/citas');
      // Filtrar solo las citas del paciente actual
      const misCitas = response.data.filter(
        cita => cita.paciente_id === user.paciente_id
      );
      setProxCitas(misCitas.slice(0, 3)); // Solo las próximas 3
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const opciones = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return fecha.toLocaleDateString('es-MX', opciones);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={cargarDatos} />
      }
    >
      {/* Header de bienvenida */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.welcomeText}>¡Hola!</Text>
        <Text style={styles.nameText}>
          {user?.nombre} {user?.apellido}
        </Text>
      </View>

      {/* Tarjetas de acceso rápido */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Citas', { screen: 'CrearCita' })}
        >
          <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            Nueva Cita
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Citas')}
        >
          <Ionicons name="time-outline" size={32} color={theme.colors.success} />
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            Mis Citas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Historial')}
        >
          <Ionicons name="document-text-outline" size={32} color={theme.colors.warning} />
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            Historial
          </Text>
        </TouchableOpacity>
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

        {proxCitas.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No tienes citas programadas
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Citas', { screen: 'CrearCita' })}
            >
              <Text style={styles.emptyButtonText}>Agendar cita</Text>
            </TouchableOpacity>
          </View>
        ) : (
          proxCitas.map((cita) => (
            <TouchableOpacity
              key={cita.id}
              style={[styles.citaCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate('Citas', { 
                screen: 'DetalleCita', 
                params: { citaId: cita.id } 
              })}
            >
              <View style={styles.citaHeader}>
                <View style={[styles.citaBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.citaBadgeText, { color: theme.colors.primary }]}>
                    {cita.estado}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.citaMotivo, { color: theme.colors.text }]}>
                {cita.motivo}
              </Text>
              
              <View style={styles.citaInfo}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.citaInfoText, { color: theme.colors.textSecondary }]}>
                  {formatearFecha(cita.fecha_hora)}
                </Text>
              </View>

              <View style={styles.citaInfo}>
                <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.citaInfoText, { color: theme.colors.textSecondary }]}>
                  Dr. {cita.doctor_nombre}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Información útil */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Información Importante
        </Text>
        <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              Recordatorio
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              Llega 10 minutos antes de tu cita. No olvides traer tus estudios previos.
            </Text>
          </View>
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
    paddingTop: 40,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: -20,
  },
  actionCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
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
  emptyCard: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 15,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  citaMotivo: {
    fontSize: 16,
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
  infoCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HomePacienteScreen;