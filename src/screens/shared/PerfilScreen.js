// screens/shared/PerfilScreen.js
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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const PerfilScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout, updateUser } = useAuth();

  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [apellido, setApellido] = useState(user?.apellido || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');

  const getRolDisplay = () => {
    switch (user?.rol) {
      case 'admin':
        return 'Administrador';
      case 'doctor':
        return user?.especialidad ? `Dr. - ${user.especialidad}` : 'Doctor';
      case 'paciente':
        return 'Paciente';
      default:
        return 'Usuario';
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert('Error', 'Nombre y apellido son obligatorios');
      return;
    }

    setLoading(true);

    try {
      await apiClient.put('/perfil', {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || null,
      });

      // Actualizar usuario local
      await updateUser({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || null,
      });

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setEditando(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setNombre(user?.nombre || '');
    setApellido(user?.apellido || '');
    setTelefono(user?.telefono || '');
    setEditando(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Avatar y nombre */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons 
              name={user?.rol === 'doctor' ? 'medical' : user?.rol === 'admin' ? 'shield' : 'person'} 
              size={50} 
              color={theme.colors.primary} 
            />
          </View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.nombre} {user?.apellido}
          </Text>
          <Text style={[styles.userRole, { color: theme.colors.textSecondary }]}>
            {getRolDisplay()}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        {/* Botón editar/cancelar */}
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
            style={[styles.cancelButton, { backgroundColor: theme.colors.danger }]}
            onPress={handleCancelar}
          >
            <Ionicons name="close-outline" size={20} color="#FFFFFF" />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        {/* Formulario */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Información Personal
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nombre</Text>
            {editando ? (
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre"
                placeholderTextColor={theme.colors.textSecondary}
              />
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>{nombre}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Apellido</Text>
            {editando ? (
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                value={apellido}
                onChangeText={setApellido}
                placeholder="Apellido"
                placeholderTextColor={theme.colors.textSecondary}
              />
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>{apellido}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Teléfono</Text>
            {editando ? (
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="442-123-4567"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {telefono || 'No especificado'}
              </Text>
            )}
          </View>

          {user?.especialidad && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Especialidad</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{user.especialidad}</Text>
            </View>
          )}
        </View>

        {/* Botón guardar */}
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

        {/* Configuración */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Configuración
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={22} color={theme.colors.text} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Modo Oscuro
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.danger + '15' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.colors.danger} />
          <Text style={[styles.logoutText, { color: theme.colors.danger }]}>
            Cerrar Sesión
          </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 25,
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
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
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
    borderRadius: 12,
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
  section: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PerfilScreen;