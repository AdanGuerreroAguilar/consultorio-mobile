// screens/admin/CrearPacienteScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENEROS = ['Masculino', 'Femenino', 'Otro'];

const CrearPacienteScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  const [fechaNacimiento, setFechaNacimiento] = useState(new Date(2000, 0, 1));
  const [fechaTexto, setFechaTexto] = useState('2000-01-01');

  const [genero, setGenero] = useState('');
  const [tipoSangre, setTipoSangre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [alergias, setAlergias] = useState('');
  const [contactoEmergencia, setContactoEmergencia] = useState('');
  const [telefonoEmergencia, setTelefonoEmergencia] = useState('');

  // =============================================
  // FORMATEAR FECHA yyyy-mm-dd
  // =============================================
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // =============================================
  // CAMBIO DE FECHA MOVIL (IOS / ANDROID)
  // =============================================
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFechaNacimiento(selectedDate);
      setFechaTexto(formatDate(selectedDate));
    }
  };

  // =============================================
  // VALIDACIONES
  // =============================================
  const validar = () => {
    if (!nombre.trim()) return "El nombre es obligatorio";
    if (!apellido.trim()) return "El apellido es obligatorio";
    if (email && !email.includes('@')) return "El email no es válido";
    return null;
  };

  // =============================================
  // CREAR PACIENTE
  // =============================================
  const handleCrear = () => {
    const error = validar();
    if (error) return Alert.alert("Error", error);

    Alert.alert(
      "Confirmación",
      `¿Registrar a ${nombre} ${apellido} como paciente?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: () => crearPaciente() }
      ]
    );
  };

  const crearPaciente = async () => {
    setLoading(true);

    try {
      const datos = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim() || null,
        telefono: telefono.trim() || null,
        fecha_nacimiento: Platform.OS === "web" ? fechaTexto : formatDate(fechaNacimiento),
        genero: genero || null,
        tipo_sangre: tipoSangre || null,
        direccion: direccion.trim() || null,
        alergias: alergias.trim() || null,
        contacto_emergencia: contactoEmergencia.trim() || null,
        telefono_emergencia: telefonoEmergencia.trim() || null,
      };

      // ✅ CORREGIDO: Ruta con /api/
      await apiClient.post("/api/pacientes", datos);

      Alert.alert("Éxito", "Paciente creado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.error("Error al crear paciente:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "No se pudo crear el paciente"
      );
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // UI PRINCIPAL
  // =============================================
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* DATOS PERSONALES */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Datos Personales
        </Text>

        {/* Nombre - Apellido */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Apellido *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={apellido}
              onChangeText={setApellido}
              placeholder="Apellido"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Fecha de nacimiento */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Fecha de nacimiento</Text>

          {Platform.OS === "web" ? (
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
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
                style={[styles.dateButton, { backgroundColor: theme.colors.card }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.dateText, { color: theme.colors.text }]}>
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

        {/* Género - Tipo de Sangre */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Género</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
              <Picker selectedValue={genero} onValueChange={setGenero} style={{ color: theme.colors.text }}>
                <Picker.Item label="Seleccionar..." value="" />
                {GENEROS.map((g) => (
                  <Picker.Item key={g} label={g} value={g} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Tipo de Sangre</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
              <Picker selectedValue={tipoSangre} onValueChange={setTipoSangre} style={{ color: theme.colors.text }}>
                <Picker.Item label="Seleccionar..." value="" />
                {TIPOS_SANGRE.map((t) => (
                  <Picker.Item key={t} label={t} value={t} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Contacto */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contacto</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="442-123-4567"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Dirección</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Calle, número, colonia, ciudad..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Información médica */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Información Médica</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Alergias</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={alergias}
            onChangeText={setAlergias}
            placeholder="Alergias conocidas..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Contacto Emergencia */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Contacto de Emergencia
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Nombre del contacto</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={contactoEmergencia}
            onChangeText={setContactoEmergencia}
            placeholder="Juan Pérez"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono del contacto</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={telefonoEmergencia}
            onChangeText={setTelefonoEmergencia}
            placeholder="442-098-7654"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        {/* BOTÓN CREAR */}
        <TouchableOpacity
          style={[
            styles.crearButton,
            { backgroundColor: theme.colors.primary },
            loading && styles.buttonDisabled
          ]}
          onPress={handleCrear}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.crearButtonText}>Registrar Paciente</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CrearPacienteScreen;

// ===================================================
// ESTILOS
// ===================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 15, marginTop: 10 },
  row: { flexDirection: "row", gap: 12 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },

  input: { borderRadius: 12, padding: 15, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: "top" },

  pickerContainer: { borderRadius: 12, overflow: "hidden" },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  dateText: { fontSize: 16 },

  crearButton: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
    gap: 10,
  },
  crearButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  buttonDisabled: { opacity: 0.6 },
});