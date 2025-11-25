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
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';
import { ESPECIALIDADES } from '../../constants/roles';

const CrearUsuarioScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState('doctor'); // doctor, admin, staff

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    especialidad: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleTipoUsuarioChange = (tipo) => {
    setTipoUsuario(tipo);
    if (tipo !== 'doctor') {
      setFormData({ ...formData, especialidad: '' });
    }
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      Alert.alert('Error', 'Nombre y apellido son obligatorios');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'El correo electrónico es obligatorio');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }

    if (!formData.password || formData.password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (tipoUsuario === 'doctor' && !formData.especialidad) {
      Alert.alert('Error', 'Debes seleccionar una especialidad para el doctor');
      return false;
    }

    return true;
  };

  const handleCrear = async () => {
    if (!validarFormulario()) return;

    setLoading(true);

    try {
      const datos = {
        email: formData.email.trim(),
        password: formData.password,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        telefono: formData.telefono.trim() || null,
        especialidad: tipoUsuario === 'doctor' ? formData.especialidad : null,
      };

      await apiClient.post('/usuarios', datos);

      Alert.alert('Éxito', 'Usuario creado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tipo de Usuario</Text>

      <View style={styles.tipoUsuarioContainer}>
        <TouchableOpacity
          style={[
            styles.tipoButton,
            { backgroundColor: theme.colors.card },
            tipoUsuario === 'doctor' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleTipoUsuarioChange('doctor')}
        >
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
          onPress={() => handleTipoUsuarioChange('admin')}
        >
          <Text
            style={[
              styles.tipoButtonText,
              { color: tipoUsuario === 'admin' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Administrador
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tipoButton,
            { backgroundColor: theme.colors.card },
            tipoUsuario === 'staff' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleTipoUsuarioChange('staff')}
        >
          <Text
            style={[
              styles.tipoButtonText,
              { color: tipoUsuario === 'staff' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Staff
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Información Personal
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          value={formData.nombre}
          onChangeText={(value) => handleInputChange('nombre', value)}
          placeholder="Nombre del usuario"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Apellido *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          value={formData.apellido}
          onChangeText={(value) => handleInputChange('apellido', value)}
          placeholder="Apellido del usuario"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          value={formData.telefono}
          onChangeText={(value) => handleInputChange('telefono', value)}
          placeholder="442-123-4567"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      {tipoUsuario === 'doctor' && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Especialidad *</Text>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Picker
              selectedValue={formData.especialidad}
              onValueChange={(value) => handleInputChange('especialidad', value)}
              style={{ color: theme.colors.text }}
            >
              <Picker.Item label="Seleccionar especialidad" value="" />
              {ESPECIALIDADES.map((esp) => (
                <Picker.Item key={esp} label={esp} value={esp} />
              ))}
            </Picker>
          </View>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Credenciales de Acceso
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Correo Electrónico *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="correo@consultorio.com"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Contraseña *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          placeholder="Mínimo 8 caracteres"
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
        />
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          La contraseña debe tener al menos 8 caracteres
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleCrear}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Crear Usuario</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: theme.colors.border }]}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancelar</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },
  tipoUsuarioContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  tipoButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  tipoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrearUsuarioScreen;
