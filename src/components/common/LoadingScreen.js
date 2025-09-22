import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ActivityIndicator, Surface, ProgressBar } from "react-native-paper";
import { colors, spacing, borderRadius } from "../../theme/colors";

export default function LoadingScreen({ message = "Loading..." }) {
  const [loadingMessage, setLoadingMessage] = useState("Starting up...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messages = [
      "Starting up...",
      "Initializing database...",
      "Checking user session...",
      "Almost ready...",
    ];

    let messageIndex = 0;
    let progressValue = 0;

    const interval = setInterval(() => {
      if (messageIndex < messages.length) {
        setLoadingMessage(messages[messageIndex]);
        messageIndex++;
      }

      if (progressValue < 90) {
        progressValue += 15;
        setProgress(progressValue / 100);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Surface style={styles.logoContainer} elevation={4}>
        <Text style={styles.logoText}>💰</Text>
      </Surface>

      <Text style={styles.appTitle}>Expense Tracker</Text>

      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
        <Text style={styles.loadingText}>{loadingMessage}</Text>

        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            color={colors.primary}
            style={styles.progressBar}
          />
        </View>
      </View>

      <Text style={styles.developmentNote}>
        {__DEV__ ? "Development Mode - Session will persist" : ""}
      </Text>
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
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  loader: {
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  progressContainer: {
    width: 200,
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  developmentNote: {
    fontSize: 12,
    color: colors.text.light,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
