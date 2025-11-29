import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { pacientesAPI } from '../../api/pacientes';

const FichaPacienteScreen = ({ route, navigation }) => {
  const { pacienteId } = route.params;
  const { theme } = useTheme();
  const [paciente, setPaciente] = useState(null);
  const [historial, setHistorial] = useState({
    citas: [],
    notas: [],
    signos_vitales: [],
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info'); // info, citas, notas, signos

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [dataPaciente, dataHistorial] = await Promise.all([
        pacientesAPI.getPaciente(pacienteId),
        pacientesAPI.getHistorial(pacienteId),
      ]);
      setPaciente(dataPaciente);
      setHistorial(dataHistorial);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del paciente');
    } finally {
      setLoading(false);
    }
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!paciente) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.danger} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          No se encontró el paciente
        </Text>
      </View>
    );
  }

  const edad = calcularEdad(paciente.fecha_nacimiento);

  const renderInfo = () => (
    <ScrollView style={styles.tabContent}>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Información Personal
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Fecha de Nacimiento
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {formatearFecha(paciente.fecha_nacimiento)} ({edad} años)
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="transgender-outline" size={20} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Género
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {paciente.genero === 'M' ? 'Masculino' : paciente.genero === 'F' ? 'Femenino' : 'Otro'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Email
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {paciente.email || 'No especificado'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Teléfono
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {paciente.telefono || 'No especificado'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Dirección
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {paciente.direccion || 'No especificada'}
            </Text>
          </View>
        </View>
      </View>

      {/* Información Médica */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Información Médica
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="water-outline" size={20} color={theme.colors.danger} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Tipo de Sangre
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {paciente.tipo_sangre || 'No especificado'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Alergias
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {paciente.alergias || 'Ninguna registrada'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
  const renderCitas = () => (
    <ScrollView style={styles.tabContent}>
      {historial.citas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No hay citas registradas
          </Text>
        </View>
      ) : (
        historial.citas.map((cita) => (
          <View key={cita.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.citaHeader}>
              <Text style={[styles.citaFecha, { color: theme.colors.text }]}>
                {formatearFecha(cita.fecha_hora)}
              </Text>
              <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                  {cita.estado}
                </Text>
              </View>
            </View>
            <Text style={[styles.citaMotivo, { color: theme.colors.text }]}>
              {cita.motivo}
            </Text>
            <Text style={[styles.citaDoctor, { color: theme.colors.textSecondary }]}>
              Dr. {cita.doctor_nombre} {cita.doctor_apellido}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderNotas = () => (
    <ScrollView style={styles.tabContent}>
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
            <Text style={[styles.notaTitulo, { color: theme.colors.text }]}>
              {nota.titulo}
            </Text>
            <Text style={[styles.notaFecha, { color: theme.colors.textSecondary }]}>
              {formatearFecha(nota.fecha_nota)} - Dr. {nota.doctor_nombre}
            </Text>
            <Text style={[styles.notaContenido, { color: theme.colors.text }]} numberOfLines={3}>
              {nota.contenido}
            </Text>

            {nota.diagnostico && (
              <View style={styles.diagnosticoBox}>
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
    </ScrollView>
  );

  const renderSignos = () => (
    <ScrollView style={styles.tabContent}>
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
            <Text style={[styles.signoFecha, { color: theme.colors.text }]}>
              {formatearFecha(signo.fecha_registro)}
            </Text>

            <View style={styles.signosGrid}>
              {signo.peso && (
                <View style={styles.signoItem}>
                  <Text style={[styles.signoLabel, { color: theme.colors.textSecondary }]}>
                    Peso
                  </Text>
                  <Text style={[styles.signoValue, { color: theme.colors.text }]}>
                    {signo.peso} kg
                  </Text>
                </View>
              )}

              {signo.presion_sistolica && (
                <View style={styles.signoItem}>
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
                  <Text style={[styles.signoLabel, { color: theme.colors.textSecondary }]}>
                    Temperatura
                  </Text>
                  <Text style={[styles.signoValue, { color: theme.colors.text }]}>
                    {signo.temperatura}°C
                  </Text>
                </View>
              )}

              {signo.frecuencia_cardiaca && (
                <View style={styles.signoItem}>
                  <Text style={[styles.signoLabel, { color: theme.colors.textSecondary }]}>
                    FC
                  </Text>
                  <Text style={[styles.signoValue, { color: theme.colors.text }]}>
                    {signo.frecuencia_cardiaca} lpm
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.avatarLarge}>
          <Ionicons name="person" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.nombreHeader}>
          {paciente.nombre} {paciente.apellido}
        </Text>
        {edad && <Text style={styles.edadHeader}>{edad} años</Text>}
      </View>

      {/* ACCIONES (INCLUYE IMAGEN) */}
      <View style={styles.actionsBar}>
        
        {/* SIGNOS */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('RegistrarSignos', { pacienteId })}
        >
          <Ionicons name="fitness" size={20} color="#FFFFFF" />
          <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>
            Signos
          </Text>
        </TouchableOpacity>

        {/* NOTA MÉDICA */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('CrearNota', { pacienteId })}
        >
          <Ionicons name="document-text" size={20} color={theme.colors.text} />
          <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>
            Nota
          </Text>
        </TouchableOpacity>

        {/* IMAGEN (nuevo botón) */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('SubirImagen', { pacienteId })}
        >
          <Ionicons name="image" size={20} color={theme.colors.text} />
          <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>
            Imagen
          </Text>
        </TouchableOpacity>

        {/* EDITAR */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('EditarPaciente', { pacienteId })}
        >
          <Ionicons name="create" size={20} color={theme.colors.text} />
          <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>
            Editar
          </Text>
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={[styles.tabs, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, tab === 'info' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setTab('info')}
        >
          <Text style={[styles.tabText, { color: tab === 'info' ? theme.colors.primary : theme.colors.textSecondary }]}>
            Info
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'citas' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setTab('citas')}
        >
          <Text style={[styles.tabText, { color: tab === 'citas' ? theme.colors.primary : theme.colors.textSecondary }]}>
            Citas ({historial.citas.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'notas' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setTab('notas')}
        >
          <Text style={[styles.tabText, { color: tab === 'notas' ? theme.colors.primary : theme.colors.textSecondary }]}>
            Notas ({historial.notas.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'signos' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setTab('signos')}
        >
          <Text style={[styles.tabText, { color: tab === 'signos' ? theme.colors.primary : theme.colors.textSecondary }]}>
            Signos ({historial.signos_vitales.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO */}
      {tab === 'info' && renderInfo()}
      {tab === 'citas' && renderCitas()}
      {tab === 'notas' && renderNotas()}
      {tab === 'signos' && renderSignos()}
    </View>
  );
};

/* ============================
   ESTILOS
=============================== */

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, marginTop: 15 },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  nombreHeader: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  edadHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
    marginTop: 4,
  },

  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnText: { fontSize: 14, fontWeight: '600' },

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
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 14, fontWeight: '600' },

  tabContent: { flex: 1, padding: 15 },

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
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoContent: { flex: 1, marginLeft: 15 },

  infoLabel: { fontSize: 12, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 15 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, marginTop: 15 },

  citaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  citaFecha: { fontSize: 16, fontWeight: '600' },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },

  citaMotivo: { fontSize: 14, marginBottom: 6 },
  citaDoctor: { fontSize: 14 },

  notaTitulo: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  notaFecha: { fontSize: 12, marginBottom: 10 },
  notaContenido: { fontSize: 14, lineHeight: 20 },

  diagnosticoBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    borderRadius: 8,
  },
  diagnosticoLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  diagnosticoText: { fontSize: 14 },

  signoFecha: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  signosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  signoItem: {
    width: '48%',
    padding: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 10,
  },
  signoLabel: { fontSize: 12, marginBottom: 4 },
  signoValue: { fontSize: 18, fontWeight: '600' },
});

export default FichaPacienteScreen;
