// screens/admin/EditarPacienteScreen.js

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
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../api/client";

const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENEROS = ["Masculino", "Femenino", "Otro"];

const EditarPacienteScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { paciente } = route.params;

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Datos iniciales del paciente
  const [nombre, setNombre] = useState(paciente.nombre);
  const [apellido, setApellido] = useState(paciente.apellido);
  const [email, setEmail] = useState(paciente.email || "");
  const [telefono, setTelefono] = useState(paciente.telefono || "");

  const fechaInicial = paciente.fecha_nacimiento
    ? new Date(paciente.fecha_nacimiento)
    : new Date(2000, 0, 1);

  const [fechaNacimiento, setFechaNacimiento] = useState(fechaInicial);
  const [fechaTexto, setFechaTexto] = useState(
    paciente.fecha_nacimiento || "2000-01-01"
  );

  const [genero, setGenero] = useState(paciente.genero || "");
  const [tipoSangre, setTipoSangre] = useState(paciente.tipo_sangre || "");
  const [direccion, setDireccion] = useState(paciente.direccion || "");
  const [alergias, setAlergias] = useState(paciente.alergias || "");
  const [contactoEmergencia, setContactoEmergencia] = useState(
    paciente.contacto_emergencia || ""
  );
  const [telefonoEmergencia, setTelefonoEmergencia] = useState(
    paciente.telefono_emergencia || ""
  );

  // ==========================================
  // FORMATEAR FECHA CORRECTAMENTE
  // ==========================================
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // EVENTO FECHA EN MOVIL
  // ==========================================
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFechaNacimiento(selectedDate);
      setFechaTexto(formatDate(selectedDate));
    }
  };

  // ==========================================
  // VALIDACIONES
  // ==========================================
  const validar = () => {
    if (!nombre.trim()) return "El nombre es obligatorio";
    if (!apellido.trim()) return "El apellido es obligatorio";
    if (email && !email.includes("@")) return "El email no es válido";
    return null;
  };

  // ==========================================
  // GUARDAR CAMBIOS
  // ==========================================
  const handleGuardar = () => {
    const error = validar();
    if (error) return Alert.alert("Error", error);

    Alert.alert(
      "Confirmación",
      "¿Guardar cambios de este paciente?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Guardar", onPress: () => actualizarPaciente() },
      ]
    );
  };

  const actualizarPaciente = async () => {
    setLoading(true);

    try {
      const datos = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim() || null,
        telefono: telefono.trim() || null,

        fecha_nacimiento:
          Platform.OS === "web" ? fechaTexto : formatDate(fechaNacimiento),

        genero: genero || null,
        tipo_sangre: tipoSangre || null,
        direccion: direccion.trim() || null,
        alergias: alergias.trim() || null,
        contacto_emergencia: contactoEmergencia.trim() || null,
        telefono_emergencia: telefonoEmergencia.trim() || null,
      };

      await apiClient.put(`/pacientes/${paciente.id}`, datos);

      Alert.alert("Éxito", "Cambios guardados", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error actualizando paciente:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "No se pudieron guardar los cambios"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================
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
          Editar Paciente
        </Text>

        {/* ================== NOMBRE Y APELLIDO ==================*/}

        <View style={styles.row}>
          {/* Nombre */}
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Nombre *
            </Text>
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
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Apellido *
            </Text>
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
        </View>

        {/* ================== FECHA ==================*/}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Fecha de nacimiento *
          </Text>

          {/* WEB */}
          {Platform.OS === "web" ? (
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.colors.card, color: theme.colors.text },
              ]}
              value={fechaTexto}
              onChangeText={(txt) => {
                setFechaTexto(txt);
                const parts = txt.split("-");
                if (parts.length === 3) {
                  setFechaNacimiento(new Date(parts[0], parts[1] - 1, parts[2]));
                }
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textSecondary}
            />
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { backgroundColor: theme.colors.card },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.dateText, { color: theme.colors.text }]}
                >
                  {formatDate(fechaNacimiento)}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={fechaNacimiento}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </>
          )}
        </View>

        {/* ================== GÉNERO Y TIPO DE SANGRE ==================*/}

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Género
            </Text>
            <View
              style={[
                styles.pickerContainer,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Picker
                selectedValue={genero}
                onValueChange={setGenero}
                style={{ color: theme.colors.text }}
              >
                <Picker.Item label="Seleccionar..." value="" />
                {GENEROS.map((g) => (
                  <Picker.Item key={g} label={g} value={g} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Tipo de Sangre
            </Text>
            <View
              style={[
                styles.pickerContainer,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Picker
                selectedValue={tipoSangre}
                onValueChange={setTipoSangre}
                style={{ color: theme.colors.text }}
              >
                <Picker.Item label="Seleccionar..." value="" />
                {TIPOS_SANGRE.map((t) => (
                  <Picker.Item key={t} label={t} value={t} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* ================== CONTACTO ==================*/}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Contacto
        </Text>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Email
          </Text>
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
          />
        </View>

        {/* Teléfono */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Teléfono
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
            ]}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="442-123-4567"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        {/* ================== DIRECCIÓN ==================*/}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Dirección
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
            ]}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Calle, número, colonia, ciudad..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
        </View>

        {/* ================== INFORMACIÓN MÉDICA ==================*/}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Información Médica
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Alergias
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
            ]}
            value={alergias}
            onChangeText={setAlergias}
            placeholder="Alergias conocidas..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
        </View>

        {/* ================== EMERGENCIA ==================*/}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Contacto de emergencia
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Nombre del contacto
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
            ]}
            value={contactoEmergencia}
            onChangeText={setContactoEmergencia}
            placeholder="Juan Pérez"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Teléfono del contacto
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
            ]}
            value={telefonoEmergencia}
            onChangeText={setTelefonoEmergencia}
            placeholder="442-098-7654"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        {/* ================== BOTÓN GUARDAR ==================*/}

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
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditarPacienteScreen;

// ===================================================
// ESTILOS
// ===================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
    marginTop: 10,
  },

  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 6, fontWeight: "600" },

  input: { borderRadius: 12, padding: 14, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: "top" },

  row: { flexDirection: "row", gap: 12 },

  pickerContainer: { borderRadius: 12 },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  dateText: { fontSize: 16 },

  saveButton: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
    gap: 10,
  },

  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  buttonDisabled: { opacity: 0.6 },
});
