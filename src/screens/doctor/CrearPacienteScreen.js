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
  const [genero, setGenero] = useState('');
  const [tipoSangre, setTipoSangre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [alergias, setAlergias] = useState('');
  const [contactoEmergencia, setContactoEmergencia] = useState('');
  const [telefonoEmergencia, setTelefonoEmergencia] = useState('');

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setFechaNacimiento(selectedDate);
  };

  const validateFields = () => {
    if (!nombre.trim() || !apellido.trim()) {
      return "Nombre y apellido son obligatorios.";
    }

    if (email && !email.includes('@')) {
      return "El correo electrónico no es válido.";
    }

    if (telefono && telefono.length < 10) {
      return "El teléfono es demasiado corto.";
    }

    if (telefonoEmergencia && telefonoEmergencia.length < 10) {
      return "El teléfono de emergencia es demasiado corto.";
    }

    return null;
  };

  const handleCrear = async () => {
    if (loading) return;

    const validationError = validateFields();
    if (validationError) {
      Alert.alert("Error", validationError);
      return;
    }

    setLoading(true);

    try {
      const datos = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim() || null,
        telefono: telefono.trim() || null,
        fecha_nacimiento: formatDate(fechaNacimiento),
        genero: genero || null,
        tipo_sangre: tipoSangre || null,
        direccion: direccion.trim() || null,
        alergias: alergias.trim() || null,
        contacto_emergencia: contactoEmergencia.trim() || null,
        telefono_emergencia: telefonoEmergencia.trim() || null,
      };

      await apiClient.post('/pacientes', datos);

      Alert.alert('Éxito', 'Paciente creado correctamente');
      navigation.goBack();

    } catch (error) {
      console.error('Error al crear paciente:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo crear el paciente'
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

        {/* Datos personales */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Datos Personales
        </Text>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card }]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Apellido *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card }]}
              value={apellido}
              onChangeText={setApellido}
              placeholder="Apellido"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Fecha de Nacimiento</Text>
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
              maximumDate={new Date()}
              onChange={onDateChange}
            />
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Género</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
              <Picker
                selectedValue={genero}
                onValueChange={setGenero}
                dropdownIconColor={theme.colors.text}
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
            <Text style={[styles.label, { color: theme.colors.text }]}>Tipo de Sangre</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
              <Picker
                selectedValue={tipoSangre}
                onValueChange={setTipoSangre}
                dropdownIconColor={theme.colors.text}
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Contacto
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card }]}
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
            style={[styles.input, { backgroundColor: theme.colors.card }]}
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
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.card }]}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Calle, número, colonia..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
        </View>

        {/* Información médica */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Información Médica
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Alergias</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.card }]}
            value={alergias}
            onChangeText={setAlergias}
            placeholder="Alergias conocidas..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
        </View>

        {/* Contacto de Emergencia */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Contacto de Emergencia
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Nombre</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card }]}
            value={contactoEmergencia}
            onChangeText={setContactoEmergencia}
            placeholder="Nombre del contacto"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card }]}
            value={telefonoEmergencia}
            onChangeText={setTelefonoEmergencia}
            placeholder="442-123-4567"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={[
            styles.crearButton,
            { backgroundColor: theme.colors.primary },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleCrear}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              <Text style={styles.crearButtonText}>Crear Paciente</Text>
            </>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
    marginTop: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
  },
  crearButton: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
    gap: 10,
  },
  crearButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CrearPacienteScreen;
