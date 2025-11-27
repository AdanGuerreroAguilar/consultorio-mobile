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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../api/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validaciones básicas
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Intentando login con:', email);
      
      // Llamar al API de login
      const response = await authAPI.login(email, password);
      
      console.log('✅ Login exitoso:', response);

      // Guardar token y usuario en AsyncStorage
      await AsyncStorage.setItem('token', response.access_token);
      await AsyncStorage.setItem('usuario', JSON.stringify(response.usuario));

      console.log('👤 Usuario autenticado:', {
        nombre: response.usuario.nombre,
        rol: response.usuario.rol,
        paciente_id: response.usuario.paciente_id
      });

      // Navegar según el rol del usuario usando los nombres CORRECTOS
      switch (response.usuario.rol) {
        case 'admin':
          navigation.replace('AdminApp'); // ✅ CORREGIDO
          break;
        case 'doctor':
          navigation.replace('DoctorApp'); // ✅ CORREGIDO
          break;
        case 'paciente':
          navigation.replace('PacienteApp'); // ✅ CORREGIDO
          break;
        default:
          Alert.alert('Error', 'Rol de usuario no reconocido');
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      
      if (error.response) {
        // Error de respuesta del servidor
        const mensaje = error.response.data?.detail || 'Credenciales incorrectas';
        Alert.alert('Error de autenticación', mensaje);
      } else if (error.request) {
        // No se recibió respuesta del servidor
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
        );
      } else {
        // Error en la configuración de la petición
        Alert.alert('Error', 'Ocurrió un error inesperado. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para login rápido (testing)
  const quickLogin = async (email, password) => {
    setEmail(email);
    setPassword(password);
    
    // Simular delay para que se vea el cambio
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Consultorio Médico</Text>
          <Text style={styles.subtitle}>Iniciar Sesión</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Registro')}
              disabled={loading}
            >
              <Text style={styles.linkText}>
                ¿No tienes cuenta? Regístrate aquí
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botones de prueba rápida */}
          <View style={styles.testButtonsContainer}>
            <Text style={styles.testTitle}>Prueba rápida:</Text>
            
            <TouchableOpacity
              style={[styles.testButton, styles.adminButton]}
              onPress={() => quickLogin('admin@consultorio.com', 'Admin2025!')}
              disabled={loading}
            >
              <Text style={styles.testButtonText}>👨‍💼 Admin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.doctorButton]}
              onPress={() => quickLogin('maria.lopez@consultorio.com', 'Pediatria2025')}
              disabled={loading}
            >
              <Text style={styles.testButtonText}>👨‍⚕️ Doctor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.pacienteButton]}
              onPress={() => quickLogin('paciente@test.com', 'paciente123')}
              disabled={loading}
            >
              <Text style={styles.testButtonText}>👤 Paciente</Text>
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
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#2196F3',
    fontSize: 16,
  },
  testButtonsContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 15,
    textAlign: 'center',
  },
  testButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  adminButton: {
    backgroundColor: '#9C27B0',
  },
  doctorButton: {
    backgroundColor: '#4CAF50',
  },
  pacienteButton: {
    backgroundColor: '#2196F3',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;