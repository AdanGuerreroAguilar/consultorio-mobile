// screens/admin/GestionUsuariosScreen.js
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

const GestionUsuariosScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');

  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
    }, [])
  );

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/usuarios');
      setUsuarios(response.data);
      aplicarFiltros(response.data, searchQuery, filtroRol);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (data, busqueda, rol) => {
    let filtered = data;

    // Filtrar por rol
    if (rol === 'doctores') {
      filtered = filtered.filter(u => u.rol === 'doctor');
    } else if (rol === 'admins') {
      filtered = filtered.filter(u => u.rol === 'admin');
    }

    // Filtrar por búsqueda
    if (busqueda.trim() !== '') {
      filtered = filtered.filter(
        u =>
          u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.especialidad?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    setUsuariosFiltrados(filtered);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    aplicarFiltros(usuarios, text, filtroRol);
  };

  const handleFiltroRol = (rol) => {
    setFiltroRol(rol);
    aplicarFiltros(usuarios, searchQuery, rol);
  };

  const handleEliminar = (usuario) => {
    Alert.alert(
      'Eliminar Usuario',
      `¿Estás seguro de eliminar a ${usuario.nombre} ${usuario.apellido}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/usuarios/${usuario.id}`);
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
              cargarUsuarios();
            } catch (error) {
              console.error('Error al eliminar:', error);
              Alert.alert('Error', error.response?.data?.detail || 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const getRolInfo = (usuario) => {
    if (usuario.rol === 'admin') {
      return { text: 'Admin', color: '#E53935', icon: 'shield' };
    } else if (usuario.rol === 'doctor') {
      return { text: 'Doctor', color: '#1E88E5', icon: 'medical' };
    }
    return { text: 'Usuario', color: '#757575', icon: 'person' };
  };

  const renderUsuario = ({ item }) => {
    const rolInfo = getRolInfo(item);

    return (
      <View style={[styles.usuarioCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.usuarioHeader}>
          <View style={[styles.avatar, { backgroundColor: rolInfo.color + '20' }]}>
            <Ionicons name={rolInfo.icon} size={28} color={rolInfo.color} />
          </View>

          <View style={styles.usuarioInfo}>
            <Text style={[styles.usuarioNombre, { color: theme.colors.text }]}>
              {item.nombre} {item.apellido}
            </Text>

            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: rolInfo.color + '20' }]}>
                <Text style={[styles.badgeText, { color: rolInfo.color }]}>
                  {rolInfo.text}
                </Text>
              </View>
            </View>

            {item.especialidad && (
              <View style={styles.infoRow}>
                <Ionicons name="medical-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  {item.especialidad}
                </Text>
              </View>
            )}

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
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleEliminar(item)}
          >
            <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
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
            placeholder="Buscar usuario..."
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

      {/* Filtros - Solo Todos, Doctores, Admins */}
      <View style={styles.filtrosContainer}>
        {['todos', 'doctores', 'admins'].map((rol) => (
          <TouchableOpacity
            key={rol}
            style={[
              styles.filtroButton,
              { backgroundColor: theme.colors.card },
              filtroRol === rol && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => handleFiltroRol(rol)}
          >
            <Text
              style={[
                styles.filtroText,
                { color: filtroRol === rol ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              {rol.charAt(0).toUpperCase() + rol.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={usuariosFiltrados}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarUsuarios} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </Text>
          </View>
        }
      />

      {/* Botón flotante */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CrearUsuario')}
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
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 10,
  },
  filtroButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filtroText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lista: {
    padding: 15,
    paddingBottom: 100,
  },
  usuarioCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  usuarioHeader: {
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
  usuarioInfo: {
    flex: 1,
  },
  usuarioNombre: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  infoText: {
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

export default GestionUsuariosScreen;