import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  JSX,
} from "react";
import { AuthService } from "@/services/auth";
import type { User } from "@/db/schema";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error checking auth state:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const user = await AuthService.login(email, password);
    setUser(user);
  };

  const register = async (email: string, password: string, name: string) => {
    const user = await AuthService.register(email, password, name);
    setUser(user);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
