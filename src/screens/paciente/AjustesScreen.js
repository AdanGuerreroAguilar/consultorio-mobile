import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const AjustesScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

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
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contactar Soporte',
      '¿Cómo deseas contactarnos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:soporte@clinica.com'),
        },
        {
          text: 'Teléfono',
          onPress: () => Linking.openURL('tel:+524421234567'),
        },
      ]
    );
  };

  const SettingItem = ({ icon, iconColor, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={[styles.settingIcon, { backgroundColor: (iconColor || theme.colors.primary) + '20' }]}>
        <Ionicons name={icon} size={22} color={iconColor || theme.colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent || (
        onPress && <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Información del usuario */}
      <View style={styles.userSection}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
          <Ionicons name="person" size={40} color={theme.colors.primary} />
        </View>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user?.nombre} {user?.apellido}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
          {user?.email}
        </Text>
      </View>

      {/* Apariencia */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          APARIENCIA
        </Text>
        
        <SettingItem
          icon="moon-outline"
          title="Modo Oscuro"
          subtitle={isDarkMode ? 'Activado' : 'Desactivado'}
          rightComponent={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </View>

      {/* Notificaciones */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          NOTIFICACIONES
        </Text>
        
        <SettingItem
          icon="notifications-outline"
          title="Notificaciones Push"
          subtitle="Recibe recordatorios de citas"
          rightComponent={
            <Switch
              value={true}
              onValueChange={() => {
                Alert.alert('Info', 'Las notificaciones están habilitadas por defecto');
              }}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />
        
        <SettingItem
          icon="mail-outline"
          title="Notificaciones por Email"
          subtitle="Confirmaciones y recordatorios"
          rightComponent={
            <Switch
              value={true}
              onValueChange={() => {
                Alert.alert('Info', 'Puedes configurar esto en tu perfil');
              }}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </View>

      {/* Cuenta */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          CUENTA
        </Text>
        
        <SettingItem
          icon="person-outline"
          title="Editar Perfil"
          subtitle="Actualiza tu información personal"
          onPress={() => navigation.navigate('EditarPerfil', { 
            paciente: {
              id: user?.paciente_id || user?.id,
              nombre: user?.nombre,
              apellido: user?.apellido,
              email: user?.email,
              telefono: user?.telefono,
            }
          })}
        />
        
        <SettingItem
          icon="lock-closed-outline"
          title="Cambiar Contraseña"
          subtitle="Actualiza tu contraseña"
          onPress={() => {
            Alert.alert(
              'Cambiar Contraseña',
              'Esta función estará disponible próximamente',
              [{ text: 'OK' }]
            );
          }}
        />
        
        <SettingItem
          icon="shield-checkmark-outline"
          title="Privacidad"
          subtitle="Configuración de privacidad"
          onPress={() => {
            Alert.alert(
              'Privacidad',
              'Tu información está protegida y solo es accesible por personal autorizado de la clínica.',
              [{ text: 'OK' }]
            );
          }}
        />
      </View>

      {/* Soporte */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          SOPORTE
        </Text>
        
        <SettingItem
          icon="help-circle-outline"
          title="Centro de Ayuda"
          subtitle="Preguntas frecuentes"
          onPress={() => {
            Alert.alert(
              'Centro de Ayuda',
              '¿Tienes alguna pregunta?\n\nPuedes contactarnos por:\n• Email: soporte@clinica.com\n• Teléfono: 442-123-4567',
              [{ text: 'OK' }]
            );
          }}
        />
        
        <SettingItem
          icon="chatbubble-outline"
          title="Contactar Soporte"
          subtitle="Estamos para ayudarte"
          onPress={handleContactSupport}
        />
        
        <SettingItem
          icon="star-outline"
          iconColor="#FFD700"
          title="Calificar App"
          subtitle="Tu opinión es importante"
          onPress={() => {
            Alert.alert(
              'Gracias',
              '¡Gracias por usar nuestra aplicación! Tu feedback nos ayuda a mejorar.',
              [{ text: 'OK' }]
            );
          }}
        />
      </View>

      {/* Acerca de */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          ACERCA DE
        </Text>
        
        <SettingItem
          icon="information-circle-outline"
          title="Versión de la App"
          subtitle="1.0.0"
        />
        
        <SettingItem
          icon="document-text-outline"
          title="Términos y Condiciones"
          onPress={() => {
            Alert.alert(
              'Términos y Condiciones',
              'Al usar esta aplicación, aceptas nuestros términos de servicio y política de privacidad.',
              [{ text: 'OK' }]
            );
          }}
        />
      </View>

      {/* Cerrar Sesión */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.danger + '15' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.colors.danger} />
          <Text style={[styles.logoutText, { color: theme.colors.danger }]}>
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
  userSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AjustesScreen;