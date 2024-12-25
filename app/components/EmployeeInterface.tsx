import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Platform,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ref, update, get, push } from "firebase/database";
import { database } from "../firebase";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";

type RootStackParamList = {
  EmployeeInterface: undefined;
  AnimalList: undefined;
};

type EmployeeInterfaceNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EmployeeInterface"
>;

interface EmployeeInterfaceProps {
  navigation: EmployeeInterfaceNavigationProp;
}

const EmployeeInterface: React.FC<EmployeeInterfaceProps> = ({
  navigation,
}) => {
  const [animalId, setAnimalId] = useState("");
  const [weight, setWeight] = useState("");
  const [event, setEvent] = useState("");
  const [description, setDescription] = useState("");
  const [animalIds, setAnimalIds] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([
    "Vacunación",
    "Revisión",
    "Alimentación",
    "Muerte", // Añadimos "Muerte" como evento
  ]);

  useEffect(() => {
    const fetchAnimalIds = async () => {
      try {
        const animalesRef = ref(database, "animales");
        const snapshot = await get(animalesRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const ids = Object.keys(data).filter(
            (id) => data[id].estado !== "muerto"
          );

          setAnimalIds(ids);
        }
      } catch (error) {
        console.error("Error al obtener los IDs de animales:", error);
      }
    };
    fetchAnimalIds();
  }, []);

  const handleSubmit = async () => {
    if (!animalId || !event) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }
    // validar que se puso una descripción si el evento es muerte
    if (event === "Muerte" && !description) {
      Alert.alert("Error", "Por favor describe la causa de la muerte.");
      return;
    }
    // tambien validar la descripción si el evento es otro que no sea muerte
    if (event !== "Muerte" && !description) {
      Alert.alert("Error", "Por favor describe el evento.");
      return;
    }

    try {
      const animalRef = ref(database, `animales/${animalId}`);
      const snapshot = await get(animalRef);

      if (!snapshot.exists()) {
        Alert.alert("Error", "El ID del animal no existe.");
        return;
      }

      if (event === "Muerte") {
        // Actualizar stats/deads
        const statsRef = ref(database, "stats/deads");
        const statsSnapshot = await get(statsRef);
        const currentDeads = statsSnapshot.exists() ? statsSnapshot.val() : 0;

        await update(ref(database, "stats"), {
          deads: currentDeads + 1,
        });

        // Actualizar estado del animal
        await update(animalRef, { estado: "muerto" });
      } else {
        await update(animalRef, { peso: weight, ultimoEvento: event });
      }

      const eventosRef = ref(database, `eventos/${animalId}`);
      await push(eventosRef, {
        tipoEvento: event,
        fecha: format(new Date(), "yyyy-MM-dd"),
        descripcion: description,
      });

      Alert.alert("Éxito", "Los datos fueron enviados correctamente.");
      setAnimalId("");
      setWeight("");
      setEvent("");
    } catch (error) {
      console.error("Error al registrar los datos:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al enviar los datos. Inténtalo nuevamente."
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Interfaz de Empleado</Text>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>ID del Animal</Text>
            <Picker
              selectedValue={animalId}
              onValueChange={(itemValue) => setAnimalId(itemValue)}
            >
              <Picker.Item label="Selecciona un ID" value="" />
              {animalIds.map((id) => (
                <Picker.Item key={id} label={id} value={id} />
              ))}
            </Picker>
          </View>
          {event !== "Muerte" && (
            <TextInput
              style={styles.input}
              placeholder="Peso (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          )}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Evento</Text>
            <Picker
              selectedValue={event}
              onValueChange={(itemValue) => setEvent(itemValue)}
            >
              <Picker.Item label="Selecciona un evento" value="" />
              {events.map((evt) => (
                <Picker.Item key={evt} label={evt} value={evt} />
              ))}
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate("AnimalList")}
          >
            <Text style={styles.buttonText}>Ver Lista de Animales</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginLeft: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EmployeeInterface;
