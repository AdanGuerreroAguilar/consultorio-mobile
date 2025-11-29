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

const GENEROS = [
  { label: "Masculino", value: "M" },
  { label: "Femenino", value: "F" },
  { label: "Otro", value: "Otro" },
];

const CrearPacienteScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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


  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const onDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selected) {
      setFechaNacimiento(selected);
      setFechaTexto(formatDate(selected));
    }
  };

  const validar = () => {
    if (!nombre.trim()) return "El nombre es obligatorio";
    if (!apellido.trim()) return "El apellido es obligatorio";
    return null;
  };

  const handleCrear = () => {
    const error = validar();
    if (error) return Alert.alert("Error", error);

    Alert.alert(
      "Confirmación",
      `¿Registrar a ${nombre} ${apellido}?`,
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

      console.log("📤 Enviando datos:", datos);

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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Datos Personales
        </Text>

        {/* Nombre y apellido */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Apellido *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={apellido}
              onChangeText={setApellido}
              placeholder="Apellido"
            />
          </View>
        </View>

        {/* Fecha nacimiento */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Fecha de nacimiento</Text>

          {Platform.OS === "web" ? (
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={fechaTexto}
              onChangeText={(txt) => {
                setFechaTexto(txt);
                const [y, m, d] = txt.split("-");
                setFechaNacimiento(new Date(y, m - 1, d));
              }}
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

        {/* Género y tipo sangre */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Género</Text>

            {/*  Picker corregido */}
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
              <Picker
                selectedValue={genero}
                onValueChange={setGenero}
                style={{ color: theme.colors.text }}
              >
                <Picker.Item label="Seleccionar..." value="" />
                {GENEROS.map(g => (
                  <Picker.Item key={g.value} label={g.label} value={g.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Tipo de Sangre</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
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

        {/* Contacto */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contacto</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={email}
            onChangeText={setEmail}
            placeholder="email@ejemplo.com"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="4421234567"
            keyboardType="phone-pad"
          />
        </View>

        {/* Dirección */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Dirección</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Calle, número..."
            multiline
          />
        </View>

        {/* Información Médica */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Información Médica</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Alergias</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={alergias}
            onChangeText={setAlergias}
            placeholder="Alergias conocidas..."
            multiline
          />
        </View>

        {/* Contacto de emergencia */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contacto de Emergencia</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Nombre</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={contactoEmergencia}
            onChangeText={setContactoEmergencia}
            placeholder="Juan Pérez"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={telefonoEmergencia}
            onChangeText={setTelefonoEmergencia}
            placeholder="4420000000"
            keyboardType="phone-pad"
          />
        </View>

        {/* Botón */}
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

// ESTILOS

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
