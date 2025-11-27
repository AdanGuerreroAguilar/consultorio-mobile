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
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { theme } = useTheme();
  const { login } = useAuth();

  // ========================================
  // 🔐 MANEJAR LOGIN
  // ========================================
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
      
      // Llamar al login del AuthContext
      const result = await login(email, password);
      
      if (result.success) {
        console.log('✅ Login exitoso - AuthContext manejará la navegación');
        // NO hacer navigation.replace() aquí
        // El AppNavigator detectará automáticamente el cambio en isAuthenticated
        // y mostrará el navigator correcto según el rol
      } else {
        Alert.alert('Error de autenticación', result.message);
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // ⚡ LOGIN RÁPIDO (PARA TESTING)
  // ========================================
  const quickLogin = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="medical" size={48} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Consultorio Médico
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Iniciar Sesión
          </Text>
        </View>

        {/* Formulario */}
        <View style={[styles.form, { backgroundColor: theme.colors.card }]}>
          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Correo electrónico
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={theme.colors.textSecondary} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
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
              Contraseña
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Tu contraseña"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={loading}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón Login */}
          <TouchableOpacity
            style={[
              styles.button, 
              { backgroundColor: theme.colors.primary },
              loading && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Link a registro */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              ¿No tienes cuenta?{' '}
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Registro')}
              disabled={loading}
            >
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                Regístrate aquí
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botones de prueba rápida (solo desarrollo) */}
        {__DEV__ && (
          <View style={[styles.testSection, { borderColor: theme.colors.warning }]}>
            <Text style={[styles.testTitle, { color: theme.colors.warning }]}>
              ⚡ Prueba Rápida (Dev)
            </Text>
            
            <View style={styles.testButtons}>
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: '#9C27B0' }]}
                onPress={() => quickLogin('admin@consultorio.com', 'Admin2025!')}
                disabled={loading}
              >
                <Ionicons name="shield" size={16} color="#fff" />
                <Text style={styles.testButtonText}>Admin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => quickLogin('maria.lopez@consultorio.com', 'Pediatria2025')}
                disabled={loading}
              >
                <Ionicons name="medical" size={16} color="#fff" />
                <Text style={styles.testButtonText}>Doctor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: '#2196F3' }]}
                onPress={() => quickLogin('paciente@test.com', 'paciente123')}
                disabled={loading}
              >
                <Ionicons name="person" size={16} color="#fff" />
                <Text style={styles.testButtonText}>Paciente</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.testHint, { color: theme.colors.textSecondary }]}>
              Presiona un botón para llenar los campos, luego "Iniciar Sesión"
            </Text>
          </View>
        )}
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
    fontSize: 18,
  },
  form: {
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos para sección de pruebas
  testSection: {
    marginTop: 30,
    padding: 15,
    borderWidth: 2,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  testTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  testHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default LoginScreen;