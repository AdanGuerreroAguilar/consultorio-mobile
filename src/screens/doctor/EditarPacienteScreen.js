import React, { useState, useEffect } from 'react';
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
import { pacientesAPI } from '../../api/pacientes';
import { GENEROS, TIPOS_SANGRE } from '../../constants/roles';

const EditarPacienteScreen = ({ route, navigation }) => {
  const { pacienteId } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    genero: 'Otro',
    email: '',
    telefono: '',
    direccion: '',
    alergias: '',
    tipo_sangre: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
  });

  useEffect(() => {
    cargarPaciente();
  }, []);

  const cargarPaciente = async () => {
    try {
      const data = await pacientesAPI.getPaciente(pacienteId);
      setFormData({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        fecha_nacimiento: data.fecha_nacimiento || '',
        genero: data.genero || 'Otro',
        email: data.email || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        alergias: data.alergias || '',
        tipo_sangre: data.tipo_sangre || '',
        contacto_emergencia: data.contacto_emergencia || '',
        telefono_emergencia: data.telefono_emergencia || '',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información del paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleActualizar = async () => {
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      Alert.alert('Error', 'Nombre y apellido son obligatorios');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setSaving(true);

    try {
      await pacientesAPI.actualizarPaciente(pacienteId, formData);
      Alert.alert('Éxito', 'Paciente actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo actualizar el paciente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Información Personal
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={formData.nombre}
          onChangeText={(v) => handleInputChange('nombre', v)}
          placeholder="Nombre del paciente"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Apellido *</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={formData.apellido}
          onChangeText={(v) => handleInputChange('apellido', v)}
          placeholder="Apellido del paciente"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Fecha de Nacimiento (AAAA-MM-DD)
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={formData.fecha_nacimiento}
          onChangeText={(v) => handleInputChange('fecha_nacimiento', v)}
          placeholder="1990-01-15"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Género</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Picker
            selectedValue={formData.genero}
            onValueChange={(v) => handleInputChange('genero', v)}
            style={{ color: theme.colors.text }}
          >
            {GENEROS.map((genero) => (
              <Picker.Item 
                key={genero.value} 
                label={genero.label} 
                value={genero.value} 
                color={theme.colors.text}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Correo Electrónico</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={formData.email}
          onChangeText={(v) => handleInputChange('email', v)}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={formData.telefono}
          onChangeText={(v) => handleInputChange('telefono', v)}
          placeholder="442-123-4567"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Dirección</Text>
        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={formData.direccion}
          onChangeText={(v) => handleInputChange('direccion', v)}
          placeholder="Calle, número, colonia, ciudad"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Información Médica
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Tipo de Sangre</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Picker
            selectedValue={formData.tipo_sangre}
            onValueChange={(v) => handleInputChange('tipo_sangre', v)}
            style={{ color: theme.colors.text }}
          >
            <Picker.Item label="Seleccionar" value="" color={theme.colors.text} />

            {TIPOS_SANGRE.map((tipo) => (
              <Picker.Item 
                key={tipo} 
                label={tipo} 
                value={tipo} 
                color={theme.colors.text}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Alergias</Text>
        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={formData.alergias}
          onChangeText={(v) => handleInputChange('alergias', v)}
          placeholder="Medicamentos o sustancias a las que es alérgico"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Contacto de Emergencia
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Nombre del Contacto</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={formData.contacto_emergencia}
          onChangeText={(v) => handleInputChange('contacto_emergencia', v)}
          placeholder="Nombre completo"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono de Emergencia</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={formData.telefono_emergencia}
          onChangeText={(v) => handleInputChange('telefono_emergencia', v)}
          placeholder="442-123-4567"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleActualizar}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Guardar Cambios</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: theme.colors.border }]}
        onPress={() => navigation.goBack()}
        disabled={saving}
      >
        <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
          Cancelar
        </Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 20 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { height: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, fontSize: 16 },
  textArea: { minHeight: 80, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16 },
  pickerContainer: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  button: { height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cancelButton: { height: 50, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
});

export default EditarPacienteScreen;
