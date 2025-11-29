import axios from "axios";
import { Platform } from "react-native";

const LOCAL_LAN_IP = "172.20.10.4"; // IP actual por hotspot

const getBaseURL = () => {
  if (Platform.OS === "web") {
    return "http://localhost:8000";
  }
  if (__DEV__) {
    return `http://${LOCAL_LAN_IP}:8000`;
  }
  return "https://TU_DOMINIO.com";
};


const client = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptor para logs
client.interceptors.request.use(
  (config) => {
    console.log(` ${config.method?.toUpperCase()} → ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => {
    console.log(` ${response.status} ← ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.log(` ERROR ${error.response.status}:`, error.response.data);
    } else {
      console.log(" ERROR DE RED:", error.message);
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log(" Token configurado");
  } else {
    delete client.defaults.headers.common["Authorization"];
    console.log(" Token eliminado");
  }
};

export default client;