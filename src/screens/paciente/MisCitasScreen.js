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
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { citasAPI } from '../../api/citas';

const MisCitasScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('todas'); // todas, proximas, pasadas

  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [filtro])
  );

  const cargarCitas = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando citas para paciente_id:', user?.paciente_id);
      console.log('👤 Usuario actual:', user);

      if (!user || !user.paciente_id) {
        console.error('❌ No hay usuario o paciente_id - cancelando carga de citas');
        Alert.alert('Error', 'Sesión no válida. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      const response = await citasAPI.getCitas();
      console.log('✅ Citas recibidas:', response?.length || 0);

      // Filtrar solo mis citas
      const misCitas = response.filter(
        cita => cita.paciente_id === user.paciente_id
      );

      // Aplicar filtro
      const ahora = new Date();
      let citasFiltradas = misCitas;

      if (filtro === 'proximas') {
        citasFiltradas = misCitas.filter(
          cita => new Date(cita.fecha_hora) >= ahora
        );
      } else if (filtro === 'pasadas') {
        citasFiltradas = misCitas.filter(
          cita => new Date(cita.fecha_hora) < ahora
        );
      }

      // Ordenar por fecha
      citasFiltradas.sort((a, b) =>
        new Date(b.fecha_hora) - new Date(a.fecha_hora)
      );

      setCitas(citasFiltradas);
      console.log('✅ Citas filtradas y ordenadas:', citasFiltradas.length);
    } catch (error) {
      console.error('❌ Error al cargar citas:', error);
      console.error('❌ Error detail:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      Alert.alert('Error', 'No se pudieron cargar las citas. ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarCita = (citaId) => {
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
              Alert.alert('Éxito', 'Cita cancelada correctamente');
              cargarCitas();
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
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

  const renderCita = ({ item }) => {
    const esFutura = new Date(item.fecha_hora) >= new Date();
    
    return (
      <TouchableOpacity
        style={[styles.citaCard, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate('DetalleCita', { citaId: item.id })}
      >
        <View style={styles.citaHeader}>
          <View style={[
            styles.estadoBadge,
            { backgroundColor: getEstadoColor(item.estado) + '20' }
          ]}>
            <Text style={[
              styles.estadoText,
              { color: getEstadoColor(item.estado) }
            ]}>
              {item.estado}
            </Text>
          </View>
          
          {esFutura && (
            <TouchableOpacity
              onPress={() => handleCancelarCita(item.id)}
              style={styles.cancelButton}
            >
              <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.citaMotivo, { color: theme.colors.text }]}>
          {item.motivo}
        </Text>

        <View style={styles.citaInfo}>
          <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.citaInfoText, { color: theme.colors.textSecondary }]}>
            {formatearFecha(item.fecha_hora)}
          </Text>
        </View>

        <View style={styles.citaInfo}>
          <Ionicons name="person-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.citaInfoText, { color: theme.colors.textSecondary }]}>
            Dr. {item.doctor_nombre}
          </Text>
        </View>

        <View style={styles.citaInfo}>
          <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.citaInfoText, { color: theme.colors.textSecondary }]}>
            {item.duracion_minutos} minutos
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filtros */}
      <View style={styles.filtros}>
        <TouchableOpacity
          style={[
            styles.filtroButton,
            filtro === 'todas' && { backgroundColor: theme.colors.primary },
            { borderColor: theme.colors.primary }
          ]}
          onPress={() => setFiltro('todas')}
        >
          <Text style={[
            styles.filtroText,
            filtro === 'todas' 
              ? { color: '#FFFFFF' } 
              : { color: theme.colors.primary }
          ]}>
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            filtro === 'proximas' && { backgroundColor: theme.colors.primary },
            { borderColor: theme.colors.primary }
          ]}
          onPress={() => setFiltro('proximas')}
        >
          <Text style={[
            styles.filtroText,
            filtro === 'proximas'
              ? { color: '#FFFFFF' }
              : { color: theme.colors.primary }
          ]}>
            Próximas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            filtro === 'pasadas' && { backgroundColor: theme.colors.primary },
            { borderColor: theme.colors.primary }
          ]}
          onPress={() => setFiltro('pasadas')}
        >
          <Text style={[
            styles.filtroText,
            filtro === 'pasadas'
              ? { color: '#FFFFFF' }
              : { color: theme.colors.primary }
          ]}>
            Pasadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de citas */}
      <FlatList
        data={citas}
        renderItem={renderCita}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarCitas} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No tienes citas {filtro === 'todas' ? '' : filtro}
            </Text>
          </View>
        }
      />

      {/* Botón flotante para crear cita */}
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
  filtros: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  filtroButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  filtroText: {
    fontWeight: '600',
    fontSize: 14,
  },
  lista: {
    padding: 15,
  },
  citaCard: {
    padding: 15,
    borderRadius: 15,
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
    marginBottom: 12,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cancelButton: {
    padding: 4,
  },
  citaMotivo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  citaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  citaInfoText: {
    fontSize: 14,
    marginLeft: 10,
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

export default MisCitasScreen;