// screens/paciente/CrearCitaPacienteScreen.js
import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import client from "../../api/client";
import { programarNotificacion } from "../../utils/notifications";

export default function CrearCitaPacienteScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [doctores, setDoctores] = useState([]);

  const [formData, setFormData] = useState({
    doctor_id: "",
    motivo: "",
    fecha: "",
    hora: "",
    notas: "",
  });

  useFocusEffect(
    useCallback(() => {
      setFormData({
        doctor_id: "",
        motivo: "",
        fecha: "",
        hora: "",
        notas: "",
      });
      cargarDoctores();
    }, [])
  );

  const cargarDoctores = async () => {
    setLoadingData(true);
    try {
      const resUsuarios = await client.get("/api/usuarios");
      const doctoresList = (resUsuarios.data || []).filter(
        (u) => u.rol === "doctor"
      );
      setDoctores(doctoresList);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los doctores");
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validarFormulario = () => {
    const { doctor_id, motivo, fecha, hora } = formData;

    if (!doctor_id) {
      Alert.alert("Error", "Por favor selecciona un doctor");
      return false;
    }
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      Alert.alert("Error", "Formato de fecha inválido. Usa YYYY-MM-DD");
      return false;
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(hora)) {
      Alert.alert("Error", "Formato de hora inválido. Usa HH:MM (24h)");
      return false;
    }

    const fechaHoraSeleccionada = new Date(`${fecha}T${hora}:00`);
    const ahora = new Date();

    if (fechaHoraSeleccionada < ahora) {
      Alert.alert("Error", "No puedes agendar una cita en el pasado");
      return false;
    }

    return true;
  };

  const handleCrear = async () => {
    if (!validarFormulario()) return;

    setLoading(true);

    try {
      const { doctor_id, motivo, fecha, hora, notas } = formData;
      const fecha_hora = `${fecha}T${hora}:00`;
      const pacienteId = user.paciente_id || user.id;

      const datos = {
        paciente_id: parseInt(pacienteId),
        doctor_id: parseInt(doctor_id),
        fecha_hora,
        motivo: motivo.trim(),
        notas: notas.trim() || null,
        estado: "Programada",
        duracion_minutos: 30,
      };

      await client.post("/api/citas", datos);

      // Recordatorio 2 horas antes
      const fechaCita = new Date(fecha_hora);
      const dosHorasMs = 2 * 60 * 60 * 1000;
      const fechaRecordatorio = new Date(fechaCita.getTime() - dosHorasMs);

      if (fechaRecordatorio > new Date()) {
        const horaFormateada = fechaCita.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        });

        await programarNotificacion(
          "Recordatorio de cita",
          `Tienes una cita médica a las ${horaFormateada}.`,
          fechaRecordatorio
        );
      }

      Alert.alert("Éxito", "Tu cita ha sido agendada correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const mensajeError =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        "No se pudo crear la cita.";
      Alert.alert("Error del Servidor", mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const getFechaHoy = () => new Date().toISOString().split("T")[0];

  if (loadingData) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: theme.colors.textSecondary },
          ]}
        >
          Cargando doctores...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Ionicons name="calendar" size={48} color={theme.colors.primary} />
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Agendar Nueva Cita
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            { color: theme.colors.textSecondary },
          ]}
        >
          Completa la información para agendar tu cita
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Doctor *
        </Text>
        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Picker
            selectedValue={formData.doctor_id}
            onValueChange={(v) => handleInputChange("doctor_id", v)}
            style={{ color: theme.colors.text }}
            dropdownIconColor={theme.colors.text}
            enabled={!loading}
          >
            <Picker.Item
              label="Selecciona un doctor"
              value=""
              color={theme.colors.text}
            />

            {doctores.map((d) => (
              <Picker.Item
                key={d.id}
                label={`Dr. ${d.nombre} ${d.apellido}${
                  d.especialidad ? ` - ${d.especialidad}` : ""
                }`}
                value={d.id.toString()}
                color={theme.colors.text}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Motivo *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
              borderWidth: 1,
            },
          ]}
          placeholder="Ej. Control, dolor de cabeza, revisión general..."
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.motivo}
          onChangeText={(v) => handleInputChange("motivo", v)}
          editable={!loading}
          multiline
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Fecha * (YYYY-MM-DD)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
              borderWidth: 1,
            },
          ]}
          placeholder={`Ejemplo: ${getFechaHoy()}`}
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.fecha}
          onChangeText={(v) => handleInputChange("fecha", v)}
          editable={!loading}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Hora * (HH:MM)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
              borderWidth: 1,
            },
          ]}
          placeholder="Ejemplo: 09:00, 14:30"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.hora}
          onChangeText={(v) => handleInputChange("hora", v)}
          editable={!loading}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Notas (opcional)
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
              borderWidth: 1,
            },
          ]}
          placeholder="Información adicional..."
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.notas}
          onChangeText={(v) => handleInputChange("notas", v)}
          editable={!loading}
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.colors.primary },
          loading && { opacity: 0.6 },
        ]}
        onPress={handleCrear}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.buttonText}>Agendar Cita</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.cancelButton,
          { borderColor: theme.colors.border },
        ]}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text
          style={[
            styles.cancelButtonText,
            { color: theme.colors.text },
          ]}
        >
          Cancelar
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },

  header: {
    alignItems: "center",
    padding: 25,
    borderRadius: 15,
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },

  field: { marginBottom: 20 },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 50,
  },

  textArea: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },

  pickerContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  cancelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
