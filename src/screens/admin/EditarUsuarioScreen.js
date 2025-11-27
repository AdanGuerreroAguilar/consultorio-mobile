// screens/admin/EditarUsuarioScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../api/client";

const roles = ["admin", "doctor", "paciente"];

const EditarUsuarioScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { usuario } = route.params;

  const [nombre, setNombre] = useState(usuario.nombre);
  const [apellido, setApellido] = useState(usuario.apellido);
  const [email, setEmail] = useState(usuario.email);
  const [rol, setRol] = useState(usuario.rol);
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ============================================================
  // VALIDACIONES
  // ============================================================
  const validar = () => {
    if (!nombre.trim()) return "El nombre es obligatorio";
    if (!apellido.trim()) return "El apellido es obligatorio";

    if (!email.trim()) return "El email es obligatorio";
    if (!email.includes("@")) return "El correo no es válido";

    if (!rol) return "Selecciona un rol";

    if (password.length > 0 && password.length < 6) {
      return "La nueva contraseña debe tener al menos 6 caracteres";
    }

    return null;
  };

  // ============================================================
  // GUARDAR CAMBIOS (con confirmación)
  // ============================================================
  const handleGuardar = () => {
    const error = validar();
    if (error) return Alert.alert("Error", error);

    Alert.alert(
      "Confirmación",
      "¿Guardar cambios del usuario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Guardar",
          onPress: () => actualizarUsuario(),
        },
      ]
    );
  };

  const actualizarUsuario = async () => {
    setLoading(true);
    try {
      const datos = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        rol,
      };

      // Agregar contraseña solo si se cambió
      if (password.trim()) {
        datos.password = password.trim();
      }

      await apiClient.put(`/usuarios/${usuario.id}`, datos);

      Alert.alert("Éxito", "Cambios guardados", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "No se pudieron guardar los cambios"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Editar Usuario
        </Text>

        {/* Nombre */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
            ]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Apellido */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Apellido *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
            ]}
            value={apellido}
            onChangeText={setApellido}
            placeholder="Apellido"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Rol */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Rol *</Text>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Picker
              selectedValue={rol}
              onValueChange={(value) => setRol(value)}
              style={{ color: theme.colors.text }}
            >
              <Picker.Item label="Seleccionar rol..." value="" />
              {roles.map((r) => (
                <Picker.Item key={r} label={r.toUpperCase()} value={r} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Contraseña */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Nueva Contraseña (opcional)
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="Dejar en blanco para no cambiar"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry
          />
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.primary },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleGuardar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={22} color="#FFF" />
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditarUsuarioScreen;

// ============================================================
// ESTILOS
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
  },

  inputGroup: { marginBottom: 15 },

  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },

  pickerContainer: {
    borderRadius: 12,
  },

  saveButton: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  buttonDisabled: { opacity: 0.6 },
});
