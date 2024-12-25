import React, { useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./components/LoginScreen";
import OwnerDashboard from "./components/OwnerDashboard";
import EmployeeInterface from "./components/EmployeeInterface";
import AnimalList from "./components/AnimalList";
import AnimalDetails from "./components/AnimalDetails";
import AddAnimal from "./components/AddAnimal";
import ReportScreen from "./components/ReportScreen";
import { Animal } from "./types";

type RootStackParamList = {
  Login: undefined;
  OwnerDashboard: undefined;
  EmployeeInterface: undefined;
  AnimalList: undefined;
  AnimalDetails: { animal: Animal };
  AddAnimal: undefined;
  Reports: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

interface User {
  username: string;
  isOwner: boolean;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (username: string, password: string) => {
    // In a real app, we would check the user role here

    const isOwner = username.toLowerCase() === "jvega" && password === "1234";

    setUser({ username, isOwner });
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
        </Stack.Screen>
      ) : user.isOwner ? (
        <>
          <Stack.Screen name="OwnerDashboard" component={OwnerDashboard} />
          <Stack.Screen name="AnimalList" component={AnimalList} />
          <Stack.Screen name="AnimalDetails" component={AnimalDetails} />
          <Stack.Screen name="AddAnimal" component={AddAnimal} />
          <Stack.Screen name="Reports" component={ReportScreen} />
        </>
      ) : (
        <>
          <Stack.Screen
            name="EmployeeInterface"
            component={EmployeeInterface}
          />
          <Stack.Screen name="AnimalList" component={AnimalList} />
          <Stack.Screen name="AnimalDetails" component={AnimalDetails} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default App;
