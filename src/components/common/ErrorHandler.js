// src/components/common/ErrorHandler.js
import React, { createContext, useContext, useState } from "react";
import { Alert } from "react-native";
import {
  DatabaseError,
  ConnectionError,
  QueryError,
} from "../../utils/database";

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const handleError = (error, context = "App") => {
    console.error(`[${context}] Error:`, error);

    let userMessage = "An unexpected error occurred";
    let shouldShowAlert = true;

    if (error instanceof DatabaseError) {
      userMessage = error.message;
    } else if (error instanceof ConnectionError) {
      userMessage = "Database connection failed. Please try again.";
    } else if (error instanceof QueryError) {
      userMessage = "Database operation failed. Please try again.";
    } else if (error.message) {
      userMessage = error.message;
    }

    setError({ message: userMessage, context, timestamp: Date.now() });

    if (shouldShowAlert) {
      Alert.alert("Error", userMessage, [
        { text: "OK", onPress: () => setError(null) },
      ]);
    }

    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ error, handleError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
