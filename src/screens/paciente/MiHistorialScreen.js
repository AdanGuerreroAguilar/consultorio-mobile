// screens/paciente/MiHistorialScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";

const { width } = Dimensions.get('window');
const API_BASE_URL = "http://192.168.0.200:8000"; //  IP

export default function MiHistorialScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [tab, setTab] = useState("citas");
  const [loading, setLoading] = useState(true);

  const [citas, setCitas] = useState([]);
  const [notas, setNotas] = useState([]);
  const [signos, setSignos] = useState([]);
  const [imagenes, setImagenes] = useState([]);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const pacienteId = user.paciente_id;

      if (!pacienteId) {
        console.log(" No hay paciente_id en el usuario");
        return;
      }

      console.log(" Cargando historial del paciente:", pacienteId);
      const response = await apiClient.get(`/api/pacientes/${pacienteId}/historial`);
      
      console.log(" Respuesta historial:", response.data);

      setCitas(response.data.citas || []);
      setNotas(response.data.notas || []);
      setSignos(response.data.signos_vitales || []);
      setImagenes(response.data.imagenes || []);

      console.log(" Imágenes cargadas:", response.data.imagenes?.length || 0);
    } catch (error) {
      console.log(" Error cargando historial:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const TabButton = ({ name, icon, count }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        tab === name && { borderBottomWidth: 3, borderBottomColor: theme.colors.primary },
      ]}
      onPress={() => setTab(name)}
    >
      <Ionicons
        name={icon}
        size={22}
        color={tab === name ? theme.colors.primary : theme.colors.textSecondary}
      />
      <Text
        style={[
          styles.tabText,
          { color: tab === name ? theme.colors.primary : theme.colors.textSecondary },
        ]}
      >
        {name.toUpperCase()}
        {count > 0 && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.textSecondary, marginTop: 10 }}>
          Cargando historial...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* TABS */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.colors.card }]}>
        <TabButton name="citas" icon="calendar-outline" count={citas.length} />
        <TabButton name="notas" icon="document-text-outline" count={notas.length} />
        <TabButton name="imagenes" icon="image-outline" count={imagenes.length} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* TAB: CITAS */}
        {tab === "citas" && (
          <>
            {citas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No hay citas registradas
                </Text>
              </View>
            ) : (
              citas.map((cita) => (
                <View key={cita.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                      {cita.motivo}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                        {cita.estado}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
                    {formatearFecha(cita.fecha_hora)}
                  </Text>
                  {cita.doctor_nombre && (
                    <Text style={[styles.cardInfo, { color: theme.colors.textSecondary }]}>
                      Dr. {cita.doctor_nombre} {cita.doctor_apellido}
                    </Text>
                  )}
                </View>
              ))
            )}
          </>
        )}

        {/* TAB: NOTAS */}
        {tab === "notas" && (
          <>
            {notas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No hay notas médicas
                </Text>
              </View>
            ) : (
              notas.map((nota) => (
                <View key={nota.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                    {nota.titulo}
                  </Text>
                  <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
                    {formatearFecha(nota.fecha_nota)}
                  </Text>
                  <Text style={[styles.cardContent, { color: theme.colors.text }]} numberOfLines={4}>
                    {nota.contenido}
                  </Text>
                  {nota.diagnostico && (
                    <View style={[styles.diagnosticoBox, { backgroundColor: theme.colors.warning + '10' }]}>
                      <Text style={[styles.diagnosticoLabel, { color: theme.colors.warning }]}>
                        Diagnóstico:
                      </Text>
                      <Text style={[styles.diagnosticoText, { color: theme.colors.text }]}>
                        {nota.diagnostico}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </>
        )}

        {/* TAB: IMÁGENES */}
        {tab === "imagenes" && (
          <>
            {imagenes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="image-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No hay imágenes médicas
                </Text>
              </View>
            ) : (
              imagenes.map((img) => (
                <View key={img.id} style={[styles.imageCard, { backgroundColor: theme.colors.card }]}>
                  <Image
                    source={{ uri: `${API_BASE_URL}/uploads/${img.url}` }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.imageInfo}>
                    {img.descripcion && (
                      <Text style={[styles.imageDescripcion, { color: theme.colors.text }]}>
                        {img.descripcion}
                      </Text>
                    )}
                    <Text style={[styles.imageFecha, { color: theme.colors.textSecondary }]}>
                      {formatearFecha(img.fecha_subida)}
                    </Text>
                    {img.doctor_nombre && (
                      <Text style={[styles.imageDoctor, { color: theme.colors.textSecondary }]}>
                        <Ionicons name="person-outline" size={14} />
                        {' '}Dr. {img.doctor_nombre} {img.doctor_apellido}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  tabButton: { 
    alignItems: "center",
    paddingBottom: 8,
  },
  tabText: { 
    fontSize: 11, 
    fontWeight: "600", 
    marginTop: 4 
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },

  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  cardTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    flex: 1,
    marginRight: 10,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  cardSubtitle: {
    fontSize: 13,
    marginBottom: 6,
  },

  cardInfo: {
    fontSize: 13,
    marginTop: 4,
  },

  cardContent: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  diagnosticoBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  diagnosticoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  diagnosticoText: {
    fontSize: 13,
  },

  imageCard: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  image: {
    width: '100%',
    height: width * 0.7, // Altura proporcional
  },

  imageInfo: {
    padding: 15,
  },

  imageDescripcion: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },

  imageFecha: {
    fontSize: 12,
    marginBottom: 4,
  },

  imageDoctor: {
    fontSize: 12,
    marginTop: 4,
  },
});