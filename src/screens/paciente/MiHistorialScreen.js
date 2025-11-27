import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { pacientesAPI } from '../../api/pacientes';

const MiHistorialScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [historial, setHistorial] = useState({
    citas: [],
    notas: [],
    signos_vitales: [],
  });
  const [loading, setLoading] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('citas');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando historial para paciente_id:', user?.paciente_id);
      console.log('👤 Usuario actual:', user);

      if (!user || !user.paciente_id) {
        console.error('❌ No hay usuario o paciente_id - cancelando carga de historial');
        Alert.alert('Error', 'Sesión no válida. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      const data = await pacientesAPI.getHistorial(user.paciente_id);
      setHistorial(data);
      console.log('✅ Historial cargado correctamente');
    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
      console.error('❌ Error detail:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      Alert.alert('Error', 'No se pudo cargar el historial. ' + (error.response?.data?.detail || error.message));
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
    });
  };

  const formatearFechaCompleta = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderCitas = () => (
    <View>
      {historial.citas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No hay citas en el historial
          </Text>
        </View>
      ) : (
        historial.citas.map((cita) => (
          <View key={cita.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {cita.motivo}
              </Text>
              <View style={[
                styles.badge,
                { backgroundColor: theme.colors.primary + '20' }
              ]}>
                <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                  {cita.estado}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardInfo}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.cardInfoText, { color: theme.colors.textSecondary }]}>
                {formatearFechaCompleta(cita.fecha_hora)}
              </Text>
            </View>

            <View style={styles.cardInfo}>
              <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.cardInfoText, { color: theme.colors.textSecondary }]}>
                Dr. {cita.doctor_nombre} {cita.doctor_apellido}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderNotas = () => (
    <View>
      {historial.notas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No hay notas médicas
          </Text>
        </View>
      ) : (
        historial.notas.map((nota) => (
          <View key={nota.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {nota.titulo}
            </Text>
            
            <View style={styles.cardInfo}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.cardInfoText, { color: theme.colors.textSecondary }]}>
                {formatearFecha(nota.fecha_nota)}
              </Text>
            </View>

            <View style={styles.cardInfo}>
              <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.cardInfoText, { color: theme.colors.textSecondary }]}>
                Dr. {nota.doctor_nombre}
              </Text>
            </View>

            {nota.contenido && (
              <Text style={[styles.notaContenido, { color: theme.colors.text }]} numberOfLines={3}>
                {nota.contenido}
              </Text>
            )}

            {nota.diagnostico && (
              <View style={styles.diagnosticoContainer}>
                <Text style={[styles.diagnosticoLabel, { color: theme.colors.textSecondary }]}>
                  Diagnóstico:
                </Text>
                <Text style={[styles.diagnosticoText, { color: theme.colors.text }]}>
                  {nota.diagnostico}
                </Text>
              </View>
            )}

            {nota.tratamiento && (
              <View style={styles.tratamientoContainer}>
                <Text style={[styles.tratamientoLabel, { color: theme.colors.textSecondary }]}>
                  Tratamiento:
                </Text>
                <Text style={[styles.tratamientoText, { color: theme.colors.text }]}>
                  {nota.tratamiento}
                </Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderSignos = () => (
    <View>
      {historial.signos_vitales.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="pulse-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No hay signos vitales registrados
          </Text>
        </View>
      ) : (
        historial.signos_vitales.map((signo) => (
          <View key={signo.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Registro de Signos Vitales
              </Text>
              <Text style={[styles.fechaSmall, { color: theme.colors.textSecondary }]}>
                {formatearFecha(signo.fecha_registro)}
              </Text>
            </View>

            <View style={styles.signosGrid}>
              {signo.peso && (
                <View style={styles.signoItem}>
                  <Ionicons name="scale-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.signoLabel, { color: theme.colors.textSecondary }]}>
                    Peso
                  </Text>
                  <Text style={[styles.signoValue, { color: theme.colors.text }]}>
                    {signo.peso} kg
                  </Text>
                </View>
              )}

              {signo.altura && (
                <View style={styles.signoItem}>
                  <Ionicons name="resize-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.signoLabel, { color: theme.colors.textSecondary }]}>
                    Altura
                  </Text>
                  <Text style={[styles.signoValue, { color: theme.colors.text }]}>
                    {signo.altura} m
                  </Text>
                </View>
              )}

              {signo.presion_sistolica && signo.presion_diastolica && (
                <View style={styles.signoItem}>
                  <Ionicons name="heart-outline" size={20} color={theme.colors.danger} />
                  <Text style={[styles.signoLabel, { color: theme.colors.textSecondary }]}>
                    Presión
                  </Text>
                  <Text style={[styles.signoValue, { color: theme.colors.text }]}>
                    {signo.presion_sistolica}/{signo.presion_diastolica}
                  </Text>
                </View>
              )}

              {signo.temperatura && (
                <View style={styles.signoItem}>
                  <Ionicons name="thermometer-outline" size={20} color={theme.colors.warning} />
                  <Text style={[styles.signoLabel, { color: theme.colors.textSecondary }]}>
                    Temp.
                  </Text>
                  <Text style={[styles.signoValue, { color: theme.colors.text }]}>
                    {signo.temperatura}°C
                  </Text>
                </View>
              )}

              {signo.frecuencia_cardiaca && (
                <View style={styles.signoItem}>
                  <Ionicons name="pulse" size={20} color={theme.colors.danger} />
                  <Text style={[styles.signoLabel, { color: theme.colors.textSecondary }]}>
                    FC
                  </Text>
                  <Text style={[styles.signoValue, { color: theme.colors.text }]}>
                    {signo.frecuencia_cardiaca} lpm
                  </Text>
                </View>
              )}

              {signo.saturacion_oxigeno && (
                <View style={styles.signoItem}>
                  <Ionicons name="water-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.signoLabel, { color: theme.colors.textSecondary }]}>
                    SpO2
                  </Text>
                  <Text style={[styles.signoValue, { color: theme.colors.text }]}>
                    {signo.saturacion_oxigeno}%
                  </Text>
                </View>
              )}
            </View>

            {signo.notas && (
              <View style={styles.notasSignos}>
                <Text style={[styles.notasSignosText, { color: theme.colors.textSecondary }]}>
                  {signo.notas}
                </Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            seccionActiva === 'citas' && { borderBottomColor: theme.colors.primary }
          ]}
          onPress={() => setSeccionActiva('citas')}
        >
          <Ionicons
            name="calendar-outline"
            size={24}
            color={seccionActiva === 'citas' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: seccionActiva === 'citas' ? theme.colors.primary : theme.colors.textSecondary }
          ]}>
            Citas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            seccionActiva === 'notas' && { borderBottomColor: theme.colors.primary }
          ]}
          onPress={() => setSeccionActiva('notas')}
        >
          <Ionicons
            name="document-text-outline"
            size={24}
            color={seccionActiva === 'notas' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: seccionActiva === 'notas' ? theme.colors.primary : theme.colors.textSecondary }
          ]}>
            Notas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            seccionActiva === 'signos' && { borderBottomColor: theme.colors.primary }
          ]}
          onPress={() => setSeccionActiva('signos')}
        >
          <Ionicons
            name="pulse-outline"
            size={24}
            color={seccionActiva === 'signos' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: seccionActiva === 'signos' ? theme.colors.primary : theme.colors.textSecondary }
          ]}>
            Signos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarHistorial} />
        }
      >
        {seccionActiva === 'citas' && renderCitas()}
        {seccionActiva === 'notas' && renderNotas()}
        {seccionActiva === 'signos' && renderSignos()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    padding: 15,
    borderRadius: 15,
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
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cardInfoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  notaContenido: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  diagnosticoContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    borderRadius: 8,
  },
  diagnosticoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  diagnosticoText: {
    fontSize: 14,
  },
  tratamientoContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 8,
  },
  tratamientoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tratamientoText: {
    fontSize: 14,
  },
  fechaSmall: {
    fontSize: 12,
  },
  signosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  signoItem: {
    width: '30%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  signoLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  signoValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  notasSignos: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  notasSignosText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },
});

export default MiHistorialScreen;