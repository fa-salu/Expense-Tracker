import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button, Surface } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing, borderRadius } from "../../theme/colors";

export default function ErrorScreen({ error }) {
  const { setError, setLoading } = useAuth();

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const { initDatabase } = require("../../database/database");
      await initDatabase();
      setLoading(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.errorContainer} elevation={4}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button
          mode="contained"
          onPress={handleRetry}
          style={styles.retryButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Try Again
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  errorContainer: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontWeight: "600",
  },
});
