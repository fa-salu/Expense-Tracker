import React, { createContext, useContext, useReducer, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { initDatabase, getUserById } from "../utils/database";

const AuthContext = createContext();
const USER_KEY = "expense_tracker_user";

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
        error: null,
      };
    case "SIGN_IN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.user,
        error: null,
        isLoading: false,
      };
    case "SIGN_OUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
        isLoading: false,
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
        console.log("[Auth] Starting app bootstrap...");
        dispatch({ type: "SET_LOADING", isLoading: true });

        // Initialize database first
        try {
          await initDatabase();
          console.log("[Auth] Database initialized successfully");
        } catch (dbError) {
          console.error("[Auth] Database initialization failed:", dbError);
          // Continue anyway - app should still be usable
        }

        // Check for stored user session
        try {
          const storedUserData = await SecureStore.getItemAsync(USER_KEY);

          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            console.log("[Auth] Found stored user data:", userData.id);

            // Verify user still exists in database
            try {
              const currentUser = await getUserById(userData.id);
              if (currentUser) {
                console.log("[Auth] Restored user session:", currentUser.id);
                dispatch({ type: "RESTORE_TOKEN", user: currentUser });
                return;
              } else {
                console.log(
                  "[Auth] Stored user no longer exists, clearing session"
                );
                await SecureStore.deleteItemAsync(USER_KEY);
              }
            } catch (verifyError) {
              console.log(
                "[Auth] Could not verify stored user, clearing session:",
                verifyError.message
              );
              await SecureStore.deleteItemAsync(USER_KEY);
            }
          } else {
            console.log("[Auth] No stored user session found");
          }
        } catch (storageError) {
          console.log(
            "[Auth] Error accessing secure storage:",
            storageError.message
          );
        }

        dispatch({ type: "RESTORE_TOKEN", user: null });
      } catch (error) {
        console.error("[Auth] Bootstrap failed:", error);
        dispatch({ type: "SET_ERROR", error: error.message });
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (user) => {
    try {
      console.log("[Auth] Signing in user:", user.id);

      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      console.log("[Auth] User session stored securely");

      dispatch({ type: "SIGN_IN", user });
    } catch (error) {
      console.error("[Auth] Failed to store user session:", error);
      dispatch({ type: "SIGN_IN", user });
    }
  };

  const signOut = async () => {
    try {
      console.log("[Auth] Signing out user");

      await SecureStore.deleteItemAsync(USER_KEY);
      console.log("[Auth] User session cleared");

      dispatch({ type: "SIGN_OUT" });
    } catch (error) {
      console.error("[Auth] Error during logout:", error);
      dispatch({ type: "SIGN_OUT" });
    }
  };

  const authContext = {
    signIn,
    signOut,
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
