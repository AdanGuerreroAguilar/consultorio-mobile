import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import authAPI from '../../api/auth';

const RegistroScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmarPassword: '',
    nombre: '',
    apellido: '',
    telefono: '',
    fechaNacimiento: '',
    genero: 'Otro',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { theme } = useTheme();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  // VALIDAR FORMULARIO

  const validarFormulario = () => {

    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      Alert.alert('Error', 'Nombre y apellido son obligatorios');
      return false;
    }

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!soloLetras.test(formData.nombre)) {
      Alert.alert('Error', 'El nombre solo debe contener letras');
      return false;
    }
    if (!soloLetras.test(formData.apellido)) {
      Alert.alert('Error', 'El apellido solo debe contener letras');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }

    // Validar contraseña
    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmarPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    // Validar teléfono 
    if (formData.telefono && formData.telefono.length < 10) {
      Alert.alert('Error', 'El teléfono debe tener al menos 10 dígitos');
      return false;
    }

    // Validar fecha de nacimiento 
    if (formData.fechaNacimiento) {
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(formData.fechaNacimiento)) {
        Alert.alert('Error', 'La fecha debe tener el formato AAAA-MM-DD (ejemplo: 1990-05-15)');
        return false;
      }

      const fecha = new Date(formData.fechaNacimiento);
      const hoy = new Date();
      if (fecha > hoy) {
        Alert.alert('Error', 'La fecha de nacimiento no puede ser futura');
        return false;
      }

      const edad = hoy.getFullYear() - fecha.getFullYear();
      if (edad < 0 || edad > 120) {
        Alert.alert('Error', 'Por favor ingresa una fecha de nacimiento válida');
        return false;
      }
    }

    return true;
  };


  //  REGISTRO

  const handleRegistro = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const datosRegistro = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        telefono: formData.telefono.trim() || null,
        fecha_nacimiento: formData.fechaNacimiento || null,
        genero: formData.genero,
      };

      console.log(' Enviando registro:', datosRegistro);

      const response = await authAPI.registroPaciente(datosRegistro);

      console.log(' Registro exitoso:', response);

      Alert.alert(
        '¡Registro Exitoso!',
        'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
        [
          {
            text: 'Iniciar Sesión',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      console.error(' Error en registro:', error);
      
      let mensaje = 'No se pudo completar el registro';
      
      if (error.response) {
        // Error del servidor
        if (error.response.status === 400) {
          mensaje = error.response.data.detail || 'El correo ya está registrado';
        } else if (error.response.status === 422) {
          mensaje = 'Datos inválidos. Verifica el formato de los campos';
        } else {
          mensaje = error.response.data.detail || 'Error en el servidor';
        }
      } else if (error.request) {
        // Error de red
        mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      }

      Alert.alert('Error de Registro', mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="person-add" size={48} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Crear Cuenta
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Regístrate como paciente
          </Text>
        </View>

        {/* Formulario */}
        <View style={[styles.form, { backgroundColor: theme.colors.card }]}>
          {/* Nombre */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Nombre *
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Tu nombre"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.nombre}
                onChangeText={(text) => handleChange('nombre', text)}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </View>

          {/* Apellido */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Apellido *
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Tu apellido"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.apellido}
                onChangeText={(text) => handleChange('apellido', text)}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Correo electrónico *
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Contraseña *
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={loading}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Confirmar contraseña *
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Repite tu contraseña"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.confirmarPassword}
                onChangeText={(text) => handleChange('confirmarPassword', text)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon} disabled={loading}>
                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Teléfono */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Teléfono (opcional)
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="442-123-4567"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.telefono}
                onChangeText={(text) => handleChange('telefono', text)}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
          </View>

          {/* Fecha de Nacimiento */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Fecha de nacimiento (opcional)
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="AAAA-MM-DD (ej: 1990-05-15)"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.fechaNacimiento}
                onChangeText={(text) => handleChange('fechaNacimiento', text)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Botón de registro */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }, loading && styles.buttonDisabled]}
            onPress={handleRegistro}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Crear Cuenta</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Link a login */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                Inicia sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegistroScreen;