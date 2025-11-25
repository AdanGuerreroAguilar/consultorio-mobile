import React, { useState, useEffect, useCallback } from 'react';
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
  const [citasFiltradas, setCitasFiltradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todas'); // todas, pendientes, completadas, canceladas

  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [])
  );

  const cargarCitas = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/citas');
      const citasOrdenadas = response.data.sort(
        (a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)
      );
      setCitas(citasOrdenadas);
      aplicarFiltro(citasOrdenadas, filtroEstado);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltro = (data, estado) => {
    let filtered = data;

    if (estado === 'pendientes') {
      filtered = filtered.filter(
        (c) => c.estado === 'Programada' || c.estado === 'Confirmada'
      );
    } else if (estado === 'completadas') {
      filtered = filtered.filter((c) => c.estado === 'Completada');
    } else if (estado === 'canceladas') {
      filtered = filtered.filter((c) => c.estado === 'Cancelada');
    }

    setCitasFiltradas(filtered);
  };

  const handleFiltro = (estado) => {
    setFiltroEstado(estado);
    aplicarFiltro(citas, estado);
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatearHora = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstadoColor = (estado) => {
    const colores = {
      Programada: theme.colors.info,
      Confirmada: theme.colors.success,
      Completada: theme.colors.textSecondary,
      Cancelada: theme.colors.danger,
      En_Proceso: theme.colors.warning,
    };
    return colores[estado] || theme.colors.textSecondary;
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      Programada: 'time',
      Confirmada: 'checkmark-circle',
      Completada: 'checkmark-done-circle',
      Cancelada: 'close-circle',
      En_Proceso: 'hourglass',
    };
    return iconos[estado] || 'help-circle';
  };

  const handleCambiarEstado = (citaId, estadoActual) => {
    const estados = ['Programada', 'Confirmada', 'En_Proceso', 'Completada', 'Cancelada'];

    Alert.alert(
      'Cambiar Estado de Cita',
      'Selecciona el nuevo estado:',
      [
        ...estados.map((estado) => ({
          text: estado,
          onPress: async () => {
            try {
              await apiClient.put(`/citas/${citaId}`, { estado });
              Alert.alert('Éxito', 'Estado actualizado correctamente');
              cargarCitas();
            } catch (error) {
              console.error('Error al actualizar estado:', error);
              Alert.alert('Error', 'No se pudo actualizar el estado');
            }
          },
        })),
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const renderCita = ({ item }) => {
    const estadoColor = getEstadoColor(item.estado);
    const estadoIcon = getEstadoIcon(item.estado);

    return (
      <TouchableOpacity
        style={[styles.citaCard, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate('DetalleCita', { citaId: item.id })}
      >
        <View style={styles.citaHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pacienteNombre, { color: theme.colors.text }]}>
              {item.paciente_nombre} {item.paciente_apellido}
            </Text>
            <Text style={[styles.doctorNombre, { color: theme.colors.textSecondary }]}>
              Dr. {item.doctor_nombre} {item.doctor_apellido}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.estadoBadge, { backgroundColor: estadoColor + '20' }]}
            onPress={() => handleCambiarEstado(item.id, item.estado)}
          >
            <Ionicons name={estadoIcon} size={16} color={estadoColor} />
            <Text style={[styles.estadoText, { color: estadoColor }]}>{item.estado}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.citaInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {formatearFecha(item.fecha_hora)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {formatearHora(item.fecha_hora)}
            </Text>
          </View>
        </View>

        {item.motivo && (
          <Text style={[styles.motivo, { color: theme.colors.text }]} numberOfLines={2}>
            {item.motivo}
          </Text>
        )}

        {item.especialidad && (
          <View style={[styles.especialidadBadge, { backgroundColor: theme.colors.primary + '10' }]}>
            <Text style={[styles.especialidadText, { color: theme.colors.primary }]}>
              {item.especialidad}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const estadisticas = {
    total: citas.length,
    pendientes: citas.filter((c) => c.estado === 'Programada' || c.estado === 'Confirmada')
      .length,
    completadas: citas.filter((c) => c.estado === 'Completada').length,
    canceladas: citas.filter((c) => c.estado === 'Cancelada').length,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Stats Header */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estadisticas.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estadisticas.pendientes}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estadisticas.completadas}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[
            styles.filtroButton,
            { backgroundColor: theme.colors.card },
            filtroEstado === 'todas' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleFiltro('todas')}
        >
          <Text
            style={[
              styles.filtroText,
              { color: filtroEstado === 'todas' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            { backgroundColor: theme.colors.card },
            filtroEstado === 'pendientes' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleFiltro('pendientes')}
        >
          <Text
            style={[
              styles.filtroText,
              { color: filtroEstado === 'pendientes' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Pendientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            { backgroundColor: theme.colors.card },
            filtroEstado === 'completadas' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleFiltro('completadas')}
        >
          <Text
            style={[
              styles.filtroText,
              { color: filtroEstado === 'completadas' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Completadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            { backgroundColor: theme.colors.card },
            filtroEstado === 'canceladas' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleFiltro('canceladas')}
        >
          <Text
            style={[
              styles.filtroText,
              { color: filtroEstado === 'canceladas' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Canceladas
          </Text>
        </TouchableOpacity>
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
              No hay citas con este filtro
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 8,
    flexWrap: 'wrap',
  },
  filtroButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filtroText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lista: {
    padding: 15,
  },
  citaCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  citaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  pacienteNombre: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorNombre: {
    fontSize: 14,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  citaInfo: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
  },
  motivo: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  especialidadBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  especialidadText: {
    fontSize: 12,
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
});

export default GestionCitasScreen;
