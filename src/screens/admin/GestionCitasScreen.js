// screens/admin/GestionCitasScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const GestionCitasScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [])
  );

  const cargarCitas = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/citas');
      setCitas(response.data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = (cita, nuevoEstado) => {
    Alert.alert(
      'Cambiar Estado',
      `¿Cambiar estado a "${nuevoEstado}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await apiClient.put(`/citas/${cita.id}`, { estado: nuevoEstado });
              Alert.alert('Éxito', 'Estado actualizado');
              cargarCitas();
            } catch (error) {
              Alert.alert('Error', 'No se pudo actualizar el estado');
            }
          },
        },
      ]
    );
  };

  const handleEliminar = (cita) => {
    Alert.alert(
      'Eliminar Cita',
      '¿Estás seguro de eliminar esta cita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/citas/${cita.id}`);
              Alert.alert('Éxito', 'Cita eliminada');
              cargarCitas();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la cita');
            }
          },
        },
      ]
    );
  };

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'programada':
        return { color: '#1E88E5', icon: 'time-outline', text: 'Programada' };
      case 'completada':
        return { color: '#43A047', icon: 'checkmark-circle-outline', text: 'Completada' };
      case 'cancelada':
        return { color: '#E53935', icon: 'close-circle-outline', text: 'Cancelada' };
      default:
        return { color: '#757575', icon: 'help-circle-outline', text: estado };
    }
  };

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return {
      fecha: fecha.toLocaleDateString('es-MX', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      }),
      hora: fecha.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  const citasFiltradas = filtroEstado === 'todas' 
    ? citas 
    : citas.filter(c => c.estado === filtroEstado);

  const renderCita = ({ item }) => {
    const estadoInfo = getEstadoInfo(item.estado);
    const { fecha, hora } = formatFecha(item.fecha_hora);

    return (
      <View style={[styles.citaCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.citaHeader}>
          <View style={[styles.fechaContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.fechaText, { color: theme.colors.primary }]}>{fecha}</Text>
            <Text style={[styles.horaText, { color: theme.colors.primary }]}>{hora}</Text>
          </View>

          <View style={styles.citaInfo}>
            <Text style={[styles.pacienteNombre, { color: theme.colors.text }]}>
              {item.paciente_nombre} {item.paciente_apellido}
            </Text>
            
            <View style={styles.doctorRow}>
              <Ionicons name="medical-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.doctorText, { color: theme.colors.textSecondary }]}>
                Dr. {item.doctor_nombre} {item.doctor_apellido}
              </Text>
            </View>

            <Text style={[styles.motivoText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {item.motivo}
            </Text>

            <View style={[styles.estadoBadge, { backgroundColor: estadoInfo.color + '20' }]}>
              <Ionicons name={estadoInfo.icon} size={14} color={estadoInfo.color} />
              <Text style={[styles.estadoText, { color: estadoInfo.color }]}>
                {estadoInfo.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.acciones}>
          {item.estado === 'programada' && (
            <>
              <TouchableOpacity
                style={[styles.accionButton, { backgroundColor: '#43A047' + '20' }]}
                onPress={() => handleCambiarEstado(item, 'completada')}
              >
                <Ionicons name="checkmark" size={18} color="#43A047" />
                <Text style={[styles.accionText, { color: '#43A047' }]}>Completar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.accionButton, { backgroundColor: '#FB8C00' + '20' }]}
                onPress={() => handleCambiarEstado(item, 'cancelada')}
              >
                <Ionicons name="close" size={18} color="#FB8C00" />
                <Text style={[styles.accionText, { color: '#FB8C00' }]}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.accionButton, { backgroundColor: theme.colors.danger + '20' }]}
            onPress={() => handleEliminar(item)}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        {['todas', 'programada', 'completada', 'cancelada'].map((estado) => (
          <TouchableOpacity
            key={estado}
            style={[
              styles.filtroButton,
              { backgroundColor: theme.colors.card },
              filtroEstado === estado && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setFiltroEstado(estado)}
          >
            <Text
              style={[
                styles.filtroText,
                { color: filtroEstado === estado ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={citasFiltradas}
        renderItem={renderCita}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarCitas} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No hay citas {filtroEstado !== 'todas' ? filtroEstado + 's' : ''}
            </Text>
          </View>
        }
      />

      {/* Botón flotante */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CrearCita')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtrosContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 8,
  },
  filtroButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filtroText: {
    fontSize: 13,
    fontWeight: '600',
  },
  lista: {
    padding: 15,
    paddingBottom: 100,
  },
  citaCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  citaHeader: {
    flexDirection: 'row',
  },
  fechaContainer: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    minWidth: 80,
  },
  fechaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  horaText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  citaInfo: {
    flex: 1,
  },
  pacienteNombre: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  doctorText: {
    fontSize: 13,
  },
  motivoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  acciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  accionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  accionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default GestionCitasScreen;