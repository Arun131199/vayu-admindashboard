import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../service/api";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string; email: string } | null;
  permissions: string[];
  login: (email: string, password: string) => Promise<{ username: string; email: string } | null>;
  completeLogin: (userData: { username: string; email: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as { username: string; email: string };
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    return null;
  }
};

const getStoredPermissions = (): string[] => {
  const stored = localStorage.getItem("permissions");
  if (!stored) return [];
  try {
    return JSON.parse(stored) as string[];
  } catch {
    localStorage.removeItem("permissions");
    return [];
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ username: string; email: string } | null>(() => getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true" && Boolean(getStoredUser());
  });
  const [permissions, setPermissions] = useState<string[]>(() => getStoredPermissions());

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUser = getStoredUser();

    if (storedAuth === "true" && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
      setPermissions(getStoredPermissions());
    }
  }, []);

  const completeLogin = (userData: { username: string; email: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("admin/auth/login", { email, password });
      const result = response?.data;
      if (result.success) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("permissions", JSON.stringify(result.data.permissions));
        
        setPermissions(result.data.permissions);
        toast.success("Login successfully");
        return { username: result.data.name, email: result.data.email };
      }
      toast.error(result.message || "Invalid email or password");
      return null;
    } catch (error) {
      toast.error("Invalid email or password");
      console.error(error);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setPermissions([]);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("permissions");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, permissions, login, completeLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}