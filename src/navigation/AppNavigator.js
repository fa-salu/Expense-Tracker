import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { colors } from "../theme/colors";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import AddTransactionScreen from "../screens/Transaction/AddTransactionScreen";
import TransactionListScreen from "../screens/Transaction/TransactionListScreen";

const AppStack = createStackNavigator();

export default function AppNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <AppStack.Screen name="Dashboard" component={DashboardScreen} />
      <AppStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{
          title: "Add Transaction",
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primary,
            elevation: 4,
            shadowOpacity: 0.3,
            shadowRadius: 4,
            shadowOffset: { height: 2, width: 0 },
          },
          headerTintColor: colors.text.white,
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
          cardStyle: { backgroundColor: colors.surface },
        }}
      />
      <AppStack.Screen
        name="TransactionList"
        component={TransactionListScreen}
        options={{
          title: "All Transactions",
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primary,
            elevation: 4,
            shadowOpacity: 0.3,
            shadowRadius: 4,
            shadowOffset: { height: 2, width: 0 },
          },
          headerTintColor: colors.text.white,
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
          cardStyle: { backgroundColor: colors.surface },
        }}
      />
    </AppStack.Navigator>
  );
}
