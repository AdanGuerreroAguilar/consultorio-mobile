// screens/doctor/CrearNotaScreen.js

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function CrearNotaScreen({ navigation }) {
  const [nota, setNota] = useState("");

  const guardarNota = () => {
    alert("Nota guardada (demo)");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nota Médica</Text>

      <TextInput
        style={styles.input}
        placeholder="Escribe la nota del paciente"
        value={nota}
        onChangeText={setNota}
        multiline
      />

      <TouchableOpacity style={styles.btn} onPress={guardarNota}>
        <Text style={styles.btnText}>Guardar Nota</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 10,
    height: 150,
    textAlignVertical: "top",
  },
  btn: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});
