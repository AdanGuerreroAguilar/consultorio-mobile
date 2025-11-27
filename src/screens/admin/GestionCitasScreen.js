// screens/admin/GestionCitasScreen.js

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../api/client";

const GestionCitasScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [citas, setCitas] = useState([]);
  const [citasFiltradas, setCitasFiltradas] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ============================================================
  // CARGAR CITAS AL ENTRAR
  // ============================================================
  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [])
  );

  const cargarCitas = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/citas");

      setCitas(response.data);
      setCitasFiltradas(response.data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // BUSCAR
  // ============================================================
  const handleSearch = (text) => {
    setSearchQuery(text);

    if (!text.trim()) {
      setCitasFiltradas(citas);
      return;
    }

    const filtro = citas.filter((c) => {
      const paciente = `${c.paciente_nombre} ${c.paciente_apellido}`.toLowerCase();
      const medico = c.doctor_nombre?.toLowerCase() || "";

      return (
        paciente.includes(text.toLowerCase()) ||
        medico.includes(text.toLowerCase())
      );
    });

    setCitasFiltradas(filtro);
  };

  // ============================================================
  // CANCELAR CITA
  // ============================================================
  const handleCancelar = (cita) => {
    Alert.alert(
      "Cancelar cita",
      `¿Cancelar la cita del paciente "${cita.paciente_nombre}"?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Cancelar Cita",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.put(`/citas/${cita.id}`, { estado: "cancelada" });

              // Cambio instantáneo en UI
              setCitas((prev) =>
                prev.map((c) =>
                  c.id === cita.id ? { ...c, estado: "cancelada" } : c
                )
              );
              setCitasFiltradas((prev) =>
                prev.map((c) =>
                  c.id === cita.id ? { ...c, estado: "cancelada" } : c
                )
              );

              Alert.alert("Éxito", "Cita cancelada");
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.detail || "No se pudo cancelar la cita"
              );
            }
          },
        },
      ]
    );
  };

  // ============================================================
  // TARJETA CITA
  // ============================================================
  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
        {item.paciente_nombre} {item.paciente_apellido}
      </Text>

      <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>
        Doctor: {item.doctor_nombre || "No asignado"}
      </Text>

      <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>
        Fecha: {item.fecha}
      </Text>

      <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>
        Hora: {item.hora}
      </Text>

      <Text
        style={[
          styles.estado,
          item.estado === "cancelada"
            ? { color: "#D32F2F" }
            : { color: theme.colors.primary },
        ]}
      >
        Estado: {item.estado}
      </Text>

      {/* ACCIONES */}
      <View style={styles.actions}>
        {item.estado !== "cancelada" && (
          <TouchableOpacity
            style={[styles.cancelButton]}
            onPress={() => handleCancelar(item)}
          >
            <Ionicons name="close-circle-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ============================================================
  // UI
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
          placeholder="Buscar cita..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 15 }}
        />
      ) : (
        <FlatList
          data={citasFiltradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* FAB Crear Cita */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("CrearCita")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default GestionCitasScreen;

// ============================================================
// ESTILOS
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5e5e5",
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

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },

  cardText: {
    fontSize: 14,
    marginBottom: 4,
  },

  estado: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: "700",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },

  cancelButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#D32F2F",
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
