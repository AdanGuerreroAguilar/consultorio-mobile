// screens/admin/GestionPacientesScreen.js
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

const GestionPacientesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useFocusEffect(
    useCallback(() => {
      cargarPacientes();
    }, [])
  );

  const cargarPacientes = async () => {
    if (!refreshing) setLoading(true);

    try {
      // ✅ USAR ENDPOINT DE PACIENTES, NO USUARIOS
      const response = await client.get("/api/pacientes");
      console.log("👥 Pacientes cargados:", response.data?.length || 0);
      setPacientes(response.data || []);
    } catch (error) {
      console.error("❌ Error:", error);
      Alert.alert("Error", "No se pudieron cargar los pacientes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ ELIMINAR PACIENTE - FUNCIONAL
  const handleEliminar = (paciente) => {
    Alert.alert(
      "Eliminar Paciente",
      `¿Eliminar a ${paciente.nombre} ${paciente.apellido}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🗑️ Eliminando paciente ID:", paciente.id);
              
              const response = await client.delete(`/api/pacientes/${paciente.id}`);
              
              console.log("✅ Respuesta:", response.data);
              Alert.alert("Éxito", "Paciente eliminado correctamente");
              cargarPacientes();
            } catch (error) {
              console.error("❌ Error eliminando:", error.response?.data || error.message);
              Alert.alert("Error", error.response?.data?.detail || "No se pudo eliminar el paciente");
            }
          },
        },
      ]
    );
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    try {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return edad;
    } catch {
      return null;
    }
  };

  const pacientesFiltrados = pacientes.filter((p) => {
    if (!busqueda.trim()) return true;
    const term = busqueda.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(term) ||
      p.apellido?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.telefono?.includes(term)
    );
  });

  const renderPaciente = ({ item }) => {
    const edad = calcularEdad(item.fecha_nacimiento);

    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: "#2196F320" }]}>
            <Ionicons name="person" size={24} color="#2196F3" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.nombre, { color: theme.colors.text }]}>
              {item.nombre} {item.apellido}
            </Text>
            {item.email && (
              <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
                {item.email}
              </Text>
            )}
            <View style={styles.badges}>
              {edad && (
                <View style={[styles.badge, { backgroundColor: "#4CAF5020" }]}>
                  <Text style={[styles.badgeText, { color: "#4CAF50" }]}>{edad} años</Text>
                </View>
              )}
              {item.tipo_sangre && (
                <View style={[styles.badge, { backgroundColor: "#F4433620" }]}>
                  <Text style={[styles.badgeText, { color: "#F44336" }]}>{item.tipo_sangre}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {item.telefono && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {item.telefono}
            </Text>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.primary + "15" }]}
            onPress={() => navigation.navigate("EditarPaciente", { paciente: item })}
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
            placeholder="Buscar paciente..."
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
        <Text style={[styles.infoText2, { color: theme.colors.textSecondary }]}>
          {pacientesFiltrados.length} pacientes registrados
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={pacientesFiltrados}
        renderItem={renderPaciente}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              cargarPacientes();
            }}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No hay pacientes registrados
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("CrearPaciente")}
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
  infoText2: { fontSize: 13 },
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
  badges: { flexDirection: "row", marginTop: 6, gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 },
  infoText: { fontSize: 14 },
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

export default GestionPacientesScreen;