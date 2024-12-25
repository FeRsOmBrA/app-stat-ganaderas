import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase"; // Asegúrate de importar correctamente tu configuración de Firebase.

type RootStackParamList = {
  OwnerDashboard: undefined;
  AnimalList: undefined;
  AddAnimal: undefined;
  Reports: undefined;
};

type OwnerDashboardNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OwnerDashboard"
>;

interface OwnerDashboardProps {
  navigation: OwnerDashboardNavigationProp;
}

// Componente principal
const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ navigation }) => {
  const [stats, setStats] = useState<{
    totalAnimals: number;
    pendingVaccines: number;
  }>({
    totalAnimals: 0,
    pendingVaccines: 0,
  });
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas desde Firebase
  useEffect(() => {
    const statsRef = ref(database, "stats"); // Referencia al nodo `stats`
    const unsubscribe = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStats({
          totalAnimals: data.totalAnimals || 0,
          pendingVaccines: data.pendingVaccines || 0,
        });
      }
      setLoading(false);
    });

    // Cleanup al desmontar
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Panel de Control del Propietario</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.totalAnimals}</Text>
          <Text style={styles.statLabel}>Total de Ganado</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.pendingVaccines}</Text>
          <Text style={styles.statLabel}>Vacunaciones Pendientes</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("AnimalList")}
      >
        <Text style={styles.buttonText}>Ver Todos los Animales</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("AddAnimal")}
      >
        <Text style={styles.buttonText}>Agregar Nuevo Animal</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Reports")}
      >
        <Text style={styles.buttonText}>Generar Informe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "48%",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
});

export default OwnerDashboard;
