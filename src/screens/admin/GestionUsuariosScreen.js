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
import apiClient from '../../api/client';

const GestionUsuariosScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos'); // todos, doctores, admins, staff

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
      filtered = filtered.filter(u => u.especialidad);
    } else if (rol === 'admins') {
      filtered = filtered.filter(u => !u.especialidad && u.email.toLowerCase().includes('admin'));
    } else if (rol === 'staff') {
      filtered = filtered.filter(u => !u.especialidad && !u.email.toLowerCase().includes('admin'));
    }

    // Filtrar por búsqueda
    if (busqueda.trim() !== '') {
      filtered = filtered.filter(
        u =>
          u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
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

  const handleToggleEstado = async (usuarioId, estadoActual) => {
    Alert.alert(
      estadoActual ? 'Desactivar Usuario' : 'Activar Usuario',
      `¿Estás seguro de que deseas ${estadoActual ? 'desactivar' : 'activar'} este usuario?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: estadoActual ? 'Desactivar' : 'Activar',
          style: estadoActual ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await apiClient.put(`/usuarios/${usuarioId}`, {
                activo: !estadoActual,
              });
              Alert.alert('Éxito', 'Estado actualizado correctamente');
              cargarUsuarios();
            } catch (error) {
              console.error('Error al actualizar estado:', error);
              Alert.alert('Error', 'No se pudo actualizar el estado');
            }
          },
        },
      ]
    );
  };

  const getRolBadge = (usuario) => {
    if (usuario.especialidad) {
      return { text: 'Doctor', color: theme.colors.primary };
    } else if (usuario.email.toLowerCase().includes('admin')) {
      return { text: 'Admin', color: theme.colors.danger };
    } else {
      return { text: 'Staff', color: theme.colors.success };
    }
  };

  const renderUsuario = ({ item }) => {
    const rolBadge = getRolBadge(item);

    return (
      <TouchableOpacity
        style={[styles.usuarioCard, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate('DetalleUsuario', { usuarioId: item.id })}
      >
        <View style={styles.usuarioHeader}>
          <View style={[styles.avatar, { backgroundColor: rolBadge.color + '20' }]}>
            <Ionicons
              name={item.especialidad ? 'medical' : 'person'}
              size={28}
              color={rolBadge.color}
            />
          </View>

          <View style={styles.usuarioInfo}>
            <Text style={[styles.usuarioNombre, { color: theme.colors.text }]}>
              {item.nombre} {item.apellido}
            </Text>

            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: rolBadge.color + '20' }]}>
                <Text style={[styles.badgeText, { color: rolBadge.color }]}>
                  {rolBadge.text}
                </Text>
              </View>

              {!item.activo && (
                <View style={[styles.badge, { backgroundColor: theme.colors.textSecondary + '20' }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                    Inactivo
                  </Text>
                </View>
              )}
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
            style={styles.menuButton}
            onPress={() => handleToggleEstado(item.id, item.activo)}
          >
            <Ionicons
              name={item.activo ? 'power' : 'power-outline'}
              size={24}
              color={item.activo ? theme.colors.success : theme.colors.textSecondary}
            />
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

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[
            styles.filtroButton,
            { backgroundColor: theme.colors.card },
            filtroRol === 'todos' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleFiltroRol('todos')}
        >
          <Text
            style={[
              styles.filtroText,
              { color: filtroRol === 'todos' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            { backgroundColor: theme.colors.card },
            filtroRol === 'doctores' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleFiltroRol('doctores')}
        >
          <Text
            style={[
              styles.filtroText,
              { color: filtroRol === 'doctores' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Doctores
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            { backgroundColor: theme.colors.card },
            filtroRol === 'admins' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleFiltroRol('admins')}
        >
          <Text
            style={[
              styles.filtroText,
              { color: filtroRol === 'admins' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Admins
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            { backgroundColor: theme.colors.card },
            filtroRol === 'staff' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleFiltroRol('staff')}
        >
          <Text
            style={[
              styles.filtroText,
              { color: filtroRol === 'staff' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Staff
          </Text>
        </TouchableOpacity>
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
    paddingVertical: 10,
    borderRadius: 10,
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
    gap: 8,
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
  usuarioCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
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
  menuButton: {
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
