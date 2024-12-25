import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ref, update, remove } from "firebase/database";
import { database } from "../firebase";

interface Animal {
  edad: number;
  fechaCompra?: string;
  fechaNacimiento: string;
  fechaVacunacion: string;
  numero: string;
  peso?: string;
  raza: string;
  sexo: string;
  tipo: string;
  finca: string;
  ultimoEvento?: string;
  estado: string;
}

type AnimalDetailsRouteProp = RouteProp<
  { AnimalDetails: { animal: Animal } },
  "AnimalDetails"
>;

type RootStackParamList = {
  AnimalList: undefined;
  AnimalDetails: { animal: Animal };
};

type AnimalDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AnimalDetails"
>;

interface AnimalDetailsProps {
  route: AnimalDetailsRouteProp;
  navigation: AnimalDetailsNavigationProp;
}

const AnimalDetails: React.FC<AnimalDetailsProps> = ({ route, navigation }) => {
  const { animal } = route.params;
  const [editableAnimal, setEditableAnimal] = useState<Animal>(animal);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = async () => {
    try {
      const animalRef = ref(database, `animales/${editableAnimal.numero}`);
      await update(animalRef, editableAnimal);
      Alert.alert("Éxito", "Animal actualizado exitosamente.");
      setIsEditing(false);
      navigation.navigate("AnimalList"); // Navegar de regreso a la lista de animales
    } catch (error) {
      console.error("Error al actualizar el animal:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al actualizar el animal. Inténtalo nuevamente."
      );
    }
  };

  const handleDelete = async () => {
    try {
      const animalRef = ref(database, `animales/${animal.numero}`);
      await remove(animalRef);
      Alert.alert("Éxito", "Animal eliminado exitosamente.");
      navigation.navigate("AnimalList"); // Navegar de regreso a la lista de animales
    } catch (error) {
      console.error("Error al eliminar el animal:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al eliminar el animal. Inténtalo nuevamente."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Detalles del Animal</Text>
        <View style={styles.detailsContainer}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={editableAnimal.numero}
                onChangeText={(text) =>
                  setEditableAnimal({ ...editableAnimal, numero: text })
                }
                placeholder="Número"
              />
              <TextInput
                style={styles.input}
                value={editableAnimal.tipo}
                onChangeText={(text) =>
                  setEditableAnimal({ ...editableAnimal, tipo: text })
                }
                placeholder="Tipo"
              />
              <TextInput
                style={styles.input}
                value={editableAnimal.fechaNacimiento}
                onChangeText={(text) =>
                  setEditableAnimal({
                    ...editableAnimal,
                    fechaNacimiento: text,
                  })
                }
                placeholder="Fecha de Nacimiento"
              />
              <TextInput
                style={styles.input}
                value={editableAnimal.sexo}
                onChangeText={(text) =>
                  setEditableAnimal({ ...editableAnimal, sexo: text })
                }
                placeholder="Sexo"
              />
              <TextInput
                style={styles.input}
                value={editableAnimal.raza}
                onChangeText={(text) =>
                  setEditableAnimal({ ...editableAnimal, raza: text })
                }
                placeholder="Raza"
              />
              <TextInput
                style={styles.input}
                value={editableAnimal.fechaVacunacion}
                onChangeText={(text) =>
                  setEditableAnimal({
                    ...editableAnimal,
                    fechaVacunacion: text,
                  })
                }
                placeholder="Fecha de Vacunación"
              />
              <TextInput
                style={styles.input}
                value={editableAnimal.peso}
                onChangeText={(text) =>
                  setEditableAnimal({ ...editableAnimal, peso: text })
                }
                placeholder="Peso"
              />
              <TextInput
                style={styles.input}
                value={editableAnimal.edad.toString()}
                onChangeText={(text) =>
                  setEditableAnimal({
                    ...editableAnimal,
                    edad: parseInt(text, 10),
                  })
                }
                placeholder="Edad"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                value={editableAnimal.finca}
                onChangeText={(text) =>
                  setEditableAnimal({ ...editableAnimal, finca: text })
                }
                placeholder="Finca"
              />
              <TextInput
                style={styles.input}
                value={editableAnimal.fechaCompra}
                onChangeText={(text) =>
                  setEditableAnimal({ ...editableAnimal, fechaCompra: text })
                }
                placeholder="Fecha de Compra"
              />
              <TextInput
                style={styles.input}
                value={editableAnimal.ultimoEvento}
                onChangeText={(text) =>
                  setEditableAnimal({ ...editableAnimal, ultimoEvento: text })
                }
                placeholder="Último Evento"
              />
              <TouchableOpacity style={styles.button} onPress={handleEdit}>
                <Text style={styles.buttonText}>Guardar Cambios</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.detailItem}>Número: {animal.numero}</Text>
              <Text style={styles.detailItem}>Tipo: {animal.tipo}</Text>
              <Text style={styles.detailItem}>
                Fecha de Nacimiento: {animal.fechaNacimiento}
              </Text>
              <Text style={styles.detailItem}>Sexo: {animal.sexo}</Text>
              <Text style={styles.detailItem}></Text>
              <Text style={styles.detailItem}>Raza: {animal.raza}</Text>
              <Text style={styles.detailItem}>
                Fecha Vacunación: {animal.fechaVacunacion}
              </Text>
              <Text style={styles.detailItem}>
                Peso: {animal.peso || "N/A"}
              </Text>
              <Text style={styles.detailItem}>Edad: {animal.edad} años</Text>
              <Text style={styles.detailItem}></Text>
              <Text style={styles.detailItem}>Finca: {animal.finca}</Text>
              <Text style={styles.detailItem}>
                Fecha de Compra: {animal.fechaCompra || "N/A"}
              </Text>
              <Text style={styles.detailItem}>
                Último Evento: {animal.ultimoEvento || "N/A"}
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
  },
  detailItem: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
});

export default AnimalDetails;
