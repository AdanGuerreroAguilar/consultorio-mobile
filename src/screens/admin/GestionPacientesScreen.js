// screens/admin/GestionPacientesScreen.js

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../api/client";
import { useFocusEffect } from "@react-navigation/native";

const GestionPacientesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // CARGAR PACIENTES AL ENTRAR
  // ============================================================
  useFocusEffect(
    useCallback(() => {
      cargarPacientes();
    }, [])
  );

  const cargarPacientes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/pacientes");
      setPacientes(response.data);
      setPacientesFiltrados(response.data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los pacientes");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // BÚSQUEDA LOCAL
  // ============================================================
  const handleSearch = (text) => {
    setSearchQuery(text);

    if (!text.trim()) {
      setPacientesFiltrados(pacientes);
      return;
    }

    const filtered = pacientes.filter((p) =>
      `${p.nombre} ${p.apellido}`
        .toLowerCase()
        .includes(text.toLowerCase())
    );

    setPacientesFiltrados(filtered);
  };

  // ============================================================
  // ELIMINAR PACIENTE
  // ============================================================
  const eliminarPaciente = (paciente) => {
    Alert.alert(
      "Confirmación",
      `¿Eliminar a "${paciente.nombre} ${paciente.apellido}"? Esta acción NO se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/pacientes/${paciente.id}`);

              setPacientes((prev) => prev.filter((p) => p.id !== paciente.id));
              setPacientesFiltrados((prev) =>
                prev.filter((p) => p.id !== paciente.id)
              );

              Alert.alert("Éxito", "Paciente eliminado");
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.detail ||
                  "No se pudo eliminar el paciente"
              );
            }
          },
        },
      ]
    );
  };

  // ============================================================
  // TARJETA PACIENTE
  // ============================================================
  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.row}>
        <Ionicons
          name="person-circle-outline"
          size={40}
          color={theme.colors.primary}
        />
        <View style={{ marginLeft: 12 }}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {item.nombre} {item.apellido}
          </Text>

          <Text
            style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}
          >
            {item.email || "Sin correo"}
          </Text>
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() =>
            navigation.navigate("EditarPaciente", { paciente: item })
          }
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn]}
          onPress={() => eliminarPaciente(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============================================================
  // UI PRINCIPAL
  // ============================================================
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={theme.colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Buscar paciente..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={pacientesFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* FAB Crear Paciente */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("CrearPaciente")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default GestionPacientesScreen;

// ============================================================
// ESTILOS
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9e9e9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  cardSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },

  editBtn: {
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },

  deleteBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#E53935",
  },

  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
});
