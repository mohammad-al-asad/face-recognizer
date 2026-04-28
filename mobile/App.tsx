import React from "react";
import { StatusBar } from "react-native";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { store } from "./src/app/store";
import HomeScreen from "./src/screens/HomeScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import AddFaceScreen from "./src/screens/AddFaceScreen";
import UsersScreen from "./src/screens/UsersScreen";

type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  AddFace: undefined;
  Users: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar
              barStyle="light-content"
              translucent
              backgroundColor="transparent"
            />
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                contentStyle: { backgroundColor: "#050510" },
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen
                name="AddFace"
                component={AddFaceScreen}
                options={{
                  headerShown: true,
                  headerTitle: "Add New Face",
                  headerStyle: { backgroundColor: "#050510" },
                  headerTintColor: "#fff",
                  headerTitleStyle: { fontWeight: "700" },
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="Users"
                component={UsersScreen}
                options={{
                  headerShown: true,
                  headerTitle: "Enrolled Users",
                  headerStyle: { backgroundColor: "#050510" },
                  headerTintColor: "#fff",
                  headerTitleStyle: { fontWeight: "700" },
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
