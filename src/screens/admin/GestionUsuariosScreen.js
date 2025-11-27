// screens/admin/GestionUsuariosScreen.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';
import { useFocusEffect } from '@react-navigation/native';

const GestionUsuariosScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // =========================================================
  // CARGAR USUARIOS CUANDO ENTRAMOS A LA PANTALLA
  // =========================================================
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
      setUsuariosFiltrados(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // BUSQUEDA LOCAL
  // =========================================================
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setUsuariosFiltrados(usuarios);
      return;
    }

    const filtered = usuarios.filter((u) =>
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(text.toLowerCase()) ||
      u.email?.toLowerCase().includes(text.toLowerCase())
    );

    setUsuariosFiltrados(filtered);
  };

  // =========================================================
  // ELIMINAR USUARIO
  // =========================================================
  const eliminarUsuario = (usuario) => {
    Alert.alert(
      "Confirmación",
      `¿Eliminar a "${usuario.nombre} ${usuario.apellido}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/usuarios/${usuario.id}`);

              // Eliminación instantánea sin recargar toda la lista
              setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
              setUsuariosFiltrados((prev) => prev.filter((u) => u.id !== usuario.id));

              Alert.alert("Éxito", "Usuario eliminado correctamente");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el usuario");
            }
          },
        },
      ]
    );
  };

  // =========================================================
  // TARJETA DEL USUARIO
  // =========================================================
  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.row}>
        <Ionicons name="person-circle-outline" size={40} color={theme.colors.primary} />
        <View style={{ marginLeft: 12 }}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {item.nombre} {item.apellido}
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
            {item.email}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate("EditarUsuario", { usuario: item })}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn]}
          onPress={() => eliminarUsuario(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // =========================================================
  // UI PRINCIPAL
  // =========================================================
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Buscar usuario..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={usuariosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("CrearUsuario")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default GestionUsuariosScreen;

// ===============================================
// ESTILOS
// ===============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9e9e9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  editBtn: {
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 10,
  },

  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
});
