import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../api/client";
import { useTheme } from "../../context/ThemeContext";

export default function CrearNotaScreen({ route, navigation }) {
  const { pacienteId, doctorId, citaId } = route.params;
  const { theme } = useTheme();

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [loading, setLoading] = useState(false);

  const guardarNota = async () => {
    if (!titulo.trim()) {
      Alert.alert("Error", "El título es obligatorio");
      return;
    }
    if (!contenido.trim()) {
      Alert.alert("Error", "La nota médica no puede estar vacía");
      return;
    }

    const datos = {
      paciente_id: pacienteId,
      cita_id: citaId || null,
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      diagnostico: diagnostico.trim() || null,
      tratamiento: tratamiento.trim() || null,
    };

    try {
      setLoading(true);
      console.log(" Enviando nota médica:", datos);

      // RUTA CORRECTA SEGÚN TU API:
      await apiClient.post("/api/notas", datos);

      Alert.alert("Éxito", "Nota médica registrada correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(" Error al registrar nota:", error.response?.data || error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "No se pudo guardar la nota médica"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Crear Nota Médica
      </Text>

      {/* TÍTULO */}
      <Text style={[styles.label, { color: theme.colors.text }]}>Título *</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Ej: Dolor abdominal agudo"
        placeholderTextColor={theme.colors.textSecondary}
        value={titulo}
        onChangeText={setTitulo}
      />

      {/* CONTENIDO */}
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Nota Médica *
      </Text>
      <TextInput
        style={[
          styles.textArea,
          {
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Escribe aquí todas las observaciones del paciente..."
        placeholderTextColor={theme.colors.textSecondary}
        value={contenido}
        onChangeText={setContenido}
        multiline
        textAlignVertical="top"
      />

      {/* DIAGNÓSTICO */}
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Diagnóstico (opcional)
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Ej: Gastroenteritis"
        placeholderTextColor={theme.colors.textSecondary}
        value={diagnostico}
        onChangeText={setDiagnostico}
      />

      {/* TRATAMIENTO */}
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Tratamiento (opcional)
      </Text>
      <TextInput
        style={[
          styles.textArea,
          {
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Ej: Paracetamol por 5 días..."
        placeholderTextColor={theme.colors.textSecondary}
        value={tratamiento}
        onChangeText={setTratamiento}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* BOTÓN GUARDAR */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: theme.colors.primary }]}
        onPress={guardarNota}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.btnText}>Guardar Nota</Text>
          </>
        )}
      </TouchableOpacity>

      {/* CANCELAR */}
      <TouchableOpacity
        style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={[styles.cancelBtnText, { color: theme.colors.text }]}>
          Cancelar
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    minHeight: 120,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  btn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelBtn: {
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
