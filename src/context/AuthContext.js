import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authAPI from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const usuarioString = await AsyncStorage.getItem('usuario');

      if (token && usuarioString) {
        const usuario = JSON.parse(usuarioString);
        setUser(usuario);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);

      if (response.access_token && response.usuario) {
        await AsyncStorage.setItem('token', response.access_token);
        await AsyncStorage.setItem('usuario', JSON.stringify(response.usuario));

        setUser(response.usuario);
        setIsAuthenticated(true);

        return { success: true, usuario: response.usuario };
      }

      return { success: false, error: 'Respuesta del servidor incompleta' };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al iniciar sesión',
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
      setUser(null);
      setIsAuthenticated(false);
      // La navegación se manejará automáticamente por el cambio de isAuthenticated
      // en el navegador principal (AppNavigator)
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      // Combinar datos existentes con los nuevos
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem('usuario', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  // Función para refrescar datos del usuario desde el servidor
  const refreshUser = async () => {
    try {
      const usuarioString = await AsyncStorage.getItem('usuario');
      if (usuarioString) {
        const usuario = JSON.parse(usuarioString);
        setUser(usuario);
      }
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
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