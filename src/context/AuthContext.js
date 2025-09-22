import React, { createContext, useContext, useReducer, useEffect } from "react";
import { initDatabase } from "../utils/database";

const AuthContext = createContext();

const initialState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...state,
        user: action.user,
        isAuthenticated: !!action.user,
        isLoading: false,
      };
    case "SIGN_IN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.user,
        error: null,
      };
    case "SIGN_OUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.isLoading,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await initDatabase();
        // In production, check for stored user token/session
        dispatch({ type: "RESTORE_TOKEN", user: null });
      } catch (error) {
        dispatch({ type: "SET_ERROR", error: error.message });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    signIn: (user) => dispatch({ type: "SIGN_IN", user }),
    signOut: () => dispatch({ type: "SIGN_OUT" }),
    setError: (error) => dispatch({ type: "SET_ERROR", error }),
    setLoading: (isLoading) => dispatch({ type: "SET_LOADING", isLoading }),
    ...state,
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
