import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Animal } from "../types";

interface AnimalCardProps {
  animal: Animal;
  onPress: (animal: Animal) => void;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(animal)}>
      <Text style={styles.id}>Número: {animal.numero}</Text>
      <Text style={styles.info}>Tipo: {animal.tipo}</Text>
      <Text style={styles.info}>Raza: {animal.raza}</Text>
      <Text style={styles.info}>Sexo: {animal.sexo}</Text>
      <Text style={styles.info}>Edad: {animal.edad} años</Text>
      <Text style={styles.info}>Finca: {animal.finca}</Text>
      <Text style={styles.info}>Peso: {animal.peso || "N/A"}</Text>
      <Text style={styles.info}>
        Último Evento: {animal.ultimoEvento || "N/A"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: 300,
  },
  id: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  info: {
    fontSize: 14,
    color: "#333",
  },
});

export default AnimalCard;
