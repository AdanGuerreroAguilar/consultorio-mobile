import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      console.log('📥 Cargando usuario desde storage...');
      console.log('Token:', token ? 'Existe' : 'No existe');
      console.log('User data:', userData);
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('✅ Usuario cargado:', parsedUser);
      } else {
        console.log('❌ No hay sesión guardada');
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Intentando login...');
      const response = await authAPI.login(email, password);
      
      console.log('📨 Respuesta del servidor:', response);
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('token', response.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.usuario));
      
      console.log('💾 Guardado en storage');
      console.log('Usuario:', response.usuario);
      
      // Actualizar estado
      setUser(response.usuario);
      setIsAuthenticated(true);
      
      console.log('✅ Login exitoso, estado actualizado');
      
      return { success: true, user: response.usuario };
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Error al iniciar sesión' 
      };
    }
  };

  const registro = async (datos) => {
    try {
      const response = await authAPI.registro(datos);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Error al registrarse' 
      };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const updateUser = async (newUserData) => {
    try {
      const updatedUser = { ...user, ...newUserData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      await AsyncStorage.setItem('user', JSON.stringify(response));
      setUser(response);
      return { success: true };
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      return { success: false, error: error.message };
    }
  };

  // Debug: Mostrar estado actual
  useEffect(() => {
    console.log('🔄 Estado AuthContext:', {
      isAuthenticated,
      hasUser: !!user,
      userName: user?.nombre,
      userRole: user?.rol
    });
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        registro,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};