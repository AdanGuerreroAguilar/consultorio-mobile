import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const CitasDoctorScreen = ({ navigation }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas'); // todas, hoy, pendientes
  
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/citas');
      
      // Filtrar solo las citas del doctor actual
      const citasDoctor = response.data.filter(
        cita => cita.doctor_id === user.id
      );
      
      // Ordenar por fecha (más recientes primero)
      citasDoctor.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
      
      setCitas(citasDoctor);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargarCitas();
    setRefreshing(false);
  }, []);

  const cambiarEstadoCita = async (citaId, nuevoEstado) => {
    try {
      await apiClient.put(`/citas/${citaId}`, { estado: nuevoEstado });
      Alert.alert('Éxito', 'Estado de la cita actualizado');
      cargarCitas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const mostrarOpcionesEstado = (cita) => {
    Alert.alert(
      'Cambiar estado',
      '¿Qué estado deseas asignar?',
      [
        { text: 'Confirmada', onPress: () => cambiarEstadoCita(cita.id, 'Confirmada') },
        { text: 'En Proceso', onPress: () => cambiarEstadoCita(cita.id, 'En_Proceso') },
        { text: 'Completada', onPress: () => cambiarEstadoCita(cita.id, 'Completada') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'programada':
        return theme.colors.info;
      case 'confirmada':
        return theme.colors.success;
      case 'en_proceso':
        return theme.colors.warning;
      case 'completada':
        return theme.colors.textSecondary;
      case 'cancelada':
        return theme.colors.danger;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const opciones = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-MX', opciones);
  };

  const citasFiltradas = citas.filter(cita => {
    if (filtro === 'todas') return true;
    
    if (filtro === 'hoy') {
      const hoy = new Date();
      const citaFecha = new Date(cita.fecha_hora);
      return citaFecha.toDateString() === hoy.toDateString();
    }
    
    if (filtro === 'pendientes') {
      return ['Programada', 'Confirmada'].includes(cita.estado);
    }
    
    return true;
  });

  const renderCita = ({ item }) => (
    <TouchableOpacity
      style={[styles.citaCard, { backgroundColor: theme.colors.card }]}
      onPress={() => mostrarOpcionesEstado(item)}
    >
      {/* Header con paciente y estado */}
      <View style={styles.citaHeader}>
        <View style={styles.pacienteInfo}>
          <Ionicons name="person-circle-outline" size={40} color={theme.colors.primary} />
          <View style={styles.pacienteTexto}>
            <Text style={[styles.pacienteNombre, { color: theme.colors.text }]}>
              {item.paciente_nombre}
            </Text>
            <Text style={[styles.especialidad, { color: theme.colors.textSecondary }]}>
              {item.especialidad}
            </Text>
          </View>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) + '20' }]}>
          <Text style={[styles.estadoText, { color: getEstadoColor(item.estado) }]}>
            {item.estado?.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Fecha y hora */}
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
        <Text style={[styles.infoText, { color: theme.colors.text }]}>
          {formatFecha(item.fecha_hora)}
        </Text>
      </View>

      {/* Motivo */}
      {item.motivo && (
        <View style={styles.infoRow}>
          <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text }]} numberOfLines={2}>
            {item.motivo}
          </Text>
        </View>
      )}

      {/* Acciones */}
      <View style={styles.accionesRow}>
        <TouchableOpacity
          style={[styles.accionBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => mostrarOpcionesEstado(item)}
        >
          <Ionicons name="create-outline" size={18} color="#FFFFFF" />
          <Text style={styles.accionBtnText}>Cambiar Estado</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Cargando citas...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header con estadísticas */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {citas.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
            {citas.filter(c => ['Programada', 'Confirmada'].includes(c.estado)).length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Pendientes
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.success }]}>
            {citas.filter(c => c.estado === 'Completada').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Completadas
          </Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[
            styles.filtroBtn,
            { backgroundColor: filtro === 'todas' ? theme.colors.primary : theme.colors.card }
          ]}
          onPress={() => setFiltro('todas')}
        >
          <Text style={[styles.filtroText, { color: filtro === 'todas' ? '#FFFFFF' : theme.colors.text }]}>
            Todas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filtroBtn,
            { backgroundColor: filtro === 'hoy' ? theme.colors.primary : theme.colors.card }
          ]}
          onPress={() => setFiltro('hoy')}
        >
          <Text style={[styles.filtroText, { color: filtro === 'hoy' ? '#FFFFFF' : theme.colors.text }]}>
            Hoy
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filtroBtn,
            { backgroundColor: filtro === 'pendientes' ? theme.colors.primary : theme.colors.card }
          ]}
          onPress={() => setFiltro('pendientes')}
        >
          <Text style={[styles.filtroText, { color: filtro === 'pendientes' ? '#FFFFFF' : theme.colors.text }]}>
            Pendientes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de citas */}
      <FlatList
        data={citasFiltradas}
        renderItem={renderCita}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No hay citas para mostrar
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  filtrosContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  filtroBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  filtroText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  citaCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  citaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  pacienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pacienteTexto: {
    marginLeft: 10,
    flex: 1,
  },
  pacienteNombre: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  especialidad: {
    fontSize: 14,
    marginTop: 2,
  },
  estadoBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  accionesRow: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  accionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    gap: 8,
  },
  accionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },
});

export default CitasDoctorScreen;
