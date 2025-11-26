// screens/admin/CrearUsuarioScreen.js
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const ESPECIALIDADES = [
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Ginecología',
  'Medicina General',
  'Neurología',
  'Pediatría',
  'Psiquiatría',
  'Traumatología',
  'Urología',
];

const CrearUsuarioScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState('doctor');

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  const handleCrear = async () => {
    // Validaciones
    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      Alert.alert('Error', 'Nombre, apellido y email son obligatorios');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'La contraseña es obligatoria');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (tipoUsuario === 'doctor' && !especialidad) {
      Alert.alert('Error', 'Selecciona una especialidad para el doctor');
      return;
    }

    setLoading(true);

    try {
      const datos = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        password,
        telefono: telefono.trim() || null,
        rol: tipoUsuario,
        especialidad: tipoUsuario === 'doctor' ? especialidad : null,
      };

      await apiClient.post('/usuarios', datos);
      
      Alert.alert(
        'Éxito',
        `${tipoUsuario === 'admin' ? 'Administrador' : 'Doctor'} creado correctamente`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Selector de tipo */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Tipo de usuario
        </Text>
        <View style={styles.tipoContainer}>
          <TouchableOpacity
            style={[
              styles.tipoButton,
              { backgroundColor: theme.colors.card },
              tipoUsuario === 'doctor' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setTipoUsuario('doctor')}
          >
            <Ionicons
              name="medical"
              size={28}
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
              { backgroundColor: theme.colors.card },
              tipoUsuario === 'admin' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setTipoUsuario('admin')}
          >
            <Ionicons
              name="shield"
              size={28}
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

        {/* Datos personales */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Datos personales
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Apellido *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={apellido}
            onChangeText={setApellido}
            placeholder="Apellido"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email *</Text>
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

        {/* Especialidad solo para doctores */}
        {tipoUsuario === 'doctor' && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Especialidad *</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
              <Picker
                selectedValue={especialidad}
                onValueChange={setEspecialidad}
                style={{ color: theme.colors.text }}
              >
                <Picker.Item label="Seleccionar especialidad..." value="" />
                {ESPECIALIDADES.map((esp) => (
                  <Picker.Item key={esp} label={esp} value={esp} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Contraseña */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Credenciales
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Contraseña *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Confirmar contraseña *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repetir contraseña"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry
          />
        </View>

        {/* Botón crear */}
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
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={styles.crearButtonText}>
                Crear {tipoUsuario === 'admin' ? 'Administrador' : 'Doctor'}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
    marginTop: 10,
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  tipoButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  tipoButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  pickerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CrearUsuarioScreen;