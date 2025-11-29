import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";

export default function SubirImagenScreen({ route, navigation }) {
  const { pacienteId } = route.params;
  const { user } = useAuth();
  const { theme } = useTheme();

  const [imagen, setImagen] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const seleccionarImagen = async () => {
    try {
      // SOLICITAR PERMISO
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        return Alert.alert("Permiso requerido", "Activa los permisos de galería.");
      }

      // ABRIR GALERÍA 
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', 
        quality: 0.8,
        allowsEditing: true,
      });

      console.log("RESULTADO PICKER:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagen(result.assets[0]);
      }
    } catch (error) {
      console.log("Error seleccionando imagen:", error);
      Alert.alert("Error", "No se pudo abrir la galería: " + error.message);
    }
  };

  const subirImagen = async () => {
    if (!imagen) {
      Alert.alert("Error", "Selecciona una imagen primero.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      
      formData.append("archivo", {
        uri: imagen.uri,
        name: imagen.fileName || "imagen.jpg",
        type: imagen.mimeType || "image/jpeg",
      });
      
      formData.append("paciente_id", pacienteId.toString());
      formData.append("doctor_id", user.id.toString());
      formData.append("descripcion", descripcion || "");
      formData.append("cita_id", "");

      console.log(" Enviando FormData:", {
        paciente_id: pacienteId,
        doctor_id: user.id,
        descripcion: descripcion,
        archivo: imagen.fileName
      });

      const res = await apiClient.post("/api/imagenes", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(" Respuesta:", res.data);

      Alert.alert("Éxito", "Imagen subida correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);

    } catch (error) {
      console.log(" Error completo:", error);
      console.log(" Response data:", error.response?.data);
      console.log(" Status:", error.response?.status);
      
      const mensaje = error.response?.data?.detail || "No se pudo subir la imagen";
      Alert.alert("Error", mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Agregar Imagen Médica
      </Text>

      <TouchableOpacity
        style={[styles.selectButton, { backgroundColor: theme.colors.card }]}
        onPress={seleccionarImagen}
      >
        <Ionicons name="image-outline" size={24} color={theme.colors.text} />
        <Text style={[styles.selectText, { color: theme.colors.text }]}>
          Seleccionar Imagen
        </Text>
      </TouchableOpacity>

      {imagen && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imagen.uri }} style={styles.preview} />
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => setImagen(null)}
          >
            <Ionicons name="close-circle" size={32} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        placeholder="Descripción (opcional)"
        placeholderTextColor={theme.colors.textSecondary}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={3}
        style={[
          styles.input,
          { 
            backgroundColor: theme.colors.card, 
            color: theme.colors.text,
            textAlignVertical: 'top'
          },
        ]}
      />

      <TouchableOpacity
        style={[
          styles.uploadButton, 
          { 
            backgroundColor: imagen ? theme.colors.primary : theme.colors.textSecondary,
            opacity: imagen ? 1 : 0.5
          }
        ]}
        onPress={subirImagen}
        disabled={loading || !imagen}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={24} color="#FFF" />
            <Text style={styles.uploadText}>Subir Imagen</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 20, 
    textAlign: "center" 
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  selectText: { 
    fontSize: 16, 
    fontWeight: "600" 
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  preview: { 
    width: "100%", 
    height: 260, 
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
  },
  input: { 
    padding: 15, 
    borderRadius: 12, 
    fontSize: 16, 
    marginBottom: 20,
    minHeight: 80,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  uploadText: { 
    color: "#FFF", 
    fontSize: 16, 
    fontWeight: "700" 
  },
});