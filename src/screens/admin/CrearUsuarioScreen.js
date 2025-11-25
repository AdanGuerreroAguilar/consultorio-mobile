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

const ESPECIALIDADES = [
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Ginecología',
  'Neurología',
  'Pediatría',
  'Psiquiatría',
  'Traumatología',
  'Urología',
];

const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENEROS = ['Masculino', 'Femenino', 'Otro'];

const CrearUsuarioScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState('paciente');

  // Campos comunes
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Campos para Doctor
  const [especialidad, setEspecialidad] = useState('');

  // Campos para Paciente
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [genero, setGenero] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipoSangre, setTipoSangre] = useState('');
  const [alergias, setAlergias] = useState('');
  const [enfermedadesCronicas, setEnfermedadesCronicas] = useState('');

  const handleCrearUsuario = async () => {
    // Validaciones básicas
    if (!nombre || !apellido || !email) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (tipoUsuario !== 'paciente' && !password) {
      Alert.alert('Error', 'La contraseña es obligatoria');
      return;
    }

    if (tipoUsuario !== 'paciente' && password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (tipoUsuario === 'doctor' && !especialidad) {
      Alert.alert('Error', 'Debes seleccionar una especialidad');
      return;
    }

    setLoading(true);

    try {
      if (tipoUsuario === 'paciente') {
        // Crear paciente
        const pacienteData = {
          nombre,
          apellido,
          email,
          telefono: telefono || null,
          fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0],
          genero: genero || null,
          direccion: direccion || null,
          tipo_sangre: tipoSangre || null,
          alergias: alergias || null,
          enfermedades_cronicas: enfermedadesCronicas || null,
        };

        await apiClient.post('/pacientes', pacienteData);
        Alert.alert('Éxito', 'Paciente creado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Crear usuario (Admin o Doctor)
        const usuarioData = {
          nombre,
          apellido,
          email,
          password,
          telefono: telefono || null,
          especialidad: tipoUsuario === 'doctor' ? especialidad : null,
        };

        await apiClient.post('/usuarios', usuarioData);
        Alert.alert(
          'Éxito',
          `${tipoUsuario === 'admin' ? 'Administrador' : 'Doctor'} creado correctamente`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo crear el usuario'
      );
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFechaNacimiento(selectedDate);
    }
  };

  const renderCamposPaciente = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Fecha de Nacimiento *
        </Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.colors.card }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {fechaNacimiento.toLocaleDateString('es-MX')}
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
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Género</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
          <Picker
            selectedValue={genero}
            onValueChange={setGenero}
            style={styles.picker}
          >
            <Picker.Item label="Seleccionar género..." value="" />
            {GENEROS.map((gen) => (
              <Picker.Item key={gen} label={gen} value={gen} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Dirección</Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text 
          }]}
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Calle, número, colonia..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Tipo de Sangre</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
          <Picker
            selectedValue={tipoSangre}
            onValueChange={setTipoSangre}
            style={styles.picker}
          >
            <Picker.Item label="Seleccionar tipo..." value="" />
            {TIPOS_SANGRE.map((tipo) => (
              <Picker.Item key={tipo} label={tipo} value={tipo} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Alergias</Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text 
          }]}
          value={alergias}
          onChangeText={setAlergias}
          placeholder="Alergias conocidas..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Enfermedades Crónicas
        </Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text 
          }]}
          value={enfermedadesCronicas}
          onChangeText={setEnfermedadesCronicas}
          placeholder="Enfermedades crónicas..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={2}
        />
      </View>
    </>
  );

  const renderCamposDoctor = () => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: theme.colors.text }]}>Especialidad *</Text>
      <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
        <Picker
          selectedValue={especialidad}
          onValueChange={setEspecialidad}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar especialidad..." value="" />
          {ESPECIALIDADES.map((esp) => (
            <Picker.Item key={esp} label={esp} value={esp} />
          ))}
        </Picker>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Selector de tipo de usuario */}
        <View style={styles.tipoUsuarioContainer}>
          <TouchableOpacity
            style={[
              styles.tipoButton,
              tipoUsuario === 'paciente' && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => setTipoUsuario('paciente')}
          >
            <Ionicons
              name="person"
              size={24}
              color={tipoUsuario === 'paciente' ? '#FFFFFF' : theme.colors.text}
            />
            <Text
              style={[
                styles.tipoButtonText,
                { color: tipoUsuario === 'paciente' ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              Paciente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tipoButton,
              tipoUsuario === 'doctor' && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => setTipoUsuario('doctor')}
          >
            <Ionicons
              name="medical"
              size={24}
              color={tipoUsuario === 'doctor' ? '#FFFFFF' : theme.colors.text}
            />
            <Text
              style={[
                styles.tipoButtonText,
                { color: tipoUsuario === 'doctor' ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              Doctor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tipoButton,
              tipoUsuario === 'admin' && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => setTipoUsuario('admin')}
          >
            <Ionicons
              name="shield"
              size={24}
              color={tipoUsuario === 'admin' ? '#FFFFFF' : theme.colors.text}
            />
            <Text
              style={[
                styles.tipoButtonText,
                { color: tipoUsuario === 'admin' ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Campos comunes */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.card,
              color: theme.colors.text 
            }]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Apellido *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.card,
              color: theme.colors.text 
            }]}
            value={apellido}
            onChangeText={setApellido}
            placeholder="Apellido"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.card,
              color: theme.colors.text 
            }]}
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
            style={[styles.input, { 
              backgroundColor: theme.colors.card,
              color: theme.colors.text 
            }]}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="1234567890"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        {/* Campos específicos según tipo */}
        {tipoUsuario === 'doctor' && renderCamposDoctor()}
        {tipoUsuario === 'paciente' && renderCamposPaciente()}

        {/* Contraseña solo para Admin y Doctor */}
        {tipoUsuario !== 'paciente' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Contraseña *
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text 
                }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Confirmar Contraseña *
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text 
                }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar contraseña"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
              />
            </View>
          </>
        )}

        {/* Botón crear */}
        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: theme.colors.primary },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleCrearUsuario}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>
                Crear {tipoUsuario === 'paciente' ? 'Paciente' : 
                       tipoUsuario === 'doctor' ? 'Doctor' : 'Administrador'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  tipoUsuarioContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  tipoButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tipoButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 10,
  },
  dateText: {
    fontSize: 16,
  },
  createButton: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
    gap: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CrearUsuarioScreen;