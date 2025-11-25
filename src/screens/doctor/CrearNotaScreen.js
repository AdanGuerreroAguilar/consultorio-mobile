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
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const CrearNotaScreen = ({ route, navigation }) => {
  const { pacienteId, citaId } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    diagnostico: '',
    tratamiento: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCrear = async () => {
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      Alert.alert('Error', 'Título y contenido son obligatorios');
      return;
    }

    setLoading(true);
    
    try {
      await apiClient.post('/notas', {
        paciente_id: pacienteId,
        cita_id: citaId || null,
        titulo: formData.titulo.trim(),
        contenido: formData.contenido.trim(),
        diagnostico: formData.diagnostico.trim() || null,
        tratamiento: formData.tratamiento.trim() || null,
      });
      
      Alert.alert(
        'Éxito',
        'Nota médica creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error al crear nota:', error);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo crear la nota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Título *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.titulo}
          onChangeText={(value) => handleInputChange('titulo', value)}
          placeholder="Ej: Consulta de seguimiento"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Contenido *</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.contenido}
          onChangeText={(value) => handleInputChange('contenido', value)}
          placeholder="Descripción detallada de la consulta, síntomas observados, hallazgos..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Diagnóstico</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.diagnostico}
          onChangeText={(value) => handleInputChange('diagnostico', value)}
          placeholder="Diagnóstico clínico o impresión diagnóstica"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Tratamiento / Plan</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={formData.tratamiento}
          onChangeText={(value) => handleInputChange('tratamiento', value)}
          placeholder="Medicamentos prescritos, indicaciones, plan de seguimiento..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleCrear}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Guardar Nota</Text>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
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
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
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

export default CrearNotaScreen;