import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { pacientesAPI } from '../../api/pacientes';

const MiPerfilScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [])
  );

  const cargarPerfil = async () => {
    setLoading(true);
    setError(null);

    try {
      // Debug: verificar que tenemos paciente_id
      console.log('👤 Usuario en MiPerfil:', user);
      console.log('🆔 Paciente ID:', user?.paciente_id);

      if (!user?.paciente_id) {
        // Si no hay paciente_id, usar datos del usuario directamente
        console.warn('⚠️ No se encontró paciente_id, usando datos del usuario');
        setPaciente({
          nombre: user?.nombre || 'Usuario',
          apellido: user?.apellido || '',
          email: user?.email || '',
          telefono: user?.telefono || '',
          fecha_nacimiento: user?.fecha_nacimiento || null,
          genero: user?.genero || null,
          direccion: user?.direccion || '',
          tipo_sangre: user?.tipo_sangre || '',
          alergias: user?.alergias || '',
          contacto_emergencia: user?.contacto_emergencia || '',
          telefono_emergencia: user?.telefono_emergencia || '',
        });
        return;
      }

      const data = await pacientesAPI.getPaciente(user.paciente_id);
      console.log('✅ Datos del paciente cargados:', data);
      setPaciente(data);
    } catch (error) {
      console.error('❌ Error al cargar perfil:', error);
      console.error('Detalles:', error.response?.data || error.message);
      
      setError('No se pudo cargar el perfil');
      
      // Usar datos básicos del usuario como fallback
      setPaciente({
        nombre: user?.nombre || 'Usuario',
        apellido: user?.apellido || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
      });
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
          onPress: async () => {
            try {
              await logout();
              // La navegación se manejará automáticamente por el AuthContext
              // cuando isAuthenticated cambie a false
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    try {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return edad;
    } catch {
      return null;
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    try {
      return new Date(fecha).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return fecha;
    }
  };

  const getGeneroTexto = (genero) => {
    if (!genero) return 'No especificado';
    const generos = {
      'M': 'Masculino',
      'F': 'Femenino',
      'masculino': 'Masculino',
      'femenino': 'Femenino',
      'Otro': 'Otro',
    };
    return generos[genero] || genero;
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  const edad = paciente ? calcularEdad(paciente.fecha_nacimiento) : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={loading} 
          onRefresh={cargarPerfil}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Error banner */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: theme.colors.danger + '20' }]}>
          <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>
            {error}
          </Text>
        </View>
      )}

      {/* Header con avatar */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: '#FFFFFF' }]}>
            <Ionicons name="person" size={60} color={theme.colors.primary} />
          </View>
        </View>
        <Text style={styles.nombre}>
          {paciente?.nombre || 'Usuario'} {paciente?.apellido || ''}
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
                {paciente?.email || user?.email || 'No especificado'}
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
                {paciente?.telefono || 'No especificado'}
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
                {formatearFecha(paciente?.fecha_nacimiento)}
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
                {getGeneroTexto(paciente?.genero)}
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
                {paciente?.direccion || 'No especificada'}
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
            <Ionicons name="water-outline" size={24} color={theme.colors.danger || '#F44336'} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Tipo de sangre
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {paciente?.tipo_sangre || 'No especificado'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="alert-circle-outline" size={24} color={theme.colors.warning || '#FFC107'} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Alergias
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {paciente?.alergias || 'Ninguna registrada'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Contacto de emergencia */}
      {(paciente?.contacto_emergencia || paciente?.telefono_emergencia) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contacto de Emergencia
          </Text>

          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={24} color={theme.colors.danger || '#F44336'} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                  Nombre
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {paciente?.contacto_emergencia || 'No especificado'}
                </Text>
              </View>
            </View>

            {paciente?.telefono_emergencia && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={24} color={theme.colors.danger || '#F44336'} />
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
          onPress={() => {
            if (paciente) {
              navigation.navigate('EditarPerfil', { paciente });
            } else {
              Alert.alert('Error', 'No se puede editar el perfil en este momento');
            }
          }}
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
          <Ionicons name="log-out-outline" size={24} color={theme.colors.danger || '#F44336'} />
          <Text style={[styles.optionText, { color: theme.colors.danger || '#F44336' }]}>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 15,
    borderRadius: 10,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
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