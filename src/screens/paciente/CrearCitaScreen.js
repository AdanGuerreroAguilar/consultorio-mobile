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
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { citasAPI } from '../../api/citas';
import { usuariosAPI } from '../../api/usuarios';

const CrearCitaScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctores, setLoadingDoctores] = useState(true);
  
  const [formData, setFormData] = useState({
    doctor_id: '',
    fecha: new Date(),
    hora: new Date(),
    motivo: '',
    duracion_minutos: 30,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    cargarDoctores();
  }, []);

  const cargarDoctores = async () => {
    try {
      const usuarios = await usuariosAPI.getUsuarios();
      const doctoresList = usuarios.filter(u => u.rol === 'doctor');
      setDoctores(doctoresList);
    } catch (error) {
      console.error('Error al cargar doctores:', error);
      Alert.alert('Error', 'No se pudieron cargar los doctores');
    } finally {
      setLoadingDoctores(false);
    }
  };

  const handleCrearCita = async () => {
    // Validaciones
    if (!formData.doctor_id) {
      Alert.alert('Error', 'Por favor selecciona un doctor');
      return;
    }
    
    if (!formData.motivo.trim()) {
      Alert.alert('Error', 'Por favor describe el motivo de la consulta');
      return;
    }

    // Combinar fecha y hora
    const fechaHora = new Date(formData.fecha);
    fechaHora.setHours(formData.hora.getHours());
    fechaHora.setMinutes(formData.hora.getMinutes());
    
    // Validar que la fecha sea futura
    if (fechaHora <= new Date()) {
      Alert.alert('Error', 'La fecha y hora deben ser futuras');
      return;
    }

    setLoading(true);
    
    try {
      const citaData = {
        paciente_id: user.paciente_id,
        doctor_id: parseInt(formData.doctor_id),
        fecha_hora: fechaHora.toISOString().slice(0, 19).replace('T', ' '),
        motivo: formData.motivo.trim(),
        duracion_minutos: formData.duracion_minutos,
      };
      
      await citasAPI.crearCita(citaData);
      
      Alert.alert(
        'Éxito',
        'Tu cita ha sido agendada correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error al crear cita:', error);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, fecha: selectedDate });
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setFormData({ ...formData, hora: selectedTime });
    }
  };

  if (loadingDoctores) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Seleccionar doctor */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Seleccionar Doctor *
        </Text>
        <View style={[styles.pickerContainer, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border 
        }]}>
          <Picker
            selectedValue={formData.doctor_id}
            onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
            style={{ color: theme.colors.text }}
          >
            <Picker.Item label="Selecciona un doctor" value="" />
            {doctores.map((doctor) => (
              <Picker.Item
                key={doctor.id}
                label={`Dr. ${doctor.nombre} ${doctor.apellido} - ${doctor.especialidad || 'General'}`}
                value={doctor.id.toString()}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Fecha */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Fecha *
        </Text>
        <TouchableOpacity
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border 
          }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: theme.colors.text }}>
            {formData.fecha.toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={formData.fecha}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      {/* Hora */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Hora *
        </Text>
        <TouchableOpacity
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border 
          }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={{ color: theme.colors.text }}>
            {formData.hora.toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </TouchableOpacity>
        
        {showTimePicker && (
          <DateTimePicker
            value={formData.hora}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}
      </View>

      {/* Duración */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Duración (minutos)
        </Text>
        <View style={[styles.pickerContainer, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border 
        }]}>
          <Picker
            selectedValue={formData.duracion_minutos}
            onValueChange={(value) => setFormData({ ...formData, duracion_minutos: value })}
            style={{ color: theme.colors.text }}
          >
            <Picker.Item label="15 minutos" value={15} />
            <Picker.Item label="30 minutos" value={30} />
            <Picker.Item label="45 minutos" value={45} />
            <Picker.Item label="60 minutos" value={60} />
          </Picker>
        </View>
      </View>

      {/* Motivo */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Motivo de la consulta *
        </Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          placeholder="Describe brevemente el motivo de tu consulta"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.motivo}
          onChangeText={(value) => setFormData({ ...formData, motivo: value })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Botón crear */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleCrearCita}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Agendar Cita</Text>
        )}
      </TouchableOpacity>
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
  contentContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
await programarNotificacion(
  "Cita creada",
  "Tu cita se registró correctamente.",
  new Date(Date.now() + 5000) // 5 segundos
);

export default CrearCitaScreen;