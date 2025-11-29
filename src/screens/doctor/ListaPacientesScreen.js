import React, { useState, useEffect, useCallback } from 'react';
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
import { pacientesAPI } from '../../api/pacientes';

const ListaPacientesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      cargarPacientes();
    }, [])
  );

  const cargarPacientes = async () => {
    setLoading(true);
    try {
      const data = await pacientesAPI.getPacientes();
      setPacientes(data);
      setPacientesFiltrados(data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setPacientesFiltrados(pacientes);
    } else {
      const filtered = pacientes.filter(
        (p) =>
          p.nombre.toLowerCase().includes(text.toLowerCase()) ||
          p.apellido.toLowerCase().includes(text.toLowerCase()) ||
          p.email?.toLowerCase().includes(text.toLowerCase())
      );
      setPacientesFiltrados(filtered);
    }
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
        onPress={() => navigation.navigate('FichaPaciente', { pacienteId: item.id })}
      >
        <View style={styles.pacienteHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="person" size={28} color={theme.colors.primary} />
          </View>

          <View style={styles.pacienteInfo}>
            <Text style={[styles.pacienteNombre, { color: theme.colors.text }]}>
              {item.nombre} {item.apellido}
            </Text>

            {edad && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  {edad} años
                </Text>
              </View>
            )}

            {item.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  {item.email}
                </Text>
              </View>
            )}

            {item.telefono && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  {item.telefono}
                </Text>
              </View>
            )}
          </View>

          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
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
        data={pacientesFiltrados}
        renderItem={renderPaciente}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarPacientes} />
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
  container: { flex: 1 },
  searchContainer: { padding: 15 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16 },
  lista: { padding: 15 },

  pacienteCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  pacienteHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  pacienteInfo: { flex: 1 },
  pacienteNombre: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  infoText: { fontSize: 14 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, marginTop: 15 },
});

export default ListaPacientesScreen;
