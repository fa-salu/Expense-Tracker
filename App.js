import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, Button } from 'react-native-paper';
import { initDatabase } from './src/utils/database';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import TransactionListScreen from './src/screens/TransactionListScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('App: Starting initialization...');
      setInitError(null);
      
      // Initialize database
      await initDatabase();
      console.log('App: Database initialized successfully');
      
      // Check if user is already logged in by checking for stored user ID
      // Note: In a production app, you'd want to use secure storage for the user ID
      // For now, we'll start fresh each time (no persistent login)
      setCurrentUser(null);
      setIsAuthenticated(false);
      console.log('App: Initialization completed successfully');
    } catch (error) {
      console.error('App: Error initializing app:', error);
      setInitError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (user) => {
    try {
      console.log('App: User logged in:', user);
      // Store user data in state
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('App: Error saving user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('App: User logged out');
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('App: Error during logout:', error);
    }
  };

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  if (initError) {
    return (
      <PaperProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: 'red', textAlign: 'center' }}>
            Database initialization failed: {initError}
          </Text>
          <Button 
            mode="contained" 
            onPress={initializeApp}
            style={{ marginTop: 20 }}
          >
            Retry
          </Button>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Dashboard">
                {(props) => (
                  <DashboardScreen 
                    {...props} 
                    onLogout={handleLogout} 
                    currentUser={currentUser}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen 
                name="AddTransaction" 
                options={{ 
                  title: 'Add Transaction',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#6200ea' },
                  headerTintColor: '#fff'
                }}
              >
                {(props) => (
                  <AddTransactionScreen 
                    {...props} 
                    currentUser={currentUser}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen 
                name="TransactionList" 
                options={{ 
                  title: 'All Transactions',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#6200ea' },
                  headerTintColor: '#fff'
                }}
              >
                {(props) => (
                  <TransactionListScreen 
                    {...props} 
                    currentUser={currentUser}
                  />
                )}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
