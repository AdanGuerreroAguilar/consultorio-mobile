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
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import client from "../../api/client";

const TIPOS_SANGRE = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENEROS = [
  { label: "Seleccionar...", value: "" },
  { label: "Masculino", value: "Masculino" },
  { label: "Femenino", value: "Femenino" },
  { label: "Otro", value: "Otro" },
];

const EditarPacienteScreen = ({ route, navigation }) => {
  const { paciente } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: paciente?.nombre || "",
    apellido: paciente?.apellido || "",
    fecha_nacimiento: paciente?.fecha_nacimiento || "",
    genero: paciente?.genero || "",
    email: paciente?.email || "",
    telefono: paciente?.telefono || "",
    direccion: paciente?.direccion || "",
    tipo_sangre: paciente?.tipo_sangre || "",
    alergias: paciente?.alergias || "",
    contacto_emergencia: paciente?.contacto_emergencia || "",
    telefono_emergencia: paciente?.telefono_emergencia || "",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGuardar = async () => {
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      Alert.alert("Error", "Nombre y apellido son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const datos = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        fecha_nacimiento: formData.fecha_nacimiento || null,
        genero: formData.genero || null,
        email: formData.email.trim() || null,
        telefono: formData.telefono.trim() || null,
        direccion: formData.direccion.trim() || null,
        tipo_sangre: formData.tipo_sangre || null,
        alergias: formData.alergias.trim() || null,
        contacto_emergencia: formData.contacto_emergencia.trim() || null,
        telefono_emergencia: formData.telefono_emergencia.trim() || null,
      };

      console.log(" Actualizando paciente:", paciente.id, datos);
      
      await client.put(`/api/pacientes/${paciente.id}`, datos);

      Alert.alert("Éxito", "Paciente actualizado correctamente", [
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
      {/* Información Personal */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Información Personal
      </Text>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nombre *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={formData.nombre}
            onChangeText={(v) => handleChange("nombre", v)}
            placeholder="Nombre"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Apellido *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={formData.apellido}
            onChangeText={(v) => handleChange("apellido", v)}
            placeholder="Apellido"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Fecha de Nacimiento (YYYY-MM-DD)
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={formData.fecha_nacimiento}
          onChangeText={(v) => handleChange("fecha_nacimiento", v)}
          placeholder="1990-01-15"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Género</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
            <Picker
              selectedValue={formData.genero}
              onValueChange={(v) => handleChange("genero", v)}
              style={{ color: theme.colors.text }}
            >
              {GENEROS.map((g) => (
                <Picker.Item key={g.value} label={g.label} value={g.value} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tipo Sangre</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
            <Picker
              selectedValue={formData.tipo_sangre}
              onValueChange={(v) => handleChange("tipo_sangre", v)}
              style={{ color: theme.colors.text }}
            >
              {TIPOS_SANGRE.map((t) => (
                <Picker.Item key={t} label={t || "Seleccionar"} value={t} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Contacto */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
        Contacto
      </Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={formData.email}
          onChangeText={(v) => handleChange("email", v)}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Teléfono</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={formData.telefono}
          onChangeText={(v) => handleChange("telefono", v)}
          placeholder="442-123-4567"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Dirección</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={formData.direccion}
          onChangeText={(v) => handleChange("direccion", v)}
          placeholder="Calle, número, colonia..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
        />
      </View>

      {/* Información Médica */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
        Información Médica
      </Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Alergias</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={formData.alergias}
          onChangeText={(v) => handleChange("alergias", v)}
          placeholder="Alergias conocidas..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
        />
      </View>

      {/* Contacto de Emergencia */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
        Contacto de Emergencia
      </Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nombre</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={formData.contacto_emergencia}
          onChangeText={(v) => handleChange("contacto_emergencia", v)}
          placeholder="Nombre del contacto"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Teléfono</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={formData.telefono_emergencia}
          onChangeText={(v) => handleChange("telefono_emergencia", v)}
          placeholder="Teléfono de emergencia"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
        />
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

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 15 },
  row: { flexDirection: "row", gap: 12 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, marginBottom: 6 },
  input: { padding: 14, borderRadius: 10, fontSize: 16 },
  textArea: { padding: 14, borderRadius: 10, fontSize: 16, minHeight: 80, textAlignVertical: "top" },
  pickerContainer: { borderRadius: 10, overflow: "hidden" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600" },
});

export default EditarPacienteScreen;