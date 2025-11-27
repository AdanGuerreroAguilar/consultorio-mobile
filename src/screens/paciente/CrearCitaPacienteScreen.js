import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { citasAPI } from "../../api/citas";
import apiClient from "../../api/client";

export default function CrearCitaPacienteScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [motivo, setMotivo] = useState("");
  const [notas, setNotas] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctores, setDoctores] = useState([]);
  const [duracion, setDuracion] = useState(30);

  // Estados para fecha y hora
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingDoctores, setLoadingDoctores] = useState(true);

  useEffect(() => {
    cargarDoctores();
  }, []);

  const cargarDoctores = async () => {
    try {
      // Intenta cargar la lista de doctores
      const response = await apiClient.get('/doctores');
      const listaDoctores = Array.isArray(response.data) ? response.data : [];
      setDoctores(listaDoctores);
      
      // Seleccionar el primer doctor por defecto si hay
      if (listaDoctores.length > 0) {
        setDoctorId(listaDoctores[0].id);
      }
    } catch (error) {
      console.error('Error al cargar doctores:', error);
      // Si falla, usar datos de prueba
      setDoctores([
        { id: 1, nombre: 'María', apellido: 'López', especialidad: 'Pediatría' },
        { id: 2, nombre: 'Carlos', apellido: 'García', especialidad: 'Medicina General' },
      ]);
      setDoctorId(1);
    } finally {
      setLoadingDoctores(false);
    }
  };

  const onChangeFecha = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  const onChangeHora = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setHora(selectedTime);
    }
  };

  const formatearFecha = (date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatearHora = (date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const validarFormulario = () => {
    if (!motivo.trim()) {
      Alert.alert('Error', 'Por favor ingresa el motivo de la cita');
      return false;
    }

    if (!doctorId) {
      Alert.alert('Error', 'Por favor selecciona un doctor');
      return false;
    }

    // Validar que la fecha no sea en el pasado
    const fechaHoraCita = new Date(fecha);
    fechaHoraCita.setHours(hora.getHours(), hora.getMinutes(), 0, 0);

    if (fechaHoraCita < new Date()) {
      Alert.alert('Error', 'No puedes agendar una cita en el pasado');
      return false;
    }

    // Validar horario de trabajo (8:00 - 18:00)
    const horasCita = hora.getHours();
    if (horasCita < 8 || horasCita >= 18) {
      Alert.alert('Error', 'El horario de atención es de 8:00 AM a 6:00 PM');
      return false;
    }

    return true;
  };

  const crearCita = async () => {
    if (!validarFormulario()) return;

    // Verificar que tenemos paciente_id
    if (!user?.paciente_id) {
      Alert.alert(
        'Error',
        'No se pudo identificar tu perfil de paciente. Por favor, cierra sesión e inicia de nuevo.'
      );
      return;
    }

    setLoading(true);

    try {
      // Combinar fecha y hora
      const fechaHoraCita = new Date(fecha);
      fechaHoraCita.setHours(hora.getHours(), hora.getMinutes(), 0, 0);

      const citaData = {
        paciente_id: user.paciente_id,
        doctor_id: parseInt(doctorId),
        fecha_hora: fechaHoraCita.toISOString(),
        motivo: motivo.trim(),
        notas: notas.trim() || null,
        duracion_minutos: duracion,
        estado: 'programada',
      };

      console.log('📅 Creando cita:', citaData);

      await citasAPI.crearCita(citaData);

      Alert.alert(
        'Cita Agendada',
        `Tu cita ha sido agendada para el ${formatearFecha(fecha)} a las ${formatearHora(hora)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error al crear cita:', error);
      const mensaje = error.response?.data?.detail || 'No se pudo crear la cita. Intenta de nuevo.';
      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  if (loadingDoctores) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Cargando información...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Agendar Nueva Cita
      </Text>

      {/* Selector de Doctor */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Doctor *
        </Text>
        <View style={[
          styles.pickerContainer,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
        ]}>
          <Picker
            selectedValue={doctorId}
            onValueChange={(value) => setDoctorId(value)}
            style={{ color: theme.colors.text }}
          >
            <Picker.Item label="Selecciona un doctor" value="" />
            {doctores.map((doctor) => (
              <Picker.Item
                key={doctor.id}
                label={`Dr. ${doctor.nombre} ${doctor.apellido} - ${doctor.especialidad || 'General'}`}
                value={doctor.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Motivo de la cita */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Motivo de la Cita *
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }
          ]}
          placeholder="Ej. Dolor de cabeza, Revisión general..."
          placeholderTextColor={theme.colors.textSecondary}
          value={motivo}
          onChangeText={setMotivo}
        />
      </View>

      {/* Selector de Fecha */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Fecha *
        </Text>
        <TouchableOpacity
          style={[
            styles.dateButton,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
            {formatearFecha(fecha)}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeFecha}
            minimumDate={new Date()}
            locale="es-MX"
          />
        )}
      </View>

      {/* Selector de Hora */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Hora *
        </Text>
        <TouchableOpacity
          style={[
            styles.dateButton,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
          ]}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
            {formatearHora(hora)}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={hora}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeHora}
            minuteInterval={15}
          />
        )}
      </View>

      {/* Duración */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Duración Estimada
        </Text>
        <View style={[
          styles.pickerContainer,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
        ]}>
          <Picker
            selectedValue={duracion}
            onValueChange={(value) => setDuracion(value)}
            style={{ color: theme.colors.text }}
          >
            <Picker.Item label="15 minutos" value={15} />
            <Picker.Item label="30 minutos" value={30} />
            <Picker.Item label="45 minutos" value={45} />
            <Picker.Item label="1 hora" value={60} />
          </Picker>
        </View>
      </View>

      {/* Notas adicionales */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Notas Adicionales (Opcional)
        </Text>
        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }
          ]}
          placeholder="Información adicional que desees compartir..."
          placeholderTextColor={theme.colors.textSecondary}
          value={notas}
          onChangeText={setNotas}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Botón de Confirmar */}
      <TouchableOpacity
        style={[
          styles.btn,
          { backgroundColor: theme.colors.primary },
          loading && styles.btnDisabled
        ]}
        onPress={crearCita}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.btnText}>Confirmar Cita</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Botón de Cancelar */}
      <TouchableOpacity
        style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={[styles.cancelBtnText, { color: theme.colors.text }]}>
          Cancelar
        </Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
  },
  pickerContainer: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    flex: 1,
  },
  btn: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelBtn: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});