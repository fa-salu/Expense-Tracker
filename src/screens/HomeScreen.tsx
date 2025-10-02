import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";

export function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Profile */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>Welcome to Expense Tracker!</Text>
        <Text style={styles.welcomeSubtitle}>
          Ready to track your expenses and income?
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Balance</Text>
            <Text style={styles.statAmount}>$0.00</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>This Month</Text>
            <Text style={styles.statAmount}>$0.00</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Transaction</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 20,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    flex: 0.48,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
