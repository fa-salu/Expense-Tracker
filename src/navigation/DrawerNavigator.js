import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { colors } from "../theme/colors";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import TransactionListScreen from "../screens/Transaction/TransactionListScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
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
        drawerStyle: {
          backgroundColor: colors.surface,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text.secondary,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "500",
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
        }}
      />
      <Drawer.Screen
        name="TransactionList"
        component={TransactionListScreen}
        options={{
          title: "All Transactions",
        }}
      />
    </Drawer.Navigator>
  );
}
