// screens/paciente/MiPerfilScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

const MiPerfilScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [user])
  );

  const cargarPerfil = async () => {
    setLoading(true);
    setError(null);

    try {
      const pacienteId = user?.paciente_id;
      console.log("🆔 Cargando perfil paciente ID:", pacienteId);

      if (!pacienteId) {
        // Usar datos del usuario directamente
        setPaciente({
          nombre: user?.nombre || "Usuario",
          apellido: user?.apellido || "",
          email: user?.email || "",
          telefono: user?.telefono || "",
        });
        return;
      }

      try {
        const response = await client.get(`/api/pacientes/${pacienteId}`);
        console.log("✅ Datos del paciente:", response.data);
        setPaciente(response.data);
      } catch (apiError) {
        console.log("⚠️ Usando datos locales");
        setPaciente({
          id: pacienteId,
          nombre: user?.nombre || "Usuario",
          apellido: user?.apellido || "",
          email: user?.email || "",
          telefono: user?.telefono || "",
        });
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("No se pudo cargar el perfil");
      setPaciente({
        nombre: user?.nombre || "Usuario",
        apellido: user?.apellido || "",
        email: user?.email || "",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🔴 LOGOUT FUNCIONAL
  // ============================================
  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            console.log("🔓 Ejecutando logout...");
            await logout();
            console.log("✅ Logout completado");
            // La navegación se maneja automáticamente por AuthContext
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

  const formatearFecha = (fecha) => {
    if (!fecha) return "No especificada";
    try {
      return new Date(fecha).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return fecha;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  const edad = paciente ? calcularEdad(paciente.fecha_nacimiento) : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={cargarPerfil}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: "#FFFFFF" }]}>
            <Ionicons name="person" size={60} color={theme.colors.primary} />
          </View>
        </View>
        <Text style={styles.nombre}>
          {paciente?.nombre || user?.nombre} {paciente?.apellido || user?.apellido}
        </Text>
        {edad && <Text style={styles.edad}>{edad} años</Text>}
      </View>

      {/* Información personal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Información Personal
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Correo electrónico
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {paciente?.email || user?.email || "No especificado"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={24} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Teléfono
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {paciente?.telefono || "No especificado"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Fecha de nacimiento
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatearFecha(paciente?.fecha_nacimiento)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Información médica */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Información Médica
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="water-outline" size={24} color="#F44336" />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Tipo de sangre
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {paciente?.tipo_sangre || "No especificado"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="alert-circle-outline" size={24} color="#FFC107" />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Alergias
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {paciente?.alergias || "Ninguna registrada"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Opciones */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate("EditarPerfil", { paciente })}
        >
          <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.optionText, { color: theme.colors.text }]}>Editar Perfil</Text>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate("Ajustes")}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.optionText, { color: theme.colors.text }]}>Ajustes</Text>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* ============================================ */}
        {/* 🔴 BOTÓN DE CERRAR SESIÓN */}
        {/* ============================================ */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: "#F4433615" }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={[styles.logoutText, { color: "#F44336" }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16 },
  header: { paddingTop: 40, paddingBottom: 30, alignItems: "center" },
  avatarContainer: { marginBottom: 15 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  nombre: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  edad: { color: "#FFFFFF", fontSize: 16, opacity: 0.9 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  card: { borderRadius: 15, padding: 20, elevation: 2 },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoContent: { flex: 1, marginLeft: 15 },
  infoLabel: { fontSize: 12, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#E0E0E0", marginVertical: 15 },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  optionText: { flex: 1, fontSize: 16, fontWeight: "500", marginLeft: 15 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  logoutText: { flex: 1, fontSize: 16, fontWeight: "600", marginLeft: 15 },
});

export default MiPerfilScreen;