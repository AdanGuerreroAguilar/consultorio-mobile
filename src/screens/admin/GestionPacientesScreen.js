import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const GestionPacientesScreen = ({ navigation }) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { theme } = useTheme();

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const response = await apiClient.get('/pacientes');
      setPacientes(response.data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarPacientes();
    setRefreshing(false);
  };

  const handleEliminarPaciente = (paciente) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar a ${paciente.nombre} ${paciente.apellido}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/pacientes/${paciente.id}`);
              Alert.alert('Éxito', 'Paciente eliminado correctamente');
              cargarPacientes();
            } catch (error) {
              console.error('Error al eliminar paciente:', error);
              Alert.alert(
                'Error',
                error.response?.data?.detail || 'No se pudo eliminar el paciente'
              );
            }
          },
        },
      ]
    );
  };

  const handleEditarPaciente = (paciente) => {
    navigation.navigate('EditarPaciente', { paciente });
  };

  const pacientesFiltrados = pacientes.filter(
    (paciente) =>
      paciente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paciente.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paciente.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPaciente = ({ item }) => (
    <View style={[styles.pacienteCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.pacienteInfo}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
          <Ionicons name="person" size={24} color={theme.colors.primary} />
        </View>
        
        <View style={styles.infoContent}>
          <Text style={[styles.pacienteNombre, { color: theme.colors.text }]}>
            {item.nombre} {item.apellido}
          </Text>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {item.email}
            </Text>
          </View>
          {item.telefono && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                {item.telefono}
              </Text>
            </View>
          )}
          {item.fecha_nacimiento && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                {new Date(item.fecha_nacimiento).toLocaleDateString('es-MX')}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.info + '20' }]}
          onPress={() => handleEditarPaciente(item)}
        >
          <Ionicons name="create-outline" size={20} color={theme.colors.info} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error + '20' }]}
          onPress={() => handleEliminarPaciente(item)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Cargando pacientes...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Buscador */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Buscar paciente..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {pacientesFiltrados.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Pacientes
          </Text>
        </View>
      </View>

      {/* Lista de pacientes */}
      <FlatList
        data={pacientesFiltrados}
        renderItem={renderPaciente}
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
            <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
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
  searchContainer: {
    padding: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  listContainer: {
    padding: 15,
    paddingTop: 0,
  },
  pacienteCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pacienteInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  pacienteNombre: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  infoText: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
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

export default GestionPacientesScreen;