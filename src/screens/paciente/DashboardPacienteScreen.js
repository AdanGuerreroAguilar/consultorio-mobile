// screens/paciente/DashboardPacienteScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";

const DashboardPacienteScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [proximaCita, setProximaCita] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [historialCitas, setHistorialCitas] = useState([]);
  const [ultimosSignos, setUltimosSignos] = useState(null);
  const [citaEnDosHoras, setCitaEnDosHoras] = useState(false);

  const normalizarFecha = (f) => (f ? f.replace(" ", "T") : null);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const resCitas = await apiClient.get("/api/citas");
      const citas = resCitas.data || [];

      const citasPaciente = citas.filter(
        (c) => Number(c.paciente_id) === Number(user.paciente_id || user.id)
      );

      const ahora = new Date();

      const futuras = citasPaciente
        .filter((c) => {
          const fechaCita = new Date(normalizarFecha(c.fecha_hora));
          const esFutura = fechaCita >= ahora;
          const estadoValido = ["Programada", "Confirmada"].includes(c.estado);
          return esFutura && estadoValido;
        })
        .sort(
          (a, b) =>
            new Date(normalizarFecha(a.fecha_hora)) -
            new Date(normalizarFecha(b.fecha_hora))
        );

      const siguiente = futuras[0] || null;
      setProximaCita(siguiente);

      // Aviso si la próxima cita es en <= 2 horas
      if (siguiente) {
        const fechaCita = new Date(normalizarFecha(siguiente.fecha_hora));
        const diffMs = fechaCita - ahora;
        const dosHorasMs = 2 * 60 * 60 * 1000;

        if (diffMs > 0 && diffMs <= dosHorasMs) {
          setCitaEnDosHoras(true);
        } else {
          setCitaEnDosHoras(false);
        }
      } else {
        setCitaEnDosHoras(false);
      }

      if (siguiente) {
        try {
          const resDoc = await apiClient.get(`/api/usuarios/${siguiente.doctor_id}`);
          setDoctorInfo(resDoc.data || null);
        } catch (err) {
          console.error("Error al cargar doctor:", err);
        }
      }

      const pasadas = citasPaciente
        .filter((c) => {
          const fechaCita = new Date(normalizarFecha(c.fecha_hora));
          return fechaCita < ahora || c.estado === "Completada";
        })
        .sort(
          (a, b) =>
            new Date(normalizarFecha(b.fecha_hora)) -
            new Date(normalizarFecha(a.fecha_hora))
        )
        .slice(0, 5);

      setHistorialCitas(pasadas);

      try {
        const resSignos = await apiClient.get("/api/signos-vitales");
        const listaSignos = resSignos.data || [];

        const signosPaciente = listaSignos
          .filter(
            (s) =>
              Number(s.paciente_id) === Number(user.paciente_id || user.id)
          )
          .sort(
            (a, b) =>
              new Date(normalizarFecha(b.created_at)) -
              new Date(normalizarFecha(a.created_at))
          );

        setUltimosSignos(signosPaciente[0] || null);
      } catch (err) {
        console.error("Error al cargar signos vitales:", err);
      }
    } catch (error) {
      console.log("Error cargando datos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(normalizarFecha(fechaStr));
    return fecha.toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      Programada: { color: "#FFA500", label: "Programada" },
      Confirmada: { color: "#4CAF50", label: "Confirmada" },
      En_Proceso: { color: "#2196F3", label: "En Proceso" },
      Completada: { color: "#9E9E9E", label: "Completada" },
    };
    return estados[estado] || { color: "#999", label: estado };
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
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
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[theme.colors.primary, "#4facfe"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Hola, {user.nombre}</Text>
        <Text style={styles.headerSubtitle}>Panel del Paciente</Text>
      </LinearGradient>

      {/* Aviso de cita dentro de 2 horas */}
      {citaEnDosHoras && proximaCita && (
        <View
          style={[
            styles.alertBox,
            { backgroundColor: "#fff3cd", borderColor: "#ffcc00" },
          ]}
        >
          <Ionicons name="alert-circle" size={22} color="#d58512" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.alertTitle}>Cita próxima</Text>
            <Text style={styles.alertText}>
              Tienes una cita programada en menos de 2 horas:
            </Text>
            <Text style={styles.alertTextStrong}>
              {formatearFecha(proximaCita.fecha_hora)}
            </Text>
          </View>
        </View>
      )}

      {/* Próxima Cita */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Próxima Cita
        </Text>

        {!proximaCita ? (
          <View
            style={[styles.card, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons name="calendar-outline" size={38} color="#999" />
            <Text style={styles.emptyText}>No tienes citas próximas</Text>
          </View>
        ) : (
          <LinearGradient
            colors={["#89f7fe", "#66a6ff"]}
            style={[styles.card, { padding: 20 }]}
          >
            <View style={styles.estadoBadge}>
              <Text style={styles.estadoText}>
                {getEstadoBadge(proximaCita.estado).label}
              </Text>
            </View>

            <Text style={styles.cardTitle}>
              {formatearFecha(proximaCita.fecha_hora)}
            </Text>

            <Text style={styles.cardSubtitle}>
              Motivo: {proximaCita.motivo}
            </Text>

            {doctorInfo && (
              <Text style={styles.cardSubtitle}>
                Doctor: {doctorInfo.nombre} {doctorInfo.apellido}
              </Text>
            )}
          </LinearGradient>
        )}
      </View>

      {/* Signos Vitales */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Últimos Signos Vitales
        </Text>

        {!ultimosSignos ? (
          <View
            style={[styles.card, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons name="fitness-outline" size={38} color="#bbb" />
            <Text style={styles.emptyText}>Sin registros aún</Text>
          </View>
        ) : (
          <View style={styles.signosCard}>
            <View style={styles.signoRow}>
              <Text style={styles.signoLabel}>Peso:</Text>
              <Text style={styles.signoValue}>{ultimosSignos.peso} kg</Text>
            </View>

            <View style={styles.signoRow}>
              <Text style={styles.signoLabel}>Altura:</Text>
              <Text style={styles.signoValue}>{ultimosSignos.altura} m</Text>
            </View>

            <View style={styles.signoRow}>
              <Text style={styles.signoLabel}>Presión:</Text>
              <Text style={styles.signoValue}>
                {ultimosSignos.presion_sistolica}/
                {ultimosSignos.presion_diastolica}
              </Text>
            </View>

            <View style={styles.signoRow}>
              <Text style={styles.signoLabel}>Temp:</Text>
              <Text style={styles.signoValue}>
                {ultimosSignos.temperatura} °C
              </Text>
            </View>

            <View style={styles.signoRow}>
              <Text style={styles.signoLabel}>SpO2:</Text>
              <Text style={styles.signoValue}>
                {ultimosSignos.saturacion_oxigeno}%
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Historial de Citas */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Historial de Citas
        </Text>

        {historialCitas.length === 0 ? (
          <View
            style={[styles.card, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons name="time-outline" size={38} color="#bbb" />
            <Text style={styles.emptyText}>Sin citas anteriores</Text>
          </View>
        ) : (
          historialCitas.map((cita) => {
            const estadoInfo = getEstadoBadge(cita.estado);
            return (
              <View key={cita.id} style={styles.histCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={estadoInfo.color}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.histFecha}>
                    {formatearFecha(cita.fecha_hora)}
                  </Text>
                  <Text style={styles.histMotivo}>
                    Motivo: {cita.motivo}
                  </Text>
                  <Text
                    style={[
                      styles.histEstado,
                      { color: estadoInfo.color },
                    ]}
                  >
                    {estadoInfo.label}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default DashboardPacienteScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    padding: 25,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  headerSubtitle: { color: "#e0f7ff", fontSize: 14, marginTop: 5 },

  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  alertTitle: {
    fontWeight: "700",
    color: "#8a6d3b",
    marginBottom: 2,
  },
  alertText: {
    fontSize: 13,
    color: "#8a6d3b",
  },
  alertTextStrong: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8a6d3b",
    marginTop: 3,
  },

  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },

  card: {
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 4,
  },

  emptyText: {
    fontSize: 15,
    marginTop: 10,
    color: "#777",
    textAlign: "center",
  },

  estadoBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  estadoText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  cardTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  cardSubtitle: { color: "#f0faff", marginTop: 5 },

  signosCard: {
    backgroundColor: "#e3f2fd",
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  signoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  signoLabel: { color: "#0d47a1", fontWeight: "600" },
  signoValue: { color: "#1a237e", fontWeight: "700" },

  histCard: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  histFecha: { fontWeight: "700", color: "#6a4" },
  histMotivo: { color: "#444", fontSize: 13 },
  histEstado: { fontSize: 12, fontWeight: "600", marginTop: 2 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
