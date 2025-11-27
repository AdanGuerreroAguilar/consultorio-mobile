import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const MiHistorialScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos, consultas, tratamientos

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [filtro])
  );

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      console.log('📋 Cargando historial para paciente:', user?.paciente_id);

      if (!user?.paciente_id) {
        console.warn('⚠️ No se encontró paciente_id');
        setHistorial([]);
        return;
      }

      // Intentar cargar desde el endpoint de historial
      let historialData = [];
      
      try {
        // Primero intenta el endpoint específico de historial
        const response = await apiClient.get(`/pacientes/${user.paciente_id}/historial`);
        historialData = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.log('Endpoint de historial no disponible, cargando citas completadas...');
        
        // Fallback: cargar citas completadas como historial
        try {
          const citasResponse = await apiClient.get('/citas');
          const todasCitas = Array.isArray(citasResponse.data) ? citasResponse.data : [];
          
          // Filtrar citas completadas del paciente
          historialData = todasCitas
            .filter(cita => 
              cita.paciente_id === user.paciente_id && 
              (cita.estado === 'completada' || new Date(cita.fecha_hora) < new Date())
            )
            .map(cita => ({
              id: cita.id,
              tipo: 'consulta',
              fecha: cita.fecha_hora,
              titulo: cita.motivo || 'Consulta médica',
              descripcion: cita.notas || cita.diagnostico || 'Sin detalles adicionales',
              doctor: cita.doctor_nombre ? `Dr. ${cita.doctor_nombre} ${cita.doctor_apellido || ''}` : 'Doctor asignado',
              estado: cita.estado,
            }));
        } catch (citasError) {
          console.error('Error al cargar citas:', citasError);
        }
      }

      // Aplicar filtros
      let historialFiltrado = historialData;
      if (filtro === 'consultas') {
        historialFiltrado = historialData.filter(item => item.tipo === 'consulta');
      } else if (filtro === 'tratamientos') {
        historialFiltrado = historialData.filter(item => item.tipo === 'tratamiento');
      }

      // Ordenar por fecha (más reciente primero)
      historialFiltrado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      console.log('✅ Historial cargado:', historialFiltrado.length, 'registros');
      setHistorial(historialFiltrado);

    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
      Alert.alert('Error', 'No se pudo cargar el historial médico');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return fechaStr;
    }
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      consulta: 'medical-outline',
      tratamiento: 'fitness-outline',
      examen: 'flask-outline',
      receta: 'document-text-outline',
    };
    return icons[tipo] || 'document-outline';
  };

  const getTipoColor = (tipo) => {
    const colors = {
      consulta: theme.colors.primary,
      tratamiento: theme.colors.success || '#4CAF50',
      examen: theme.colors.warning || '#FFC107',
      receta: '#9C27B0',
    };
    return colors[tipo] || theme.colors.textSecondary;
  };

  const renderHistorialItem = ({ item }) => {
    const tipoColor = getTipoColor(item.tipo);

    return (
      <TouchableOpacity
        style={[styles.historialCard, { backgroundColor: theme.colors.card }]}
        onPress={() => {
          // Navegar al detalle si existe
          Alert.alert(
            item.titulo,
            `${item.descripcion}\n\nFecha: ${formatearFecha(item.fecha)}\n${item.doctor || ''}`,
            [{ text: 'OK' }]
          );
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: tipoColor + '20' }]}>
            <Ionicons 
              name={getTipoIcon(item.tipo)} 
              size={24} 
              color={tipoColor} 
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.tipo, { color: tipoColor }]}>
              {item.tipo?.charAt(0).toUpperCase() + item.tipo?.slice(1) || 'Registro'}
            </Text>
            <Text style={[styles.fecha, { color: theme.colors.textSecondary }]}>
              {formatearFecha(item.fecha)}
            </Text>
          </View>
        </View>

        <Text style={[styles.titulo, { color: theme.colors.text }]}>
          {item.titulo}
        </Text>

        {item.descripcion && (
          <Text 
            style={[styles.descripcion, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.descripcion}
          </Text>
        )}

        {item.doctor && (
          <View style={styles.doctorRow}>
            <Ionicons 
              name="person-outline" 
              size={16} 
              color={theme.colors.textSecondary} 
            />
            <Text style={[styles.doctorText, { color: theme.colors.textSecondary }]}>
              {item.doctor}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading && historial.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Cargando historial...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filtros */}
      <View style={styles.filtros}>
        {['todos', 'consultas', 'tratamientos'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.filtroButton,
              filtro === tipo && { backgroundColor: theme.colors.primary },
              { borderColor: theme.colors.primary }
            ]}
            onPress={() => setFiltro(tipo)}
          >
            <Text style={[
              styles.filtroText,
              filtro === tipo
                ? { color: '#FFFFFF' }
                : { color: theme.colors.primary }
            ]}>
              {tipo === 'todos' ? 'Todos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Resumen */}
      <View style={[styles.resumenCard, { backgroundColor: theme.colors.primary + '15' }]}>
        <View style={styles.resumenItem}>
          <Text style={[styles.resumenValor, { color: theme.colors.primary }]}>
            {historial.length}
          </Text>
          <Text style={[styles.resumenLabel, { color: theme.colors.textSecondary }]}>
            Registros
          </Text>
        </View>
        <View style={[styles.resumenDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.resumenItem}>
          <Text style={[styles.resumenValor, { color: theme.colors.primary }]}>
            {historial.filter(h => h.tipo === 'consulta').length}
          </Text>
          <Text style={[styles.resumenLabel, { color: theme.colors.textSecondary }]}>
            Consultas
          </Text>
        </View>
      </View>

      {/* Lista de historial */}
      <FlatList
        data={historial}
        renderItem={renderHistorialItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={cargarHistorial}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="document-text-outline" 
              size={64} 
              color={theme.colors.textSecondary} 
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No hay registros en tu historial médico
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              Tus consultas completadas aparecerán aquí
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
    fontSize: 13,
  },
  resumenCard: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    justifyContent: 'space-around',
  },
  resumenItem: {
    alignItems: 'center',
    flex: 1,
  },
  resumenValor: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  resumenLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  resumenDivider: {
    width: 1,
    marginVertical: 5,
  },
  lista: {
    padding: 15,
    paddingTop: 5,
  },
  historialCard: {
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  tipo: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fecha: {
    fontSize: 13,
    marginTop: 2,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  descripcion: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  doctorText: {
    fontSize: 13,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MiHistorialScreen;