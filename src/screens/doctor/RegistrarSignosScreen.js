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

const RegistrarSignosScreen = ({ route, navigation }) => {
  const { pacienteId, citaId } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    peso: '',
    altura: '',
    presion_sistolica: '',
    presion_diastolica: '',
    temperatura: '',
    frecuencia_cardiaca: '',
    frecuencia_respiratoria: '',
    saturacion_oxigeno: '',
    notas: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const parseNumber = (value, type = "float") => {
    if (!value || value.trim() === "") return null;
    return type === "int" ? parseInt(value) : parseFloat(value);
  };

  const handleRegistrar = async () => {
    const tieneValores = Object.keys(formData).some(
      (k) => k !== "notas" && formData[k].trim() !== ""
    );

    if (!tieneValores) {
      Alert.alert("Error", "Debes ingresar al menos un signo vital");
      return;
    }

    setLoading(true);

    try {
      const datos = {
        paciente_id: pacienteId,
        cita_id: citaId || null,
        peso: parseNumber(formData.peso),
        altura: parseNumber(formData.altura),
        presion_sistolica: parseNumber(formData.presion_sistolica, "int"),
        presion_diastolica: parseNumber(formData.presion_diastolica, "int"),
        temperatura: parseNumber(formData.temperatura),
        frecuencia_cardiaca: parseNumber(formData.frecuencia_cardiaca, "int"),
        frecuencia_respiratoria: parseNumber(formData.frecuencia_respiratoria, "int"),
        saturacion_oxigeno: parseNumber(formData.saturacion_oxigeno, "int"),
        notas: formData.notas.trim() || null,
      };

      console.log(" Enviando datos signos:", datos);


      await apiClient.post('/api/signos-vitales', datos);

      Alert.alert(
        "Éxito",
        "Signos vitales registrados correctamente",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error(" Error al registrar signos:", error.response?.data || error);
      Alert.alert(
        "Error",
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "No se pudieron registrar los signos vitales"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Mediciones Básicas
      </Text>

      {/* Peso y Altura */}
      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Peso (kg)</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border 
            }]}
            value={formData.peso}
            onChangeText={(value) => handleInputChange('peso', value)}
            placeholder="75.5"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Altura (m)</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border 
            }]}
            value={formData.altura}
            onChangeText={(value) => handleInputChange('altura', value)}
            placeholder="1.75"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Signos Vitales
      </Text>

      {/* Presión arterial */}
      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Presión Sistólica</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={formData.presion_sistolica}
            onChangeText={(value) => handleInputChange('presion_sistolica', value)}
            placeholder="120"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Presión Diastólica</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={formData.presion_diastolica}
            onChangeText={(value) => handleInputChange('presion_diastolica', value)}
            placeholder="80"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Temperatura y FC */}
      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Temperatura (°C)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={formData.temperatura}
            onChangeText={(value) => handleInputChange('temperatura', value)}
            placeholder="36.5"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>FC (lpm)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={formData.frecuencia_cardiaca}
            onChangeText={(value) => handleInputChange('frecuencia_cardiaca', value)}
            placeholder="72"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* FR y SpO2 */}
      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>FR (rpm)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={formData.frecuencia_respiratoria}
            onChangeText={(value) => handleInputChange('frecuencia_respiratoria', value)}
            placeholder="16"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>SpO2 (%)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={formData.saturacion_oxigeno}
            onChangeText={(value) => handleInputChange('saturacion_oxigeno', value)}
            placeholder="98"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Notas */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Notas</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
          value={formData.notas}
          onChangeText={(value) => handleInputChange('notas', value)}
          placeholder="Observaciones adicionales..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Botón guardar */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleRegistrar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Guardar Signos Vitales</Text>
        )}
      </TouchableOpacity>

      {/* Cancelar */}
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
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  halfWidth: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
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
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RegistrarSignosScreen;
