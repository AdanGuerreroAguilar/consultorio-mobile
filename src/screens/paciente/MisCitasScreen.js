// screens/paciente/MisCitasScreen.js
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import client from "../../api/client";

const MisCitasScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState("todas");

  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [filtro, user])
  );

  const cargarCitas = async () => {
    if (!refreshing) setLoading(true);
    
    try {
      console.log("👤 Usuario:", user?.email, "| paciente_id:", user?.paciente_id);

      // Obtener todas las citas
      const response = await client.get("/api/citas");
      const todasLasCitas = response.data || [];

      console.log("📋 Total citas en BD:", todasLasCitas.length);

      // Filtrar las citas del paciente actual
      const pacienteId = user?.paciente_id;
      
      let misCitas = todasLasCitas;
      if (pacienteId) {
        misCitas = todasLasCitas.filter(
          (cita) => cita.paciente_id === pacienteId || cita.paciente_id === parseInt(pacienteId)
        );
      }

      console.log("📌 Mis citas:", misCitas.length);

      // Aplicar filtro de tiempo
      const ahora = new Date();
      let citasFiltradas = misCitas;

      if (filtro === "proximas") {
        citasFiltradas = misCitas.filter(
          (cita) => new Date(cita.fecha_hora) >= ahora && cita.estado !== "cancelada"
        );
      } else if (filtro === "pasadas") {
        citasFiltradas = misCitas.filter((cita) => new Date(cita.fecha_hora) < ahora);
      }

      // Ordenar
      citasFiltradas.sort((a, b) => {
        if (filtro === "proximas") {
          return new Date(a.fecha_hora) - new Date(b.fecha_hora);
        }
        return new Date(b.fecha_hora) - new Date(a.fecha_hora);
      });

      setCitas(citasFiltradas);
    } catch (error) {
      console.error("❌ Error al cargar citas:", error.response?.data || error.message);
      if (error.response?.status !== 401) {
        Alert.alert("Error", "No se pudieron cargar las citas");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelarCita = (citaId) => {
    Alert.alert("Cancelar Cita", "¿Estás seguro de que deseas cancelar esta cita?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            await client.put(`/api/citas/${citaId}`, { estado: "cancelada" });
            Alert.alert("Éxito", "Cita cancelada correctamente");
            cargarCitas();
          } catch (error) {
            console.error("Error al cancelar:", error);
            Alert.alert("Error", "No se pudo cancelar la cita");
          }
        },
      },
    ]);
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
      pendiente: "#FFC107",
      programada: "#2196F3",
      confirmada: "#4CAF50",
      completada: "#9E9E9E",
      cancelada: "#F44336",
    };
    return colores[estado?.toLowerCase()] || "#9E9E9E";
  };

  const renderCita = ({ item }) => {
    const esFutura = new Date(item.fecha_hora) >= new Date();
    const estadoColor = getEstadoColor(item.estado);

    return (
      <TouchableOpacity
        style={[styles.citaCard, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate("DetalleCita", { citaId: item.id })}
      >
        <View style={styles.citaHeader}>
          <View style={[styles.estadoBadge, { backgroundColor: estadoColor + "20" }]}>
            <Text style={[styles.estadoText, { color: estadoColor }]}>
              {item.estado || "Sin estado"}
            </Text>
          </View>

          {esFutura && item.estado !== "cancelada" && item.estado !== "completada" && (
            <TouchableOpacity onPress={() => handleCancelarCita(item.id)} style={styles.cancelButton}>
              <Ionicons name="close-circle" size={24} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.citaMotivo, { color: theme.colors.text }]}>
          {item.motivo || "Consulta médica"}
        </Text>

        <View style={styles.citaInfo}>
          <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.citaInfoText, { color: theme.colors.textSecondary }]}>
            {formatearFecha(item.fecha_hora)}
          </Text>
        </View>

        {(item.doctor_nombre || item.doctor_apellido) && (
          <View style={styles.citaInfo}>
            <Ionicons name="person-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.citaInfoText, { color: theme.colors.textSecondary }]}>
              Dr. {item.doctor_nombre} {item.doctor_apellido}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && citas.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Cargando citas...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filtros */}
      <View style={styles.filtros}>
        {["todas", "proximas", "pasadas"].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.filtroButton,
              filtro === tipo && { backgroundColor: theme.colors.primary },
              { borderColor: theme.colors.primary },
            ]}
            onPress={() => setFiltro(tipo)}
          >
            <Text
              style={[
                styles.filtroText,
                filtro === tipo ? { color: "#FFFFFF" } : { color: theme.colors.primary },
              ]}
            >
              {tipo === "todas" ? "Todas" : tipo === "proximas" ? "Próximas" : "Pasadas"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={citas}
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
              {filtro === "todas"
                ? "No tienes citas registradas"
                : filtro === "proximas"
                ? "No tienes citas próximas"
                : "No tienes citas pasadas"}
            </Text>
            <TouchableOpacity
              style={[styles.nuevaCitaBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate("CrearCita")}
            >
              <Text style={styles.nuevaCitaBtnText}>Agendar una cita</Text>
            </TouchableOpacity>
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
  loadingText: { marginTop: 10, fontSize: 16 },
  filtros: { flexDirection: "row", padding: 15, gap: 10 },
  filtroButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
  },
  filtroText: { fontWeight: "600", fontSize: 14 },
  lista: { padding: 15, paddingBottom: 80 },
  citaCard: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  citaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  estadoBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  estadoText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  cancelButton: { padding: 4 },
  citaMotivo: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  citaInfo: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  citaInfoText: { fontSize: 14, marginLeft: 10 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, marginTop: 15, marginBottom: 20, textAlign: "center" },
  nuevaCitaBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  nuevaCitaBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
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

export default MisCitasScreen;