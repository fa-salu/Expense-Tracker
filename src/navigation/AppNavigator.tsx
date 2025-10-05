import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "@/screens/HomeScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <SafeAreaProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: "#f8f9fa" },
          }}
        />
      </Stack.Navigator>
    </SafeAreaProvider>
  );
}
