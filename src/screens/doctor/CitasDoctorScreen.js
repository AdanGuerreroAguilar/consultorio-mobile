// screens/doctor/CitasDoctorScreen.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CitasDoctorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citas del Doctor</Text>
      <Text style={styles.subtitle}>Aquí verás las citas del día.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});
