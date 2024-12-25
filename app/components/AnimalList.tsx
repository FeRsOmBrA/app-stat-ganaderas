import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Picker } from "@react-native-picker/picker";
import { Animal } from "../types";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import AnimalCard from "./AnimalCard";
type RootStackParamList = {
  AnimalList: undefined;
  AnimalDetails: { animal: Animal };
};

type AnimalListNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AnimalList"
>;

interface AnimalListProps {
  navigation: AnimalListNavigationProp;
}

const AnimalList: React.FC<AnimalListProps> = ({ navigation }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortCriteria, setSortCriteria] = useState<"numero" | "edad">("numero");
  const [filterType, setFilterType] = useState<string>("");
  const [filterFinca, setFilterFinca] = useState<string>("");

  useEffect(() => {
    const animalRef = ref(database, "animales");
    const unsubscribe = onValue(animalRef, (snapshot) => {
      const animalList: Animal[] = [];
      snapshot.forEach((childSnapshot) => {
        const animalData = childSnapshot.val();
        animalList.push({
          id: childSnapshot.key,
          ...animalData,
        });
      });
      setAnimals(animalList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAnimalPress = (animal: Animal) => {
    navigation.navigate("AnimalDetails", { animal });
  };

  const sortedAndFilteredAnimals = animals
    .filter((animal) => {
      return (
        (!filterType || animal.tipo === filterType) &&
        (!filterFinca || animal.finca === filterFinca)
      );
    })
    .sort((a, b) => {
      if (sortCriteria === "numero") {
        return a.numero.localeCompare(b.numero);
      } else {
        return a.edad - b.edad;
      }
    });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando animales...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.title}>Ordenar/Filtrar</Text>
      </View>
      <View style={styles.filterContainer}>
        <View style={styles.filterItem}>
          <Picker
            selectedValue={sortCriteria}
            onValueChange={(value) => setSortCriteria(value)}
            itemStyle={styles.picker}
          >
            <Picker.Item label="Número" value="numero" />
            <Picker.Item label="Edad" value="edad" />
          </Picker>
        </View>
        <View style={styles.filterItem}>
          <Picker
            selectedValue={filterType}
            onValueChange={(value) => setFilterType(value)}
            itemStyle={styles.picker}
          >
            <Picker.Item label="Todos" value="" />
            <Picker.Item label="Toro" value="Toro" />
            <Picker.Item label="Vaca" value="Vaca" />
            <Picker.Item label="Novilla" value="Novilla" />
            <Picker.Item label="Ternero" value="Ternero" />
            <Picker.Item label="Ternera" value="Ternera" />
          </Picker>
        </View>
        <View style={styles.filterItem}>
          <Picker
            selectedValue={filterFinca}
            onValueChange={(value) => setFilterFinca(value)}
            itemStyle={styles.picker}
          >
            <Picker.Item label="Todas" value="" />
            <Picker.Item label="Villa Mary" value="Villa Mary" />
            <Picker.Item label="Galilea" value="Galilea" />
            <Picker.Item label="Jerusalen" value="Jerusalen" />
          </Picker>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          marginTop: 100,

          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {sortedAndFilteredAnimals.length === 0 ? (
          <Text style={styles.noDataText}>No hay animales registrados.</Text>
        ) : (
          <>
            <FlatList
              data={sortedAndFilteredAnimals}
              renderItem={({ item }) => (
                <AnimalCard animal={item} onPress={handleAnimalPress} />
              )}
              keyExtractor={(item) => item.numero}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 18,
    color: "#777",
  },
  filterContainer: {
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    height: 85,
  },
  filterItem: {
    flex: 1,
  },
  picker: {
    fontSize: 10,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default AnimalList;
