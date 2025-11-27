// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client, { setAuthToken } from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // Cargar sesión al iniciar
  // ============================================
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");

        if (!storedToken) {
          console.log("❌ No hay sesión guardada");
          setLoading(false);
          return;
        }

        setAuthToken(storedToken);
        setToken(storedToken);

        try {
          const response = await client.get("/api/auth/me");
          // /api/auth/me devuelve el usuario DIRECTAMENTE
          const userData = response.data;
          console.log("✅ Sesión restaurada:", userData.email);
          setUser(userData);
          await AsyncStorage.setItem("user", JSON.stringify(userData));
        } catch (apiError) {
          console.log("⚠️ Token inválido, limpiando...");
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.log("❌ Error cargando sesión:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // ============================================
  // LOGIN
  // ============================================
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await client.post("/api/auth/login", { email, password });

      const accessToken = response.data.access_token;
      const userData = response.data.usuario;

      console.log("✅ Login exitoso:", userData.email);

      await AsyncStorage.setItem("token", accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      setAuthToken(accessToken);
      setToken(accessToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.log("❌ Error login:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.detail || "Credenciales incorrectas",
      };
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOGOUT - LIMPIA TODO
  // ============================================
  const logout = async () => {
    console.log("🔓 Cerrando sesión...");
    
    // 1. Limpiar AsyncStorage
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    
    // 2. Limpiar token de axios
    setAuthToken(null);
    
    // 3. Limpiar estado - IMPORTANTE: en este orden
    setToken(null);
    setUser(null);
    
    console.log("✅ Sesión cerrada completamente");
  };

  // ============================================
  // UPDATE USER (para editar perfil)
  // ============================================
  const updateUser = async (datos) => {
    try {
      console.log("📝 Actualizando perfil:", datos);
      
      // Llamar al endpoint de perfil
      await client.put("/api/perfil", datos);
      
      // Actualizar estado local
      const updatedUser = { ...user, ...datos };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      
      console.log("✅ Perfil actualizado");
      return { success: true };
    } catch (error) {
      console.log("❌ Error actualizando perfil:", error.response?.data || error.message);
      throw error;
    }
  };

  // ============================================
  // REFRESH USER
  // ============================================
  const refreshUser = async () => {
    try {
      const response = await client.get("/api/auth/me");
      const userData = response.data;
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.log("❌ Error refrescando usuario:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
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

export const useAuth = () => useContext(AuthContext);