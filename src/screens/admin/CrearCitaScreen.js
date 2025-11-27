// screens/admin/CrearCitaScreen.js
import React, { useState, useEffect } from "react";
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
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import client from "../../api/client";

export default function CrearCitaScreen({ navigation }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [doctores, setDoctores] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  const [formData, setFormData] = useState({
    paciente_id: "",
    doctor_id: "",
    motivo: "",
    fecha: "",
    hora: "",
    notas: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar doctores
      const resUsuarios = await client.get("/api/usuarios");
      const doctoresList = (resUsuarios.data || []).filter((u) => u.rol === "doctor");
      setDoctores(doctoresList);

      // Cargar pacientes
      const resPacientes = await client.get("/api/pacientes");
      setPacientes(resPacientes.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos");
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validarFormulario = () => {
    const { paciente_id, doctor_id, motivo, fecha, hora } = formData;

    if (!paciente_id) {
      Alert.alert("Error", "Selecciona un paciente");
      return false;
    }
    if (!doctor_id) {
      Alert.alert("Error", "Selecciona un doctor");
      return false;
    }
    if (!motivo.trim()) {
      Alert.alert("Error", "Ingresa el motivo de la cita");
      return false;
    }
    if (!fecha) {
      Alert.alert("Error", "Ingresa la fecha (YYYY-MM-DD)");
      return false;
    }
    if (!hora) {
      Alert.alert("Error", "Ingresa la hora (HH:MM)");
      return false;
    }

    // Validar formato fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      Alert.alert("Error", "Formato de fecha inválido. Usa YYYY-MM-DD");
      return false;
    }

    // Validar formato hora
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(hora)) {
      Alert.alert("Error", "Formato de hora inválido. Usa HH:MM");
      return false;
    }

    return true;
  };

  // ✅ CREAR CITA - FUNCIONAL
  const handleCrear = async () => {
    if (!validarFormulario()) return;

    setLoading(true);

    try {
      const { paciente_id, doctor_id, motivo, fecha, hora, notas } = formData;
      const fecha_hora = `${fecha}T${hora}:00`;

      const datos = {
        paciente_id: parseInt(paciente_id),
        doctor_id: parseInt(doctor_id),
        fecha_hora,
        motivo: motivo.trim(),
        notas: notas.trim() || null,
        estado: "programada",
        duracion_minutos: 30,
      };

      console.log("📝 Creando cita:", datos);
      
      await client.post("/api/citas", datos);

      Alert.alert("¡Éxito!", "Cita creada correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.detail || "No se pudo crear la cita");
    } finally {
      setLoading(false);
    }
  };

  const getFechaHoy = () => new Date().toISOString().split("T")[0];

  if (loadingData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Cargando datos...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary + "15" }]}>
        <Ionicons name="calendar" size={48} color={theme.colors.primary} />
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Nueva Cita</Text>
      </View>

      {/* Paciente */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Paciente *</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
          <Picker
            selectedValue={formData.paciente_id}
            onValueChange={(v) => handleInputChange("paciente_id", v)}
            style={{ color: theme.colors.text }}
          >
            <Picker.Item label="Selecciona un paciente" value="" />
            {pacientes.map((p) => (
              <Picker.Item key={p.id} label={`${p.nombre} ${p.apellido}`} value={p.id.toString()} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Doctor */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Doctor *</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
          <Picker
            selectedValue={formData.doctor_id}
            onValueChange={(v) => handleInputChange("doctor_id", v)}
            style={{ color: theme.colors.text }}
          >
            <Picker.Item label="Selecciona un doctor" value="" />
            {doctores.map((d) => (
              <Picker.Item
                key={d.id}
                label={`Dr. ${d.nombre} ${d.apellido}${d.especialidad ? ` - ${d.especialidad}` : ""}`}
                value={d.id.toString()}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Motivo */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Motivo *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          placeholder="Ej: Control general, dolor de cabeza..."
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.motivo}
          onChangeText={(v) => handleInputChange("motivo", v)}
          multiline
        />
      </View>

      {/* Fecha */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Fecha * (YYYY-MM-DD)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          placeholder={getFechaHoy()}
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.fecha}
          onChangeText={(v) => handleInputChange("fecha", v)}
        />
      </View>

      {/* Hora */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Hora * (HH:MM)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          placeholder="09:00"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.hora}
          onChangeText={(v) => handleInputChange("hora", v)}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      {/* Notas */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Notas (opcional)</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          placeholder="Notas adicionales..."
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.notas}
          onChangeText={(v) => handleInputChange("notas", v)}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Botones */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }, loading && { opacity: 0.6 }]}
        onPress={handleCrear}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.buttonText}>Crear Cita</Text>
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
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 15, fontSize: 16 },
  header: { alignItems: "center", padding: 25, borderRadius: 15, marginBottom: 25 },
  headerTitle: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { padding: 15, borderRadius: 12, fontSize: 16 },
  textArea: { padding: 15, borderRadius: 12, fontSize: 16, minHeight: 80, textAlignVertical: "top" },
  pickerContainer: { borderRadius: 12, overflow: "hidden" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
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