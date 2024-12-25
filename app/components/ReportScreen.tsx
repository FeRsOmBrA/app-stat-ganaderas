import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import { parse, format, subDays } from "date-fns";
import { es } from "date-fns/locale";

const screenWidth = Dimensions.get("window").width;

interface Event {
  tipoEvento: string;
  fecha: string;
  descripcion: string;
}

const ReportScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<{ [key: string]: Event[] }>({});
  const [animalStatsByType, setAnimalStatsByType] = useState<{
    [key: string]: number;
  }>({});
  const [animalStatsByBreed, setAnimalStatsByBreed] = useState<{
    [key: string]: number;
  }>({});
  const [animalStatsByFarm, setAnimalStatsByFarm] = useState<{
    [key: string]: number;
  }>({});
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [deads, setDeads] = useState(0);
  const [pendingVaccines, setPendingVaccines] = useState(0);
  const [ageDistribution, setAgeDistribution] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    // Cargar eventos
    const eventsRef = ref(database, "eventos");
    onValue(eventsRef, (snapshot) => {
      const allEvents: { [key: string]: Event[] } = {};
      const eventData = snapshot.val();

      // Procesar y estandarizar fechas
      const dateFormats = ["EEE MMM dd yyyy", "yyyy-MM-dd", "EEE MMM dd yyyy"];
      const oneWeekAgo = subDays(new Date(), 7);
      for (const animalId in eventData) {
        const filteredEvents = [];
        for (const eventId in eventData[animalId]) {
          const event = eventData[animalId][eventId];
          let parsedDate: Date | undefined = undefined;
          for (const formatString of dateFormats) {
            parsedDate = parse(event.fecha, formatString, new Date(), {
              locale: es,
            });
            if (!isNaN(parsedDate.getTime())) break;
          }
          if (parsedDate && !isNaN(parsedDate.getTime())) {
            const formattedDate = format(parsedDate, "yyyy-MM-dd");
            if (parsedDate >= oneWeekAgo) {
              filteredEvents.push({
                ...event,
                fecha: formattedDate,
              });
            }
          } else {
            console.warn(`Fecha inválida: ${event.fecha}`);
          }
        }

        if (filteredEvents.length > 0) {
          // Ordenar eventos por fecha más reciente
          filteredEvents.sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
          allEvents[animalId] = filteredEvents;
        }
      }

      setEvents(allEvents);
      setLoading(false);
    });

    // Cargar estadísticas de animales por tipo, raza y finca
    const animalRef = ref(database, "animales");
    onValue(animalRef, (snapshot) => {
      const typeCounts: { [key: string]: number } = {};
      const breedCounts: { [key: string]: number } = {};
      const farmCounts: { [key: string]: number } = {};
      const ageCounts: { [key: string]: number } = {};
      snapshot.forEach((child) => {
        const animal = child.val();
        typeCounts[animal.tipo] = (typeCounts[animal.tipo] || 0) + 1;
        breedCounts[animal.raza] = (breedCounts[animal.raza] || 0) + 1;
        farmCounts[animal.finca] = (farmCounts[animal.finca] || 0) + 1;
        const ageGroup = getAgeGroup(animal.edad);
        ageCounts[ageGroup] = (ageCounts[ageGroup] || 0) + 1;
      });
      setAnimalStatsByType(typeCounts);
      setAnimalStatsByBreed(breedCounts);
      setAnimalStatsByFarm(farmCounts);
      setAgeDistribution(ageCounts);
    });

    // Cargar estadísticas generales
    const statsRef = ref(database, "stats");
    onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      setTotalAnimals(data?.totalAnimals || 0);
      setDeads(data?.deads || 0);
      setPendingVaccines(data?.pendingVaccines || 0);
    });
  }, []);

  const getAgeGroup = (age: number) => {
    if (age < 1) return "0-1 año";
    if (age < 3) return "1-3 años";
    if (age < 5) return "3-5 años";
    return "5+ años";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  // Configuración del gráfico
  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
  };

  // Preparar datos para el gráfico de barras por tipo
  const barChartDataByType = {
    labels: Object.keys(animalStatsByType),
    datasets: [{ data: Object.values(animalStatsByType) }],
  };

  // Preparar datos para el gráfico de barras por raza
  const barChartDataByBreed = {
    labels: Object.keys(animalStatsByBreed),
    datasets: [{ data: Object.values(animalStatsByBreed) }],
  };

  // Preparar datos para el gráfico de barras por finca
  const barChartDataByFarm = {
    labels: Object.keys(animalStatsByFarm),
    datasets: [{ data: Object.values(animalStatsByFarm) }],
  };

  // Preparar datos para el gráfico de pastel
  const pieChartData = Object.keys(ageDistribution).map((key, index) => ({
    name: key,
    population: ageDistribution[key],
    color: `rgba(0, 122, 255, ${0.2 + index * 0.2})`,
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  }));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reportes Generales</Text>

      {/* Estadísticas Clave */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalAnimals}</Text>
          <Text style={styles.statLabel}>Total de Animales</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{deads}</Text>
          <Text style={styles.statLabel}>Animales Muertos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{pendingVaccines}</Text>
          <Text style={styles.statLabel}>Vacunaciones Pendientes</Text>
        </View>
      </View>

      {/* Gráfico de Barras: Animales por Tipo */}
      <Text style={styles.chartTitle}>Cantidad de Animales por Tipo</Text>
      <ScrollView horizontal>
        <BarChart
          data={barChartDataByType}
          width={screenWidth * 1.5}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </ScrollView>

      {/* Gráfico de Barras: Animales por Raza */}
      <Text style={styles.chartTitle}>Cantidad de Animales por Raza</Text>
      <ScrollView horizontal>
        <BarChart
          data={barChartDataByBreed}
          width={screenWidth * 1.5}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </ScrollView>

      {/* Gráfico de Barras: Animales por Finca */}
      <Text style={styles.chartTitle}>Cantidad de Animales por Finca</Text>
      <ScrollView horizontal>
        <BarChart
          data={barChartDataByFarm}
          width={screenWidth * 1.5}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </ScrollView>

      {/* Gráfico de Pastel: Distribución de Edades */}
      <Text style={styles.chartTitle}>Distribución de Edades</Text>
      <PieChart
        data={pieChartData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
      />

      {/* Lista de Eventos Recientes */}
      <Text style={styles.chartTitle}>Eventos Recientes</Text>
      {Object.keys(events).map((animalId) => (
        <View key={animalId}>
          <Text style={styles.animalIdTitle}>Animal ID: {animalId}</Text>
          <FlatList
            data={events[animalId]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.eventCard}>
                <Text style={styles.eventTitle}>{item.tipoEvento}</Text>
                <Text style={styles.eventDate}>{item.fecha}</Text>
                <Text style={styles.eventDescription}>{item.descripcion}</Text>
              </View>
            )}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  chartTitle: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
    color: "#555",
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  eventCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  eventDate: {
    fontSize: 14,
    color: "#555",
    marginVertical: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: "#777",
  },
  animalIdTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "30%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default ReportScreen;
