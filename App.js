import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { ErrorProvider } from "./src/components/common/ErrorHandler";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <PaperProvider>
      <ErrorProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ErrorProvider>
    </PaperProvider>
  );
}
