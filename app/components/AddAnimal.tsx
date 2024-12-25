import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { StackNavigationProp } from "@react-navigation/stack";
import { ref, set, get, update } from "firebase/database";
import { database } from "../firebase";

type RootStackParamList = {
  AddAnimal: undefined;
  AnimalList: undefined;
};

type AddAnimalNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddAnimal"
>;

interface AddAnimalProps {
  navigation: AddAnimalNavigationProp;
}

const AddAnimal: React.FC<AddAnimalProps> = ({ navigation }) => {
  const [animalData, setAnimalData] = useState({
    numero: "",
    tipo: "Toro",
    fechaNacimiento: new Date(),
    sexo: "Macho",
    raza: "Braham",
    peso: "",
    finca: "Villa Mary",
    fechaVacunacion: new Date() as Date | null,
    fechaCompra: new Date(),
    ultimoEvento: "",
    edad: 0,
    estado: "vivo"
  });

  const [currentPicker, setCurrentPicker] = useState<string | null>(null);
  const handleDateConfirm = (date: Date) => {
    if (currentPicker && animalData.hasOwnProperty(currentPicker)) {
      setAnimalData((prev) => ({
        ...prev,
        [currentPicker]: date,
      }));
    }
    setCurrentPicker(null);
  };

  const handleSubmit = async () => {
    if (
      !animalData.numero ||
      !animalData.tipo ||
      !animalData.raza ||
      !animalData.finca
    ) {
      Alert.alert("Error", "Por favor completa los campos obligatorios.");
      return;
    }

    try {
      const animalRef = ref(database, `animales/${animalData.numero}`);
      const snapshot = await get(animalRef);

      if (snapshot.exists()) {
        Alert.alert("Error", "Ya existe un animal con este número.");
        return;
      }

      await set(animalRef, {
        ...animalData,
        fechaNacimiento: animalData.fechaNacimiento.toDateString(),
        fechaVacunacion: animalData.fechaVacunacion
          ? animalData.fechaVacunacion.toDateString()
          : null,
        fechaCompra: animalData.fechaCompra.toDateString(),
      });

      // calcular edad
      const today = new Date();
      const birthDate = new Date(animalData.fechaNacimiento);
      const age = today.getFullYear() - birthDate.getFullYear();
      setAnimalData((prev) => ({ ...prev, edad: age }));

      const statsRef = ref(database, "stats/totalAnimals");
      const statsSnapshot = await get(statsRef);
      const currentTotal = statsSnapshot.exists() ? statsSnapshot.val() : 0;

      await update(ref(database, "stats"), {
        totalAnimals: currentTotal + 1,
      });

      // verificar si se debe aumentar el contador de pendingVaccines, solamente si la fecha de vacunación no es nula y es mayor a la fecha actual
      if (
        animalData.fechaVacunacion &&
        animalData.fechaVacunacion > new Date()
      ) {
        const pendingVaccinesRef = ref(database, "stats/pendingVaccines");
        const pendingVaccinesSnapshot = await get(pendingVaccinesRef);
        const currentPending = pendingVaccinesSnapshot.exists()
          ? pendingVaccinesSnapshot.val()
          : 0;

        await update(ref(database, "stats"), {
          pendingVaccines: currentPending + 1,
        });
      }

      Alert.alert("Éxito", "Animal agregado exitosamente.");
      navigation.goBack();
    } catch (error) {
      console.error("Error al agregar el animal:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al agregar el animal. Inténtalo nuevamente."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Agregar Nuevo Animal</Text>

        {/* Número */}
        <Text style={styles.label}>Numero del Animal*</Text>
        <View style={{ padding: 50 }}>
          <TextInput
            style={[styles.input, { marginBottom: 15 }]}
            placeholder="Ingresa aquí el número"
            value={animalData.numero}
            onChangeText={(text) =>
              setAnimalData({ ...animalData, numero: text })
            }
            keyboardType="numeric"
          />
        </View>

        {/* Tipo */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo *</Text>
          <Picker
            selectedValue={animalData.tipo}
            onValueChange={(value) =>
              setAnimalData({ ...animalData, tipo: value })
            }
          >
            <Picker.Item label="Toro" value="Toro" />
            <Picker.Item label="Vaca" value="Vaca" />
            <Picker.Item label="Novilla" value="Novilla" />
            <Picker.Item label="Ternero" value="Ternero" />
            <Picker.Item label="Ternera" value="Ternera" />
          </Picker>
        </View>

        {/* Sexo */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sexo *</Text>
          <Picker
            selectedValue={animalData.sexo}
            onValueChange={(value) =>
              setAnimalData({ ...animalData, sexo: value })
            }
          >
            <Picker.Item label="Macho" value="Macho" />
            <Picker.Item label="Hembra" value="Hembra" />
          </Picker>
        </View>

        {/* Raza */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Raza *</Text>
          <Picker
            selectedValue={animalData.raza}
            onValueChange={(value) =>
              setAnimalData({ ...animalData, raza: value })
            }
          >
            <Picker.Item label="Braham" value="Braham" />
            <Picker.Item label="Cebú" value="Cebú" />
            <Picker.Item label="Pardo" value="Pardo" />
            <Picker.Item label="Simmental" value="Simmental" />
            <Picker.Item label="Pardo(negra)" value="Pardo(negra)" />
            <Picker.Item label="Braham(roja)" value="Braham(roja)" />
            <Picker.Item label="Cebú (blanco)" value="Cebú (blanco)" />
            <Picker.Item
              label="Pardas/Cebu/Simental"
              value="Pardas/Cebu/Simental"
            />
          </Picker>
        </View>
        {/* Peso */}
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.label}>Peso (Kg) </Text>
        </View>

        <View style={{ padding: 50 }}>
          <TextInput
            style={styles.input}
            placeholder="Ingresa aquí el peso"
            value={animalData.peso}
            onChangeText={(text) =>
              setAnimalData({ ...animalData, peso: text })
            }
            keyboardType="numeric"
          />
        </View>

        {/* Finca */}
        <View style={[styles.inputContainer, { marginTop: 15 }]}>
          <Text style={styles.label}>Finca *</Text>
          <Picker
            selectedValue={animalData.finca}
            onValueChange={(value) =>
              setAnimalData({ ...animalData, finca: value })
            }
          >
            <Picker.Item label="Villa Mary" value="Villa Mary" />
            <Picker.Item label="Galilea" value="Galilea" />
            <Picker.Item label="Jerusalen" value="Jerusalen" />
          </Picker>
        </View>

        {/* Fecha de Nacimiento */}
        <Text style={styles.label}>Fecha de Nacimiento *</Text>
        <View
          style={[
            styles.inputContainer,
            { flexDirection: "row", justifyContent: "space-between" },
          ]}
        >
          <View style={{ flex: 0.6 }}>
            <TextInput
              style={styles.input}
              value={
                animalData.fechaNacimiento
                  ? animalData.fechaNacimiento.toLocaleDateString()
                  : ""
              }
              editable={false}
            />
          </View>

          <View
            style={{
              flex: 0.4,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => setCurrentPicker("fechaNacimiento")}
            >
              <Text
                style={{
                  color: "#007AFF",
                }}
              >
                Seleccionar Fecha
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Fecha de Vacunación */}
        <Text style={styles.label}>Fecha de Vacunación *</Text>
        <View
          style={[
            styles.inputContainer,
            { flexDirection: "row", justifyContent: "space-between" },
          ]}
        >
          <View style={{ flex: 0.6 }}>
            <TextInput
              style={styles.input}
              value={
                animalData.fechaVacunacion
                  ? animalData.fechaVacunacion.toLocaleDateString()
                  : ""
              }
              editable={false}
            />
          </View>

          <View
            style={{
              flex: 0.4,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => setCurrentPicker("fechaVacunacion")}
            >
              <Text
                style={{
                  color: "#007AFF",
                }}
              >
                Seleccionar Fecha
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fecha de Vacunación No Aplica */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={() =>
              setAnimalData((prev) => ({
                ...prev,
                fechaVacunacion: null,
              }))
            }
          >
            <Text style={{ color: "#FF3B30" }}>
              Fecha de Vacunación No Aplica
            </Text>
          </TouchableOpacity>
        </View>

        {/* Último Evento */}
        <TextInput
          style={styles.input}
          placeholder="Último Evento"
          value={animalData.ultimoEvento}
          onChangeText={(text) =>
            setAnimalData({ ...animalData, ultimoEvento: text })
          }
        />

        {/* Botón de Enviar */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Agregar Animal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para Fechas */}
      <DateTimePickerModal
        isVisible={!!currentPicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setCurrentPicker(null)}
        date={
          currentPicker === "fechaNacimiento"
            ? animalData.fechaNacimiento
            : currentPicker === "fechaVacunacion"
            ? animalData.fechaVacunacion ?? new Date()
            : currentPicker === "fechaCompra"
            ? animalData.fechaCompra
            : new Date()
        }
      />
    </KeyboardAvoidingView>
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
    fontSize: 30,
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 25,
    marginBottom: 20,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddAnimal;
