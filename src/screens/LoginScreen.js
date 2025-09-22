import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  Switch
} from 'react-native-paper';
import { registerUser, loginUser, initDatabase } from '../utils/database';

export default function LoginScreen({ onLogin }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = async () => {
    if (!phoneNumber.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Basic password validation
    if (password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Initialize database first
      await initDatabase();

      if (isRegisterMode) {
        // Register new user
        const user = await registerUser(phoneNumber, password);
        Alert.alert(
          'Success', 
          'Account created successfully! You can now login.',
          [
            {
              text: 'OK',
              onPress: () => setIsRegisterMode(false)
            }
          ]
        );
        // Clear form
        setPhoneNumber('');
        setPassword('');
      } else {
        // Login existing user
        const user = await loginUser(phoneNumber, password);
        onLogin(user);
      }
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        Alert.alert('Error', 'Phone number already exists. Please login instead.');
        setIsRegisterMode(false);
      } else {
        Alert.alert('Error', error.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setPhoneNumber('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Expense Tracker</Title>
              <Paragraph style={styles.subtitle}>
                {isRegisterMode ? 'Create your account' : 'Sign in to your account'}
              </Paragraph>
              
              <View style={styles.modeToggle}>
                <Text style={styles.modeLabel}>Login</Text>
                <Switch
                  value={isRegisterMode}
                  onValueChange={toggleMode}
                  color="#6200ea"
                />
                <Text style={styles.modeLabel}>Register</Text>
              </View>
              
              <TextInput
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                mode="outlined"
                keyboardType="phone-pad"
                placeholder="+1234567890"
                style={styles.input}
              />
              
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
              />
              
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                style={styles.submitButton}
                contentStyle={styles.buttonContent}
              >
                {isRegisterMode ? 'Register' : 'Login'}
              </Button>
              
              <Button
                mode="text"
                onPress={toggleMode}
                style={styles.toggleButton}
              >
                {isRegisterMode 
                  ? 'Already have an account? Login' 
                  : "Don't have an account? Register"
                }
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modeLabel: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 12,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#6200ea',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  toggleButton: {
    marginTop: 8,
  },
});
