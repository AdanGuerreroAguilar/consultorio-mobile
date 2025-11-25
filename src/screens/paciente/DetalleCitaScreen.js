import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { citasAPI } from '../../api/citas';
import apiClient from '../../api/client';

const DetalleCitaScreen = ({ route, navigation }) => {
  const { citaId } = route.params;
  const { theme } = useTheme();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDetalleCita();
  }, []);

  const cargarDetalleCita = async () => {
    try {
      // Obtener todas las citas y encontrar la específica
      const response = await citasAPI.getCitas();
      const citaEncontrada = response.find(c => c.id === citaId);
      setCita(citaEncontrada);
    } catch (error) {
      console.error('Error al cargar cita:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarCita = () => {
    Alert.alert(
      'Cancelar Cita',
      '¿Estás seguro de que deseas cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await citasAPI.eliminarCita(citaId);
              Alert.alert('Éxito', 'Cita cancelada correctamente', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la cita');
            }
          },
        },
      ]
    );
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

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: theme.colors.warning,
      confirmada: theme.colors.success,
      completada: theme.colors.textSecondary,
      cancelada: theme.colors.danger,
    };
    return colores[estado] || theme.colors.textSecondary;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!cita) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.danger} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          No se encontró la cita
        </Text>
      </View>
    );
  }

  const esFutura = new Date(cita.fecha_hora) >= new Date();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header con estado */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <View style={[
          styles.estadoBadge,
          { backgroundColor: getEstadoColor(cita.estado) + '20' }
        ]}>
          <Text style={[styles.estadoText, { color: getEstadoColor(cita.estado) }]}>
            {cita.estado.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Información principal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Información de la Cita
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Fecha y Hora
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatearFecha(cita.fecha_hora)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Doctor
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                Dr. {cita.doctor_nombre}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Duración
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {cita.duracion_minutos} minutos
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Motivo */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Motivo de Consulta
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.motivoText, { color: theme.colors.text }]}>
            {cita.motivo}
          </Text>
        </View>
      </View>

      {/* Notas adicionales */}
      {cita.notas && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Notas
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.notasText, { color: theme.colors.text }]}>
              {cita.notas}
            </Text>
          </View>
        </View>
      )}

      {/* Botón cancelar si es futura */}
      {esFutura && cita.estado !== 'cancelada' && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.colors.danger }]}
            onPress={handleCancelarCita}
          >
            <Ionicons name="close-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.cancelButtonText}>Cancelar Cita</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 30 }} />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 15,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  estadoBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  estadoText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  motivoText: {
    fontSize: 16,
    lineHeight: 24,
  },
  notasText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  cancelButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DetalleCitaScreen;