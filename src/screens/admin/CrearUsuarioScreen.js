// screens/admin/CrearUsuarioScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const roles = ["admin", "doctor", "paciente"];

const CrearUsuarioScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');
  const [password, setPassword] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);

  // ============================================================
  // VALIDACIONES
  // ============================================================
  const validar = () => {
    if (!nombre.trim()) return "El nombre es obligatorio";
    if (!apellido.trim()) return "El apellido es obligatorio";

    if (!email.trim()) return "El email es obligatorio";
    if (!email.includes("@")) return "El correo no es válido";

    if (!rol) return "Selecciona un rol";

    if (!password.trim()) return "La contraseña es obligatoria";
    if (password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres";

    return null;
  };

  // ============================================================
  // CREAR USUARIO
  // ============================================================
  const handleCrear = () => {
    const error = validar();
    if (error) return Alert.alert("Error", error);

    // Confirmación de seguridad
    Alert.alert(
      "Confirmación",
      `¿Registrar a ${nombre} ${apellido} como ${rol}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => crearUsuario(),
        },
      ]
    );
  };

  const crearUsuario = async () => {
    setLoading(true);
    try {
      const datos = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        rol,
        password: password.trim(),
        telefono: telefono.trim() || null,
        especialidad: rol === 'doctor' ? especialidad.trim() : null,
      };

      // ✅ CORREGIDO: Ruta con /api/
      await apiClient.post('/api/usuarios', datos);

      Alert.alert("Éxito", "Usuario creado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.log("Error creando usuario:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "No se pudo crear el usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Datos del Usuario
        </Text>

        {/* Nombre */}
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

        {/* Apellido */}
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

        {/* Email */}
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

        {/* Teléfono */}
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

        {/* Rol */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Rol *</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
            <Picker
              selectedValue={rol}
              onValueChange={(value) => setRol(value)}
              style={{ color: theme.colors.text }}
            >
              <Picker.Item label="Seleccionar rol..." value="" />
              {roles.map((r) => (
                <Picker.Item key={r} label={r.toUpperCase()} value={r} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Especialidad (solo si es doctor) */}
        {rol === 'doctor' && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Especialidad</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={especialidad}
              onChangeText={setEspecialidad}
              placeholder="Ej: Pediatría, Cardiología..."
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        )}

        {/* Contraseña */}
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

        {/* Botón Crear */}
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
              <Text style={styles.crearButtonText}>Crear Usuario</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CrearUsuarioScreen;

// ============================================================
// ESTILOS
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
  },

  inputGroup: { marginBottom: 15 },

  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
  },

  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },

  pickerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  crearButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },

  crearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  buttonDisabled: { opacity: 0.6 },
});