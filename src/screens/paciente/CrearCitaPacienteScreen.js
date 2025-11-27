// screens/paciente/CrearCitaPacienteScreen.js
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
import { useAuth } from "../../context/AuthContext";
import client from "../../api/client";

export default function CrearCitaPacienteScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingDoctores, setLoadingDoctores] = useState(true);
  const [doctores, setDoctores] = useState([]);

  const [formData, setFormData] = useState({
    motivo: "",
    fecha: "",
    hora: "",
    doctor_id: "",
    notas: "",
  });

  useEffect(() => {
    cargarDoctores();
  }, []);

  const cargarDoctores = async () => {
    try {
      // Usar endpoint de doctores o filtrar usuarios
      const response = await client.get("/api/doctores");
      setDoctores(response.data || []);
    } catch (error) {
      console.error("Error al cargar doctores:", error);
      // Fallback: obtener usuarios con rol doctor
      try {
        const res = await client.get("/api/usuarios?rol=doctor");
        setDoctores(res.data || []);
      } catch (e) {
        Alert.alert("Error", "No se pudieron cargar los doctores");
      }
    } finally {
      setLoadingDoctores(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validarFormulario = () => {
    const { motivo, fecha, hora, doctor_id } = formData;

    if (!motivo.trim()) {
      Alert.alert("Error", "Por favor ingresa el motivo de la cita");
      return false;
    }

    if (!fecha) {
      Alert.alert("Error", "Por favor ingresa la fecha");
      return false;
    }

    if (!hora) {
      Alert.alert("Error", "Por favor ingresa la hora");
      return false;
    }

    if (!doctor_id) {
      Alert.alert("Error", "Por favor selecciona un doctor");
      return false;
    }

    // Validar formato de fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha)) {
      Alert.alert("Error", "Formato de fecha inválido. Usa YYYY-MM-DD");
      return false;
    }

    // Validar formato de hora
    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(hora)) {
      Alert.alert("Error", "Formato de hora inválido. Usa HH:MM (24h)");
      return false;
    }

    // Validar que la fecha no sea pasada
    const fechaHora = new Date(`${fecha}T${hora}`);
    if (fechaHora < new Date()) {
      Alert.alert("Error", "No puedes agendar una cita en el pasado");
      return false;
    }

    return true;
  };

  const handleCrearCita = async () => {
    if (!validarFormulario()) return;

    setLoading(true);

    try {
      const { motivo, fecha, hora, doctor_id, notas } = formData;
      const fecha_hora = `${fecha}T${hora}:00`;

      const datos = {
        paciente_id: user.paciente_id,
        doctor_id: parseInt(doctor_id),
        fecha_hora,
        motivo: motivo.trim(),
        notas: notas.trim() || null,
        estado: "pendiente",
        duracion_minutos: 30,
      };

      await client.post("/api/citas", datos);

      Alert.alert("¡Éxito!", "Tu cita ha sido agendada correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error al crear cita:", error);
      Alert.alert("Error", error.response?.data?.detail || "No se pudo crear la cita");
    } finally {
      setLoading(false);
    }
  };

  const getFechaMinima = () => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  };

  if (loadingDoctores) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Cargando doctores...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary + "15" }]}>
        <Ionicons name="calendar" size={48} color={theme.colors.primary} />
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Agendar Nueva Cita
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Completa la información para agendar tu cita
        </Text>
      </View>

      <View style={styles.form}>
        {/* Doctor */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Doctor *</Text>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Picker
              selectedValue={formData.doctor_id}
              onValueChange={(value) => handleInputChange("doctor_id", value)}
              style={{ color: theme.colors.text }}
              enabled={!loading}
            >
              <Picker.Item label="Selecciona un doctor" value="" />
              {doctores.map((doctor) => (
                <Picker.Item
                  key={doctor.id}
                  label={`Dr. ${doctor.nombre} ${doctor.apellido}${
                    doctor.especialidad ? ` - ${doctor.especialidad}` : ""
                  }`}
                  value={doctor.id.toString()}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Motivo */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Motivo de la consulta *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            placeholder="Ej. Control, dolor de cabeza, revisión general..."
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.motivo}
            onChangeText={(value) => handleInputChange("motivo", value)}
            editable={!loading}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Fecha */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Fecha *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            placeholder={`YYYY-MM-DD (ej: ${getFechaMinima()})`}
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.fecha}
            onChangeText={(value) => handleInputChange("fecha", value)}
            editable={!loading}
          />
        </View>

        {/* Hora */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Hora *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            placeholder="HH:MM (ej: 09:00, 14:30)"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.hora}
            onChangeText={(value) => handleInputChange("hora", value)}
            editable={!loading}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Notas */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Notas adicionales (opcional)</Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            placeholder="Información adicional..."
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.notas}
            onChangeText={(value) => handleInputChange("notas", value)}
            editable={!loading}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Botones */}
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleCrearCita}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Agendar Cita</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.border }]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 15, fontSize: 16 },
  header: { alignItems: "center", padding: 30, borderRadius: 20, marginBottom: 30 },
  headerTitle: { fontSize: 24, fontWeight: "bold", marginTop: 15, marginBottom: 8 },
  headerSubtitle: { fontSize: 14, textAlign: "center" },
  form: { gap: 5 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16 },
  textArea: { minHeight: 100, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16 },
  pickerContainer: { borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  button: {
    flexDirection: "row",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  cancelButton: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600" },
});