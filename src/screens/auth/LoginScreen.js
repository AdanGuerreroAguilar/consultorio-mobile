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
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    const result = await login(email.toLowerCase().trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error);
    }
    // Si es exitoso, el AuthContext redirige automáticamente
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Consultorio Médico
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Inicia sesión para continuar
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Correo electrónico
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Contraseña
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Tu contraseña"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              ¿No tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                Regístrate aquí
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botones de prueba rápida para desarrollo */}
        <View style={styles.devButtons}>
          <Text style={[styles.devTitle, { color: theme.colors.textSecondary }]}>
            Pruebas rápidas:
          </Text>
          
          <TouchableOpacity
            style={[styles.devButton, { backgroundColor: theme.colors.danger + '20' }]}
            onPress={() => {
              setEmail('admin@consultorio.com');
              setPassword('Admin2025!');
            }}
          >
            <Text style={[styles.devButtonText, { color: theme.colors.danger }]}>
              👤 Admin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.devButton, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={() => {
              setEmail('maria.lopez@consultorio.com');
              setPassword('Pediatria2025');
            }}
          >
            <Text style={[styles.devButtonText, { color: theme.colors.primary }]}>
              👨‍⚕️ Doctor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.devButton, { backgroundColor: theme.colors.success + '20' }]}
            onPress={() => {
              setEmail('paciente@test.com');
              setPassword('paciente123');
            }}
          >
            <Text style={[styles.devButtonText, { color: theme.colors.success }]}>
              🙋 Paciente
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  devButtons: {
    marginTop: 30,
    alignItems: 'center',
    gap: 10,
  },
  devTitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  devButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
