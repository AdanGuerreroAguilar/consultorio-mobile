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
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const EditarPerfilUsuarioScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, refreshUser } = useAuth();

  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [apellido, setApellido] = useState(user?.apellido || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleGuardar = async () => {
    if (!nombre || !apellido || !email) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      await apiClient.put(`/usuarios/${user.id}`, {
        nombre,
        apellido,
        email,
        telefono: telefono || null,
      });

      await refreshUser();
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setEditando(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo actualizar el perfil'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    // Restaurar valores originales
    setNombre(user?.nombre || '');
    setApellido(user?.apellido || '');
    setTelefono(user?.telefono || '');
    setEmail(user?.email || '');
    setEditando(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="person" size={50} color={theme.colors.primary} />
          </View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.nombre} {user?.apellido}
          </Text>
          <Text style={[styles.userRole, { color: theme.colors.textSecondary }]}>
            {user?.especialidad ? `Dr. ${user.especialidad}` : 'Administrador'}
          </Text>
        </View>

        {/* Botón Editar/Cancelar */}
        {!editando ? (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setEditando(true)}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.colors.error }]}
            onPress={handleCancelar}
          >
            <Ionicons name="close-outline" size={20} color="#FFFFFF" />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        {/* Campos de información */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
            {editando ? (
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.card, color: theme.colors.text },
                ]}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre"
                placeholderTextColor={theme.colors.textSecondary}
              />
            ) : (
              <View style={[styles.infoBox, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {nombre}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Apellido *</Text>
            {editando ? (
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.card, color: theme.colors.text },
                ]}
                value={apellido}
                onChangeText={setApellido}
                placeholder="Apellido"
                placeholderTextColor={theme.colors.textSecondary}
              />
            ) : (
              <View style={[styles.infoBox, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {apellido}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Email *</Text>
            {editando ? (
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.card, color: theme.colors.text },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <View style={[styles.infoBox, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {email}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono</Text>
            {editando ? (
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.card, color: theme.colors.text },
                ]}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="1234567890"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />
            ) : (
              <View style={[styles.infoBox, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {telefono || 'No especificado'}
                </Text>
              </View>
            )}
          </View>

          {user?.especialidad && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Especialidad</Text>
              <View style={[styles.infoBox, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {user.especialidad}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Botón Guardar (solo visible al editar) */}
        {editando && (
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.colors.success },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleGuardar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
  },
  editButton: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
  infoBox: {
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoText: {
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default EditarPerfilUsuarioScreen;