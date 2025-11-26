// screens/admin/GestionPacientesScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const GestionPacientesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      cargarPacientes();
    }, [])
  );

  const cargarPacientes = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `/pacientes?search=${search}` : '/pacientes';
      const response = await apiClient.get(url);
      setPacientes(response.data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length > 2 || text.length === 0) {
      cargarPacientes(text);
    }
  };

  const handleEliminar = (paciente) => {
    Alert.alert(
      'Eliminar Paciente',
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
              Alert.alert('Error', 'No se pudo eliminar el paciente');
            }
          },
        },
      ]
    );
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const renderPaciente = ({ item }) => {
    const edad = calcularEdad(item.fecha_nacimiento);

    return (
      <TouchableOpacity
        style={[styles.pacienteCard, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate('EditarPaciente', { paciente: item })}
      >
        <View style={styles.pacienteHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {item.nombre?.charAt(0)}{item.apellido?.charAt(0)}
            </Text>
          </View>

          <View style={styles.pacienteInfo}>
            <Text style={[styles.pacienteNombre, { color: theme.colors.text }]}>
              {item.nombre} {item.apellido}
            </Text>

            <View style={styles.infoRow}>
              {edad && (
                <View style={styles.badge}>
                  <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
                  <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                    {edad} años
                  </Text>
                </View>
              )}
              {item.genero && (
                <View style={styles.badge}>
                  <Ionicons 
                    name={item.genero === 'Masculino' ? 'male' : item.genero === 'Femenino' ? 'female' : 'person'} 
                    size={12} 
                    color={theme.colors.textSecondary} 
                  />
                  <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                    {item.genero}
                  </Text>
                </View>
              )}
              {item.tipo_sangre && (
                <View style={[styles.badge, { backgroundColor: '#E53935' + '20' }]}>
                  <Ionicons name="water" size={12} color="#E53935" />
                  <Text style={[styles.badgeText, { color: '#E53935' }]}>
                    {item.tipo_sangre}
                  </Text>
                </View>
              )}
            </View>

            {item.telefono && (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
                  {item.telefono}
                </Text>
              </View>
            )}

            {item.email && (
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
                  {item.email}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleEliminar(item)}
          >
            <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Buscador */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Buscar paciente..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={pacientes}
        renderItem={renderPaciente}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => cargarPacientes(searchQuery)} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
            </Text>
          </View>
        }
      />

      {/* Botón flotante */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CrearPaciente')}
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
  searchContainer: {
    padding: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  lista: {
    padding: 15,
    paddingBottom: 100,
  },
  pacienteCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  pacienteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pacienteInfo: {
    flex: 1,
  },
  pacienteNombre: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  badgeText: {
    fontSize: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
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

export default GestionPacientesScreen;