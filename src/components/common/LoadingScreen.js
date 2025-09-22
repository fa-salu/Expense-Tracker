import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ActivityIndicator, Surface } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, borderRadius } from "../../theme/colors";

export default function LoadingScreen() {
  return (
    <LinearGradient
      colors={[
        colors.gradient.start,
        colors.gradient.middle,
        colors.gradient.end,
      ]}
      style={styles.container}
    >
      <Surface style={styles.logoContainer} elevation={4}>
        <Text style={styles.logoText}>💰</Text>
      </Surface>
      <Text style={styles.appTitle}>Expense Tracker</Text>
      <Text style={styles.loadingText}>Loading...</Text>
      <ActivityIndicator
        size="large"
        color={colors.text.white}
        style={styles.loader}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text.white,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: spacing.lg,
  },
  loader: {
    marginTop: spacing.md,
  },
});
