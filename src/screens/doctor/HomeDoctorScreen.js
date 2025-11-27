// screens/doctor/HomeDoctorScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import client from "../../api/client";

const HomeDoctorScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    citasHoy: 0,
    citasPendientes: 0,
    totalPacientes: 0,
  });
  const [citasProximas, setCitasProximas] = useState([]);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [user])
  );

  const cargarDatos = async () => {
    if (!refreshing) setLoading(true);

    try {
      // Obtener todas las citas
      const resCitas = await client.get("/api/citas");
      const todasCitas = resCitas.data || [];

      // Filtrar citas del doctor actual
      const misCitas = todasCitas.filter(
        (c) => c.doctor_id === user?.id || c.doctor_id === parseInt(user?.id)
      );

      // Citas de hoy
      const hoy = new Date().toISOString().split("T")[0];
      const citasHoy = misCitas.filter((c) => c.fecha_hora?.startsWith(hoy));

      // Citas pendientes (futuras)
      const ahora = new Date();
      const pendientes = misCitas.filter(
        (c) => new Date(c.fecha_hora) >= ahora && c.estado !== "cancelada"
      );

      // Próximas 5 citas
      const proximas = pendientes
        .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
        .slice(0, 5);

      // Total pacientes
      const resPacientes = await client.get("/api/pacientes");
      const totalPacientes = resPacientes.data?.length || 0;

      setStats({
        citasHoy: citasHoy.length,
        citasPendientes: pendientes.length,
        totalPacientes,
      });
      setCitasProximas(proximas);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            cargarDatos();
          }}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.greeting}>
          Hola, Dr. {user?.nombre} {user?.apellido}
        </Text>
        {user?.especialidad && (
          <Text style={styles.specialty}>{user.especialidad}</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: "#2196F320" }]}>
            <Ionicons name="today" size={24} color="#2196F3" />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {stats.citasHoy}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Citas Hoy
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: "#FFC10720" }]}>
            <Ionicons name="time" size={24} color="#FFC107" />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {stats.citasPendientes}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Pendientes
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: "#4CAF5020" }]}>
            <Ionicons name="people" size={24} color="#4CAF50" />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {stats.totalPacientes}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Pacientes
          </Text>
        </View>
      </View>

      {/* Próximas citas */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Próximas Citas
        </Text>

        {citasProximas.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No tienes citas próximas
            </Text>
          </View>
        ) : (
          citasProximas.map((cita) => (
            <TouchableOpacity
              key={cita.id}
              style={[styles.citaCard, { backgroundColor: theme.colors.card }]}
              onPress={() =>
                navigation.navigate("Pacientes", {
                  screen: "FichaPaciente",
                  params: { pacienteId: cita.paciente_id },
                })
              }
            >
              <View style={styles.citaHeader}>
                <Text style={[styles.citaPaciente, { color: theme.colors.text }]}>
                  {cita.paciente_nombre} {cita.paciente_apellido}
                </Text>
                <View style={[styles.estadoBadge, { backgroundColor: "#2196F320" }]}>
                  <Text style={[styles.estadoText, { color: "#2196F3" }]}>
                    {cita.estado}
                  </Text>
                </View>
              </View>
              <Text style={[styles.citaMotivo, { color: theme.colors.textSecondary }]}>
                {cita.motivo}
              </Text>
              <View style={styles.citaFecha}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.citaFechaText, { color: theme.colors.primary }]}>
                  {formatearFecha(cita.fecha_hora)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 25, paddingTop: 40 },
  greeting: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  specialty: { color: "#FFFFFF", fontSize: 16, opacity: 0.9, marginTop: 5 },
  statsContainer: { flexDirection: "row", padding: 15, gap: 10 },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 24, fontWeight: "bold" },
  statLabel: { fontSize: 12, marginTop: 4 },
  section: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  emptyCard: {
    padding: 40,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
  },
  emptyText: { fontSize: 16, marginTop: 15 },
  citaCard: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
  },
  citaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  citaPaciente: { fontSize: 16, fontWeight: "600" },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  estadoText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  citaMotivo: { fontSize: 14, marginBottom: 8 },
  citaFecha: { flexDirection: "row", alignItems: "center", gap: 6 },
  citaFechaText: { fontSize: 14, fontWeight: "500" },
});

export default HomeDoctorScreen;