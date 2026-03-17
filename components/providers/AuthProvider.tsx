"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: {
    url: string;
    publicId: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from cookies
  useEffect(() => {
    const initAuth = () => {
      const accessToken = Cookies.get("accessToken");
      const userStr = localStorage.getItem("user");

      if (accessToken && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (error) {
          console.error("Failed to parse user data:", error);
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(
    (accessToken: string, refreshToken: string, userData: User) => {
      // Store tokens in httpOnly-like cookies (secure in production)
      Cookies.set("accessToken", accessToken, {
        expires: 1 / 96, // 15 minutes
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      Cookies.set("refreshToken", refreshToken, {
        expires: 30, // 30 days
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    },
    [],
  );

  const logout = useCallback(() => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  }, [router]);

  const updateUser = useCallback((userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const getAccessToken = useCallback(() => {
    return Cookies.get("accessToken") || null;
  }, []);

  const getRefreshToken = useCallback(() => {
    return Cookies.get("refreshToken") || null;
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    getAccessToken,
    getRefreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
