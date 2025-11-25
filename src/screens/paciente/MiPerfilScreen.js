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

const MiPerfilScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    setLoading(true);
    try {
      const data = await pacientesAPI.getPaciente(user.paciente_id);
      setPaciente(data);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
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

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!paciente) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Cargando...</Text>
      </View>
    );
  }

  const edad = calcularEdad(paciente.fecha_nacimiento);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={cargarPerfil} />
      }
    >
      {/* Header con avatar */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: '#FFFFFF' }]}>
            <Ionicons name="person" size={60} color={theme.colors.primary} />
          </View>
        </View>
        <Text style={styles.nombre}>
          {paciente.nombre} {paciente.apellido}
        </Text>
        {edad && (
          <Text style={styles.edad}>
            {edad} años
          </Text>
        )}
      </View>

      {/* Información personal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Información Personal
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Correo electrónico
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {paciente.email || 'No especificado'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={24} color={theme.colors.primary} />
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
            <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Fecha de nacimiento
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatearFecha(paciente.fecha_nacimiento)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="transgender-outline" size={24} color={theme.colors.primary} />
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
            <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
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
      </View>

      {/* Información médica */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Información Médica
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="water-outline" size={24} color={theme.colors.danger} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Tipo de sangre
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {paciente.tipo_sangre || 'No especificado'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="alert-circle-outline" size={24} color={theme.colors.warning} />
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
      </View>

      {/* Contacto de emergencia */}
      {(paciente.contacto_emergencia || paciente.telefono_emergencia) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contacto de Emergencia
          </Text>

          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={24} color={theme.colors.danger} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                  Nombre
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {paciente.contacto_emergencia || 'No especificado'}
                </Text>
              </View>
            </View>

            {paciente.telefono_emergencia && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={24} color={theme.colors.danger} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                      Teléfono
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {paciente.telefono_emergencia}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      {/* Opciones */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('EditarPerfil', { paciente })}
        >
          <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.optionText, { color: theme.colors.text }]}>
            Editar Perfil
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Ajustes')}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.optionText, { color: theme.colors.text }]}>
            Ajustes
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.colors.card }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.colors.danger} />
          <Text style={[styles.optionText, { color: theme.colors.danger }]}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nombre: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  edad: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 15,
  },
});

export default MiPerfilScreen;