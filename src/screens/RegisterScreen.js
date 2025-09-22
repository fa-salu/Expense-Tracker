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
  IconButton,
  Surface,
  ProgressBar,
  Chip,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { registerUser } from "../utils/database";
import { colors, spacing, borderRadius } from "../theme/colors";

export default function RegisterScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 4) strength += 25;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    if (strength === 0) return "";
    if (strength <= 25) return "Weak";
    if (strength <= 50) return "Fair";
    if (strength <= 75) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 25) return colors.error;
    if (strength <= 50) return colors.warning;
    if (strength <= 75) return colors.primary;
    return colors.success;
  };

  const validateForm = () => {
    const newErrors = {};

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneNumber.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(phoneNumber, password);

      Alert.alert(
        "Success! 🎉",
        "Account created successfully! You can now sign in.",
        [
          {
            text: "Sign In",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        Alert.alert(
          "Account Exists",
          "Phone number already registered. Please sign in instead."
        );
      } else {
        Alert.alert(
          "Registration Failed",
          error.message || "Please try again."
        );
      }
    } finally {
      setIsLoading(false);
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
              <Title style={styles.appTitle}>Create Account</Title>
              <Paragraph style={styles.welcomeText}>
                Join us and start tracking your expenses
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
                      if (errors.phone) {
                        const newErrors = { ...errors };
                        delete newErrors.phone;
                        setErrors(newErrors);
                      }
                    }}
                    mode="outlined"
                    keyboardType="phone-pad"
                    placeholder="+1234567890"
                    style={styles.input}
                    error={!!errors.phone}
                    left={<TextInput.Icon icon="phone" />}
                    outlineColor="#e2e8f0"
                    activeOutlineColor={colors.primary}
                    theme={{ colors: { primary: colors.primary } }}
                  />
                  {errors.phone ? (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordStrength(calculatePasswordStrength(text));
                      if (errors.password) {
                        const newErrors = { ...errors };
                        delete newErrors.password;
                        setErrors(newErrors);
                      }
                    }}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    error={!!errors.password}
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
                  {errors.password ? (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  ) : null}

                  {password.length > 0 && (
                    <View style={styles.passwordStrength}>
                      <ProgressBar
                        progress={passwordStrength / 100}
                        color={getPasswordStrengthColor(passwordStrength)}
                        style={styles.progressBar}
                      />
                      <Text
                        style={[
                          styles.strengthText,
                          { color: getPasswordStrengthColor(passwordStrength) },
                        ]}
                      >
                        {getPasswordStrengthText(passwordStrength)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        const newErrors = { ...errors };
                        delete newErrors.confirmPassword;
                        setErrors(newErrors);
                      }
                    }}
                    mode="outlined"
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                    error={!!errors.confirmPassword}
                    left={<TextInput.Icon icon="lock-check" />}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? "eye-off" : "eye"}
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    }
                    outlineColor="#e2e8f0"
                    activeOutlineColor={colors.primary}
                    theme={{ colors: { primary: colors.primary } }}
                  />
                  {errors.confirmPassword ? (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  ) : null}
                </View>

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.registerButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  mode="text"
                  onPress={() => navigation.navigate("Login")}
                  style={styles.loginButton}
                  labelStyle={styles.loginButtonLabel}
                >
                  Already have an account? Sign In
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
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
    position: "relative",
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
  passwordStrength: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: "500",
  },

  registerButton: {
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
  loginButton: {
    marginTop: spacing.sm,
  },
  loginButtonLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
