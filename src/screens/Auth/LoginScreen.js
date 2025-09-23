import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  Surface,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../database";
import { colors, spacing, borderRadius } from "../../theme/colors";

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { signIn, setLoading } = useAuth();

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phone.trim()) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validatePassword = (pwd) => {
    if (!pwd.trim()) {
      setPasswordError("Password is required");
      return false;
    }
    if (pwd.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleLogin = async () => {
    const isPhoneValid = validatePhone(phoneNumber);
    const isPasswordValid = validatePassword(password);

    if (!isPhoneValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const user = await loginUser(phoneNumber, password);
      signIn(user);
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error.message || "Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient
        colors={[
          colors.gradient.start,
          colors.gradient.middle,
          colors.gradient.end,
        ]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
              <Surface style={styles.logoContainer} elevation={4}>
                <Text style={styles.logoText}>💰</Text>
              </Surface>
              <Title style={styles.appTitle}>Expense Tracker</Title>
              <Paragraph style={styles.welcomeText}>
                Welcome back! Sign in to continue
              </Paragraph>
            </View>

            <Card style={styles.card} elevation={8}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Phone Number"
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                      if (phoneError) validatePhone(text);
                    }}
                    mode="outlined"
                    keyboardType="phone-pad"
                    placeholder="+1234567890"
                    style={styles.input}
                    error={!!phoneError}
                    left={<TextInput.Icon icon="phone" />}
                    outlineColor="#e2e8f0"
                    activeOutlineColor={colors.primary}
                    theme={{ colors: { primary: colors.primary } }}
                  />
                  {phoneError ? (
                    <Text style={styles.errorText}>{phoneError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) validatePassword(text);
                    }}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    error={!!passwordError}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    outlineColor="#e2e8f0"
                    activeOutlineColor={colors.primary}
                    theme={{ colors: { primary: colors.primary } }}
                  />
                  {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  ) : null}
                </View>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Sign In
                </Button>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  mode="text"
                  onPress={() => navigation.navigate("Register")}
                  style={styles.registerButton}
                  labelStyle={styles.registerButtonLabel}
                >
                  Don't have an account? Sign Up
                </Button>
              </Card.Content>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
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
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text.white,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  card: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
  },
  cardContent: {
    padding: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },
  loginButton: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: spacing.md,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
    fontSize: 14,
  },
  registerButton: {
    marginTop: spacing.sm,
  },
  registerButtonLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
