// screens/shared/PerfilScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import client from "../../api/client";

const PerfilScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout, updateUser } = useAuth();

  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [apellido, setApellido] = useState(user?.apellido || "");
  const [telefono, setTelefono] = useState(user?.telefono || "");

  // ============================================
  // GUARDAR CAMBIOS DEL PERFIL
  // ============================================
  const handleGuardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert("Error", "Nombre y apellido son obligatorios");
      return;
    }

    setLoading(true);

    try {
      await client.put("/api/perfil", {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || null,
      });

      await updateUser({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || null,
      });

      Alert.alert("Éxito", "Perfil actualizado correctamente");
      setEditando(false);
    } catch (error) {
      console.log("❌ Error:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CERRAR SESIÓN (CORREGIDO)
  // ============================================
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
              await logout();

              // ❗ YA NO usamos navigate().
              // Cuando logout() pone user = null,
              // AppNavigator redirige automáticamente a Login.

            } catch (error) {
              console.log("❌ Error en logout:", error);
            }
          },
        },
      ]
    );
  };

  const getRolIcon = () => {
    switch (user?.rol) {
      case "doctor": return "medical";
      case "admin": return "shield";
      default: return "person";
    }
  };

  const getRolColor = () => {
    switch (user?.rol) {
      case "doctor": return "#4CAF50";
      case "admin": return "#9C27B0";
      default: return "#2196F3";
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: getRolColor() + "20" }]}>
            <Ionicons name={getRolIcon()} size={50} color={getRolColor()} />
          </View>

          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {nombre} {apellido}
          </Text>

          <View style={[styles.rolBadge, { backgroundColor: getRolColor() + "20" }]}>
            <Text style={[styles.rolText, { color: getRolColor() }]}>
              {user?.rol?.toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        {/* BOTÓN EDITAR / CANCELAR */}
        {!editando ? (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setEditando(true)}
          >
            <Ionicons name="create-outline" color="#fff" size={20} />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.cancelEditButton, { backgroundColor: "#F44336" }]}
            onPress={() => {
              setNombre(user?.nombre || "");
              setApellido(user?.apellido || "");
              setTelefono(user?.telefono || "");
              setEditando(false);
            }}
          >
            <Ionicons name="close" color="#fff" size={20} />
            <Text style={styles.cancelEditButtonText}>Cancelar Edición</Text>
          </TouchableOpacity>
        )}

        {/* FORMULARIO */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Información Personal
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nombre</Text>
            {editando ? (
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={nombre}
                onChangeText={setNombre}
              />
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>{nombre}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Apellido</Text>
            {editando ? (
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={apellido}
                onChangeText={setApellido}
              />
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>{apellido}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Teléfono</Text>
            {editando ? (
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>{telefono || "No especificado"}</Text>
            )}
          </View>

          {user?.especialidad && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Especialidad</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{user.especialidad}</Text>
            </View>
          )}
        </View>

        {/* BOTÓN GUARDAR */}
        {editando && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: "#4CAF50" }, loading && { opacity: 0.6 }]}
            onPress={handleGuardar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" color="#fff" size={20} />
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* CONFIGURACIÓN */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Configuración</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" color={theme.colors.text} size={22} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>Modo Oscuro</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* BOTÓN CERRAR SESIÓN */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
          Versión 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

export default PerfilScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { alignItems: "center", marginBottom: 25 },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  userName: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  rolBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 15, marginBottom: 8 },
  rolText: { fontSize: 12, fontWeight: "700" },
  userEmail: { fontSize: 14 },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  editButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  cancelEditButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  cancelEditButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  section: { borderRadius: 15, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },

  field: { marginBottom: 20 },
  label: { fontSize: 12, marginBottom: 6 },
  value: { fontSize: 16, fontWeight: "500" },

  input: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
  },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingText: { fontSize: 16 },

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

  version: { textAlign: "center", marginTop: 20, marginBottom: 30, fontSize: 12 },
});
