// src/store/authStore.js
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../api/auth";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true });

      const data = await authAPI.login(email, password);
      await AsyncStorage.setItem("token", data.token);

      set({
        user: data.user,
        token: data.token,
        loading: false,
        error: null,
      });

      return true;
    } catch (err) {
      set({
        loading: false,
        error: "Credenciales incorrectas",
      });
      return false;
    }
  },

  registerPaciente: async (datos) => {
    try {
      set({ loading: true });

      const data = await authAPI.registerPaciente(datos);
      await AsyncStorage.setItem("token", data.token);

      set({
        user: data.user,
        token: data.token,
        loading: false,
        error: null,
      });

      return true;
    } catch (err) {
      set({
        loading: false,
        error: "No se pudo registrar el paciente",
      });
      return false;
    }
  },

  loadUser: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return false;

      const data = await authAPI.me();
      set({ user: data, token });

      return true;
    } catch (err) {
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
