// screens/admin/CrearCitaScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const CrearCitaScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Datos
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);

  // Campos del formulario
  const [pacienteId, setPacienteId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [motivo, setMotivo] = useState('');
  const [duracion, setDuracion] = useState('30');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [pacientesRes, usuariosRes] = await Promise.all([
        apiClient.get('/pacientes'),
        apiClient.get('/usuarios'),
      ]);

      setPacientes(pacientesRes.data);
      
      // Filtrar solo doctores
      const docs = usuariosRes.data.filter(u => u.rol === 'doctor');
      setDoctores(docs);

      // Si el usuario actual es doctor, preseleccionarlo
      if (user?.rol === 'doctor') {
        setDoctorId(user.id.toString());
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoadingData(false);
    }
  };

  const formatDateForAPI = () => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(hora.getHours()).padStart(2, '0');
    const minutes = String(hora.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:00`;
  };

  const handleCrear = async () => {
    if (!pacienteId) {
      Alert.alert('Error', 'Selecciona un paciente');
      return;
    }

    if (!doctorId) {
      Alert.alert('Error', 'Selecciona un doctor');
      return;
    }

    if (!motivo.trim()) {
      Alert.alert('Error', 'Ingresa el motivo de la cita');
      return;
    }

    setLoading(true);

    try {
      const datos = {
        paciente_id: parseInt(pacienteId),
        doctor_id: parseInt(doctorId),
        fecha_hora: formatDateForAPI(),
        motivo: motivo.trim(),
        duracion_minutos: parseInt(duracion),
      };

      await apiClient.post('/citas', datos);
      
      Alert.alert('Éxito', 'Cita creada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error al crear cita:', error);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setHora(selectedTime);
    }
  };

  if (loadingData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Cargando datos...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Paciente */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Paciente *</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
            <Picker
              selectedValue={pacienteId}
              onValueChange={setPacienteId}
              style={{ color: theme.colors.text }}
            >
              <Picker.Item label="Seleccionar paciente..." value="" />
              {pacientes.map((p) => (
                <Picker.Item 
                  key={p.id} 
                  label={`${p.nombre} ${p.apellido}`} 
                  value={p.id.toString()} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Doctor */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Doctor *</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
            <Picker
              selectedValue={doctorId}
              onValueChange={setDoctorId}
              style={{ color: theme.colors.text }}
              enabled={user?.rol !== 'doctor'}
            >
              <Picker.Item label="Seleccionar doctor..." value="" />
              {doctores.map((d) => (
                <Picker.Item 
                  key={d.id} 
                  label={`Dr. ${d.nombre} ${d.apellido} - ${d.especialidad || 'General'}`} 
                  value={d.id.toString()} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Fecha */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Fecha *</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.colors.card }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {fecha.toLocaleDateString('es-MX', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={fecha}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Hora */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Hora *</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.colors.card }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {hora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={hora}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Duración */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Duración</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
            <Picker
              selectedValue={duracion}
              onValueChange={setDuracion}
              style={{ color: theme.colors.text }}
            >
              <Picker.Item label="15 minutos" value="15" />
              <Picker.Item label="30 minutos" value="30" />
              <Picker.Item label="45 minutos" value="45" />
              <Picker.Item label="1 hora" value="60" />
              <Picker.Item label="1 hora 30 minutos" value="90" />
            </Picker>
          </View>
        </View>

        {/* Motivo */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Motivo de la cita *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={motivo}
            onChangeText={setMotivo}
            placeholder="Describe el motivo de la consulta..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Botón crear */}
        <TouchableOpacity
          style={[
            styles.crearButton,
            { backgroundColor: theme.colors.primary },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleCrear}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
              <Text style={styles.crearButtonText}>Agendar Cita</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    marginTop: 15,
    fontSize: 16,
  },
  content: {
    padding: 20,
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
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
  },
  crearButton: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 40,
    gap: 10,
  },
  crearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CrearCitaScreen;