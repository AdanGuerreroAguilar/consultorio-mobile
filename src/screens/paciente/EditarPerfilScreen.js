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
import { pacientesAPI } from '../../api/pacientes';
import { GENEROS, TIPOS_SANGRE } from '../../constants/roles';

const EditarPerfilScreen = ({ route, navigation }) => {
  const { paciente } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: paciente.nombre || '',
    apellido: paciente.apellido || '',
    fecha_nacimiento: paciente.fecha_nacimiento || '',
    genero: paciente.genero || 'Otro',
    email: paciente.email || '',
    telefono: paciente.telefono || '',
    direccion: paciente.direccion || '',
    alergias: paciente.alergias || '',
    tipo_sangre: paciente.tipo_sangre || '',
    contacto_emergencia: paciente.contacto_emergencia || '',
    telefono_emergencia: paciente.telefono_emergencia || '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGuardar = async () => {
    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      Alert.alert('Error', 'Nombre y apellido son obligatorios');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    
    try {
      await pacientesAPI.actualizarPaciente(paciente.id, formData);
      Alert.alert(
        'Éxito',
        'Perfil actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Información Personal */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Información Personal
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.nombre}
          onChangeText={(value) => handleInputChange('nombre', value)}
          placeholder="Tu nombre"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Apellido *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.apellido}
          onChangeText={(value) => handleInputChange('apellido', value)}
          placeholder="Tu apellido"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Fecha de Nacimiento (AAAA-MM-DD)
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.fecha_nacimiento}
          onChangeText={(value) => handleInputChange('fecha_nacimiento', value)}
          placeholder="1990-01-15"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Género</Text>
        <View style={[styles.pickerContainer, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border 
        }]}>
          <Picker
            selectedValue={formData.genero}
            onValueChange={(value) => handleInputChange('genero', value)}
            style={{ color: theme.colors.text }}
          >
            {GENEROS.map((genero) => (
              <Picker.Item key={genero.value} label={genero.label} value={genero.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Correo Electrónico</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.telefono}
          onChangeText={(value) => handleInputChange('telefono', value)}
          placeholder="442-123-4567"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Dirección</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.direccion}
          onChangeText={(value) => handleInputChange('direccion', value)}
          placeholder="Calle, número, colonia, ciudad"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Información Médica */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Información Médica
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Tipo de Sangre</Text>
        <View style={[styles.pickerContainer, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border 
        }]}>
          <Picker
            selectedValue={formData.tipo_sangre}
            onValueChange={(value) => handleInputChange('tipo_sangre', value)}
            style={{ color: theme.colors.text }}
          >
            <Picker.Item label="Seleccionar" value="" />
            {TIPOS_SANGRE.map((tipo) => (
              <Picker.Item key={tipo} label={tipo} value={tipo} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Alergias</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.alergias}
          onChangeText={(value) => handleInputChange('alergias', value)}
          placeholder="Describe tus alergias o medicamentos a los que eres alérgico"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Contacto de Emergencia */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Contacto de Emergencia
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Nombre del Contacto</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.contacto_emergencia}
          onChangeText={(value) => handleInputChange('contacto_emergencia', value)}
          placeholder="Nombre completo"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono de Emergencia</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.telefono_emergencia}
          onChangeText={(value) => handleInputChange('telefono_emergencia', value)}
          placeholder="442-123-4567"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      {/* Botones */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleGuardar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Guardar Cambios</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: theme.colors.border }]}
        onPress={() => navigation.goBack()}
        disabled={loading}
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
    marginBottom: 20,
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
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
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

export default EditarPerfilScreen;