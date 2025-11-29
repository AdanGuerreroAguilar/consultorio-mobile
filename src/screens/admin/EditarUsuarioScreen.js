// screens/admin/EditarUsuarioScreen.js
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import client from "../../api/client";

const EditarUsuarioScreen = ({ route, navigation }) => {
  const { usuario } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [apellido, setApellido] = useState(usuario?.apellido || "");
  const [telefono, setTelefono] = useState(usuario?.telefono || "");
  const [especialidad, setEspecialidad] = useState(usuario?.especialidad || "");

  const getRolColor = () => {
    switch (usuario?.rol) {
      case "admin": return "#9C27B0";
      case "doctor": return "#4CAF50";
      default: return "#2196F3";
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert("Error", "Nombre y apellido son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const datos = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || null,
        especialidad: especialidad.trim() || null,
      };

      console.log(" Actualizando usuario:", usuario.id, datos);
      
      await client.put(`/api/usuarios/${usuario.id}`, datos);

      Alert.alert("Éxito", "Usuario actualizado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(" Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.detail || "No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: getRolColor() + "20" }]}>
          <Ionicons
            name={usuario?.rol === "doctor" ? "medical" : "shield"}
            size={40}
            color={getRolColor()}
          />
        </View>
        <View style={[styles.rolBadge, { backgroundColor: getRolColor() + "20" }]}>
          <Text style={[styles.rolText, { color: getRolColor() }]}>
            {usuario?.rol?.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
          {usuario?.email}
        </Text>
      </View>

      {/* Formulario */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Información Personal
        </Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nombre *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Apellido *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={apellido}
            onChangeText={setApellido}
            placeholder="Apellido"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Teléfono</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Teléfono"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        {usuario?.rol === "doctor" && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Especialidad</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={especialidad}
              onChangeText={setEspecialidad}
              placeholder="Especialidad médica"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        )}
      </View>

      {/* Botones */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }, loading && { opacity: 0.6 }]}
        onPress={handleGuardar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Guardar Cambios</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: theme.colors.border }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { alignItems: "center", marginBottom: 25 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  rolBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 15, marginBottom: 8 },
  rolText: { fontSize: 12, fontWeight: "700" },
  email: { fontSize: 14 },
  section: { borderRadius: 15, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  field: { marginBottom: 18 },
  label: { fontSize: 12, marginBottom: 6 },
  input: {
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600" },
});

export default EditarUsuarioScreen;