// screens/admin/DashboardAdminScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import client from "../../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "../../api/client";

const DashboardAdminScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    total_admins: 0,          // 🔧 MODIFICADO: ahora es admins, no usuarios
    total_doctores: 0,
    total_pacientes: 0,
    citas_hoy: 0,
  });

  useFocusEffect(
    useCallback(() => {
      cargarStats();
    }, [])
  );

  const cargarStats = async () => {
    if (!refreshing) setLoading(true);

    try {
      // Obtener estadísticas del backend
      const response = await client.get("/api/stats");
      console.log(" Stats:", response.data);

      // 🔧 Obtener usuarios y filtrar admins
      const resUsers = await client.get("/api/usuarios");
      const adminsCount = resUsers.data.filter(u => u.rol === "admin").length;

      setStats({
        total_admins: adminsCount,       // 🔧 SOLO admins
        total_doctores: response.data.total_doctores,
        total_pacientes: response.data.total_pacientes,
        citas_hoy: response.data.citas_hoy,
      });
    } catch (error) {
      console.error(" Error stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, salir",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("user");
              setAuthToken(null);
              await logout();
            } catch (error) {
              await AsyncStorage.clear();
              setAuthToken(null);
              await logout();
            }
          },
        },
      ]
    );
  };

  const StatCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );

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
            cargarStats();
          }}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.nombre || "Admin"}</Text>
            <Text style={styles.subtitle}>Panel de Administración</Text>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutHeaderBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {/* 🔧 Ahora muestra SOLO admins */}
        <StatCard
          icon="people"
          label="Admins"
          value={stats.total_admins}
          color="#2196F3"
          onPress={() => navigation.navigate("Usuarios", { rol: "admin" })}
        />

        <StatCard
          icon="medical"
          label="Doctores"
          value={stats.total_doctores}
          color="#4CAF50"
          onPress={() => navigation.navigate("Usuarios", { rol: "doctor" })}   // 🔧 SOLO doctores
        />

        <StatCard
          icon="person"
          label="Pacientes"
          value={stats.total_pacientes}
          color="#9C27B0"
          onPress={() => navigation.navigate("Pacientes")}
        />

        <StatCard
          icon="today"
          label="Citas Hoy"
          value={stats.citas_hoy}
          color="#FF9800"
          onPress={() => navigation.navigate("Citas")}
        />

        {/* ❌🔧 Eliminado totalmente el recuadro de “Pendientes” */}
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Acciones Rápidas
        </Text>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate("Usuarios", { screen: "CrearUsuario" })}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#2196F320" }]}>
            <Ionicons name="person-add" size={24} color="#2196F3" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
              Nuevo Usuario
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
              Agregar doctor o admin
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate("Pacientes", { screen: "CrearPaciente" })}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#9C27B020" }]}>
            <Ionicons name="person-add" size={24} color="#9C27B0" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
              Nuevo Paciente
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
              Registrar paciente
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate("Citas", { screen: "CrearCita" })}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#4CAF5020" }]}>
            <Ionicons name="calendar" size={24} color="#4CAF50" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
              Nueva Cita
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
              Programar cita
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Logout grande */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { padding: 25, paddingTop: 15 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "#FFFFFF", fontSize: 16, opacity: 0.9, marginTop: 5 },
  logoutHeaderBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 10,
  },

  statCard: {
    width: "47%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
    marginBottom: 5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: { fontSize: 28, fontWeight: "bold" },
  statLabel: { fontSize: 14, marginTop: 4 },

  section: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  actionContent: { flex: 1, marginLeft: 15 },
  actionTitle: { fontSize: 16, fontWeight: "600" },
  actionSubtitle: { fontSize: 13, marginTop: 2 },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F4433615",
    gap: 10,
  },
  logoutText: { fontSize: 16, fontWeight: "600", color: "#F44336" },
});

export default DashboardAdminScreen;
