import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const PerfilScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout, updateUser } = useAuth();

  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [apellido, setApellido] = useState(user?.apellido || "");
  const [telefono, setTelefono] = useState(user?.telefono || "");

  const handleGuardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert("Error", "Nombre y apellido son obligatorios");
      return;
    }

    setLoading(true);

    try {
      await updateUser({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
      });

      Alert.alert("Éxito", "Perfil actualizado correctamente");
      setEditando(false);

    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.primary + "20" },
            ]}
          >
            <Ionicons
              name={
                user?.rol === "doctor"
                  ? "medical"
                  : user?.rol === "admin"
                  ? "shield"
                  : "person"
              }
              size={50}
              color={theme.colors.primary}
            />
          </View>

          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {nombre} {apellido}
          </Text>

          <Text
            style={[styles.userRole, { color: theme.colors.textSecondary }]}
          >
            {user.rol}
          </Text>

          <Text
            style={[styles.userEmail, { color: theme.colors.textSecondary }]}
          >
            {user.email}
          </Text>
        </View>

        {/* BOTÓN EDITAR */}
        {!editando ? (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setEditando(true)}
          >
            <Ionicons name="create-outline" color="#fff" size={20} />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.colors.danger }]}
            onPress={() => {
              setNombre(user.nombre);
              setApellido(user.apellido);
              setTelefono(user.telefono);
              setEditando(false);
            }}
          >
            <Ionicons name="close" color="#fff" size={20} />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        {/* FORMULARIO */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Información Personal
          </Text>

          {/* Nombre */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Nombre
            </Text>

            {editando ? (
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.background, color: theme.colors.text },
                ]}
                value={nombre}
                onChangeText={setNombre}
              />
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {nombre}
              </Text>
            )}
          </View>

          {/* Apellido */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Apellido
            </Text>

            {editando ? (
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.background, color: theme.colors.text },
                ]}
                value={apellido}
                onChangeText={setApellido}
              />
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {apellido}
              </Text>
            )}
          </View>

          {/* Teléfono */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Teléfono
            </Text>

            {editando ? (
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.background, color: theme.colors.text },
                ]}
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {telefono || "No especificado"}
              </Text>
            )}
          </View>

          {/* Especialidad (solo doctor) */}
          {user.especialidad && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Especialidad
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {user.especialidad}
              </Text>
            </View>
          )}
        </View>

        {/* GUARDAR */}
        {editando && (
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.colors.success },
              loading && { opacity: 0.6 },
            ]}
            onPress={handleGuardar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" color="#fff" size={20} />
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* CONFIGURACIÓN */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Configuración
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" color={theme.colors.text} size={22} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Modo Oscuro
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#777", true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* CERRAR SESIÓN */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: theme.colors.danger + "20" },
          ]}
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

export default PerfilScreen;
