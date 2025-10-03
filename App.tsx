import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet } from "react-native";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthNavigator } from "@/navigation/AuthNavigator";
import { AppNavigator } from "@/navigation/AppNavigator";
import { initializeDatabase } from "@/db/client";

function AppContent() {
  const { user, loading } = useAuth();
  // const [dbReady, setDbReady] = useState(false);

  // useEffect(() => {
  //   async function initializeApp() {
  //     try {
  //       await initializeDatabase();
  //       setDbReady(true);
  //       console.log("✅ App initialized successfully");
  //     } catch (error) {
  //       console.error("❌ Failed to initialize app:", error);
  //     }
  //   }

  //   initializeApp();
  // }, []);

  // if (loading || !dbReady) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Text style={styles.loadingText}>Loading...</Text>
  //     </View>
  //   );
  // }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
});
