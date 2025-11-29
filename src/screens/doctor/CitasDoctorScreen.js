// screens/doctor/CitasDoctorScreen.js

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import client from "../../api/client";

export default function CitasDoctorScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [citasHoy, setCitasHoy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarCitas = async () => {
    try {
      const doctorId = Number(user?.id);

      const res = await client.get("/api/citas");
      const todas = res.data || [];

      const hoy = new Date().toISOString().split("T")[0];

      const citasFiltradas = todas.filter(
        (c) =>
          Number(c.doctor_id) === doctorId &&
          c.fecha_hora?.startsWith(hoy)
      );

      setCitasHoy(citasFiltradas);
    } catch (err) {
      console.log(" Error cargando citas:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarCitas();
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Citas de Hoy
      </Text>

      {citasHoy.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
          <Ionicons
            name="calendar-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No tienes citas programadas hoy.
          </Text>
        </View>
      ) : (
        citasHoy.map((cita) => (
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
              <Text
                style={[styles.citaPaciente, { color: theme.colors.text }]}
              >
                {cita.paciente_nombre} {cita.paciente_apellido}
              </Text>

              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Text style={{ color: theme.colors.primary }}>
                  {cita.estado}
                </Text>
              </View>
            </View>

            <Text
              style={[styles.citaMotivo, { color: theme.colors.textSecondary }]}
            >
              {cita.motivo}
            </Text>

            <View style={styles.citaInfoRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.citaHora, { color: theme.colors.primary }]}
              >
                {formatearFecha(cita.fecha_hora)}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  emptyCard: {
    padding: 40,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 30,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
  },

  citaCard: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },
  citaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  citaPaciente: {
    fontSize: 18,
    fontWeight: "600",
  },
  citaMotivo: { fontSize: 14, marginBottom: 8 },
  citaInfoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  citaHora: { fontSize: 15, fontWeight: "600" },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
});
