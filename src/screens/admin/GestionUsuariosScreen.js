// screens/admin/GestionUsuariosScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import client from "../../api/client";

const GestionUsuariosScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
    }, [])
  );

  const cargarUsuarios = async () => {
    if (!refreshing) setLoading(true);

    try {
      const response = await client.get("/api/usuarios");
      const todosUsuarios = response.data || [];
      
      // ✅ FILTRAR: Solo mostrar admin y doctor (NO pacientes)
      const usuariosFiltrados = todosUsuarios.filter(
        (u) => u.rol === "admin" || u.rol === "doctor"
      );
      
      console.log("👥 Usuarios (admin/doctor):", usuariosFiltrados.length);
      setUsuarios(usuariosFiltrados);
    } catch (error) {
      console.error("❌ Error:", error);
      Alert.alert("Error", "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ ELIMINAR USUARIO - FUNCIONAL
  const handleEliminar = (usuario) => {
    Alert.alert(
      "Eliminar Usuario",
      `¿Eliminar a ${usuario.nombre} ${usuario.apellido}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🗑️ Eliminando usuario ID:", usuario.id);
              
              const response = await client.delete(`/api/usuarios/${usuario.id}`);
              
              console.log("✅ Respuesta:", response.data);
              Alert.alert("Éxito", "Usuario eliminado correctamente");
              cargarUsuarios();
            } catch (error) {
              console.error("❌ Error eliminando:", error.response?.data || error.message);
              Alert.alert("Error", error.response?.data?.detail || "No se pudo eliminar el usuario");
            }
          },
        },
      ]
    );
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case "admin": return "#9C27B0";
      case "doctor": return "#4CAF50";
      default: return "#2196F3";
    }
  };

  const getRolIcon = (rol) => {
    switch (rol) {
      case "admin": return "shield";
      case "doctor": return "medical";
      default: return "person";
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    if (!busqueda.trim()) return true;
    const term = busqueda.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(term) ||
      u.apellido?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.rol?.toLowerCase().includes(term)
    );
  });

  const renderUsuario = ({ item }) => {
    const rolColor = getRolColor(item.rol);

    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: rolColor + "20" }]}>
            <Ionicons name={getRolIcon(item.rol)} size={24} color={rolColor} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.nombre, { color: theme.colors.text }]}>
              {item.nombre} {item.apellido}
            </Text>
            <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
              {item.email}
            </Text>
            {item.especialidad && (
              <Text style={[styles.especialidad, { color: theme.colors.primary }]}>
                {item.especialidad}
              </Text>
            )}
          </View>
          <View style={[styles.rolBadge, { backgroundColor: rolColor + "20" }]}>
            <Text style={[styles.rolText, { color: rolColor }]}>
              {item.rol?.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.primary + "15" }]}
            onPress={() => navigation.navigate("EditarUsuario", { usuario: item })}
          >
            <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#F4433615" }]}
            onPress={() => handleEliminar(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#F44336" />
            <Text style={[styles.actionText, { color: "#F44336" }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Buscar usuario..."
            placeholderTextColor={theme.colors.textSecondary}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda("")}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoBar}>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          {usuariosFiltrados.length} usuarios (Admin y Doctores)
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={usuariosFiltrados}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              cargarUsuarios();
            }}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No hay usuarios
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("CrearUsuario")}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchContainer: { padding: 15, paddingBottom: 0 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16 },
  infoBar: { paddingHorizontal: 15, paddingVertical: 10 },
  infoText: { fontSize: 13 },
  lista: { padding: 15, paddingBottom: 80 },
  card: { padding: 15, borderRadius: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1, marginLeft: 12 },
  nombre: { fontSize: 16, fontWeight: "600" },
  email: { fontSize: 13, marginTop: 2 },
  especialidad: { fontSize: 12, marginTop: 2, fontWeight: "500" },
  rolBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  rolText: { fontSize: 10, fontWeight: "700" },
  cardActions: { flexDirection: "row", marginTop: 12, gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionText: { fontSize: 14, fontWeight: "500" },
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, marginTop: 15 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default GestionUsuariosScreen;