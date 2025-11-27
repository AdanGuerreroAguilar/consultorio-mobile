// screens/admin/GestionCitasScreen.js
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

const GestionCitasScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [])
  );

  const cargarCitas = async () => {
    if (!refreshing) setLoading(true);

    try {
      const response = await client.get("/api/citas");
      console.log("📋 Citas cargadas:", response.data?.length || 0);
      setCitas(response.data || []);
    } catch (error) {
      console.error("❌ Error:", error);
      Alert.alert("Error", "No se pudieron cargar las citas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ CANCELAR CITA - FUNCIONAL
  const handleCancelar = (cita) => {
    Alert.alert(
      "Cancelar Cita",
      `¿Cancelar la cita de ${cita.paciente_nombre || "este paciente"}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🔄 Cancelando cita ID:", cita.id);
              
              const response = await client.put(`/api/citas/${cita.id}`, { 
                estado: "cancelada" 
              });
              
              console.log("✅ Respuesta:", response.data);
              Alert.alert("Éxito", "Cita cancelada correctamente");
              cargarCitas();
            } catch (error) {
              console.error("❌ Error cancelando:", error.response?.data || error.message);
              Alert.alert("Error", error.response?.data?.detail || "No se pudo cancelar la cita");
            }
          },
        },
      ]
    );
  };

  // ✅ ELIMINAR CITA - FUNCIONAL
  const handleEliminar = (cita) => {
    Alert.alert(
      "Eliminar Cita",
      `¿Eliminar permanentemente la cita #${cita.id}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🗑️ Eliminando cita ID:", cita.id);
              
              const response = await client.delete(`/api/citas/${cita.id}`);
              
              console.log("✅ Respuesta:", response.data);
              Alert.alert("Éxito", "Cita eliminada correctamente");
              cargarCitas();
            } catch (error) {
              console.error("❌ Error eliminando:", error.response?.data || error.message);
              Alert.alert("Error", error.response?.data?.detail || "No se pudo eliminar la cita");
            }
          },
        },
      ]
    );
  };

  const formatearFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fechaStr;
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      programada: "#2196F3",
      confirmada: "#4CAF50",
      pendiente: "#FF9800",
      completada: "#9E9E9E",
      cancelada: "#F44336",
    };
    return colores[estado?.toLowerCase()] || "#9E9E9E";
  };

  const citasFiltradas = citas.filter((c) => {
    if (!busqueda.trim()) return true;
    const term = busqueda.toLowerCase();
    return (
      c.paciente_nombre?.toLowerCase().includes(term) ||
      c.paciente_apellido?.toLowerCase().includes(term) ||
      c.doctor_nombre?.toLowerCase().includes(term) ||
      c.motivo?.toLowerCase().includes(term) ||
      c.estado?.toLowerCase().includes(term)
    );
  });

  const renderCita = ({ item }) => {
    const estadoColor = getEstadoColor(item.estado);
    const puedeModificar = !["cancelada", "completada"].includes(item.estado?.toLowerCase());

    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.estadoBadge, { backgroundColor: estadoColor + "20" }]}>
            <Text style={[styles.estadoText, { color: estadoColor }]}>
              {item.estado || "Sin estado"}
            </Text>
          </View>
          <Text style={[styles.citaId, { color: theme.colors.textSecondary }]}>
            #{item.id}
          </Text>
        </View>

        <Text style={[styles.motivo, { color: theme.colors.text }]}>
          {item.motivo || "Sin motivo"}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color="#2196F3" />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            {item.paciente_nombre} {item.paciente_apellido}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="medical" size={16} color="#4CAF50" />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Dr. {item.doctor_nombre} {item.doctor_apellido}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {formatearFecha(item.fecha_hora)}
          </Text>
        </View>

        <View style={styles.cardActions}>
          {puedeModificar && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#FF980015" }]}
              onPress={() => handleCancelar(item)}
            >
              <Ionicons name="close-circle-outline" size={18} color="#FF9800" />
              <Text style={[styles.actionText, { color: "#FF9800" }]}>Cancelar</Text>
            </TouchableOpacity>
          )}
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
            placeholder="Buscar cita..."
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
        <Text style={[styles.infoBarText, { color: theme.colors.textSecondary }]}>
          {citasFiltradas.length} citas
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={citasFiltradas}
        renderItem={renderCita}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              cargarCitas();
            }}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No hay citas registradas
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("CrearCita")}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchContainer: { padding: 15 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16 },
  infoBar: { paddingHorizontal: 15, paddingBottom: 5 },
  infoBarText: { fontSize: 13 },
  lista: { padding: 15, paddingTop: 5, paddingBottom: 80 },
  card: { padding: 15, borderRadius: 15, marginBottom: 12, elevation: 2 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  estadoBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  estadoText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  citaId: { fontSize: 12 },
  motivo: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 },
  infoText: { fontSize: 14 },
  cardActions: { flexDirection: "row", marginTop: 15, gap: 10 },
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

export default GestionCitasScreen;