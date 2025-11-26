import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/auth/LoginScreen';
import AdminNavigator from './AdminNavigator';
import DoctorNavigator from './DoctorNavigator';
import PacienteNavigator from './PacienteNavigator';

export default function AppNavigator() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      const data = await AsyncStorage.getItem('usuario');
      if (data) setUsuario(JSON.parse(data));
      setCargando(false);
    };
    cargarUsuario();
  }, []);

  if (cargando) return null;

  return (
    <NavigationContainer>
      {!usuario && <LoginScreen />}

      {usuario?.rol === 'admin' && <AdminNavigator />}
      {usuario?.rol === 'doctor' && <DoctorNavigator />}
      {usuario?.rol === 'paciente' && <PacienteNavigator />}
    </NavigationContainer>
  );
}
