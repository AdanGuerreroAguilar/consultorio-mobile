import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AjustesScreen = () => {
  const { user } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [notificacionesActivas, setNotificacionesActivas] = useState(true);

  const handleToggleModoOscuro = () => {
    toggleTheme();
  };

  const handleToggleNotificaciones = () => {
    setNotificacionesActivas(!notificacionesActivas);
    Alert.alert(
      'Notificaciones',
      notificacionesActivas 
        ? 'Las notificaciones han sido desactivadas'
        : 'Las notificaciones han sido activadas'
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Apariencia */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Apariencia
        </Text>
        
        <View style={[styles.settingCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons 
                name={isDarkMode ? 'moon' : 'sunny'} 
                size={24} 
                color={theme.colors.primary} 
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Modo Oscuro
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  {isDarkMode ? 'Tema oscuro activado' : 'Tema claro activado'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleToggleModoOscuro}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Notificaciones */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Notificaciones
        </Text>
        
        <View style={[styles.settingCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons 
                name="notifications-outline" 
                size={24} 
                color={theme.colors.primary} 
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Notificaciones
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Recordatorios de citas
                </Text>
              </View>
            </View>
            <Switch
              value={notificacionesActivas}
              onValueChange={handleToggleNotificaciones}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Información de la cuenta */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Cuenta
        </Text>
        
        <View style={[styles.settingCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Email
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {user?.email}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Tipo de usuario
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              Paciente
            </Text>
          </View>
        </View>
      </View>

      {/* Ayuda y soporte */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Ayuda y Soporte
        </Text>
        
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => Alert.alert('Ayuda', 'Próximamente disponible')}
        >
          <Ionicons name="help-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.optionText, { color: theme.colors.text }]}>
            Centro de Ayuda
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => Alert.alert('Privacidad', 'Próximamente disponible')}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.optionText, { color: theme.colors.text }]}>
            Política de Privacidad
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => Alert.alert('Términos', 'Próximamente disponible')}
        >
          <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.optionText, { color: theme.colors.text }]}>
            Términos y Condiciones
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Información de la app */}
      <View style={styles.section}>
        <View style={[styles.versionCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            Consultorio App v1.0.0
          </Text>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            © 2025 Todos los derechos reservados
          </Text>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingCard: {
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
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
  versionCard: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    marginVertical: 2,
  },
});

export default AjustesScreen;