"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { isTokenExpired, getTokenRemainingTime } from "@/utils/auth";
import api from "@/utils/api";
import { useQueryClient } from "@tanstack/react-query";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: any }>;
  register: (credentials: {
    email: string;
    password: string;
    name: string;
  }) => Promise<{ success: boolean; error?: any }>;
  loginWithGoogleToken: (
    googleToken: string
  ) => Promise<{ success: boolean; error?: any }>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  token: null,
  login: async () => ({ success: false, error: "Context not initialized" }),
  register: async () => ({ success: false, error: "Context not initialized" }),
  loginWithGoogleToken: async () => ({
    success: false,
    error: "Context not initialized",
  }),
  logout: () => {},
  isLoading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const tokenCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkTokenExpiration = () => {
    const currentToken = localStorage.getItem("authToken");
    if (currentToken && isTokenExpired(currentToken)) {
      logout();
      toast.error("Your session has expired. Please log in again.");
    }
  };

  const setupTokenExpirationCheck = (currentToken: string) => {
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
    }

    if (isTokenExpired(currentToken)) {
      logout();
      toast.error("Your session has expired. Please log in again.");
      return;
    }

    const remainingTime = getTokenRemainingTime(currentToken);
    if (remainingTime > 0) {
      const checkInterval = Math.min(60, remainingTime) * 1000;
      tokenCheckIntervalRef.current = setInterval(() => {
        checkTokenExpiration();
      }, checkInterval);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem("userData");
      localStorage.removeItem("authToken");
      queryClient.clear();

      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }

      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.log("unable to logout");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken) {
      if (!isTokenExpired(storedToken)) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setIsAuthenticated(true);
        setupTokenExpirationCheck(storedToken);
      } else {
        logout();
        toast.error("Your session has expired. Please log in again.");
      }
    }

    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
    };
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const { email, password } = credentials;
    setIsLoading(true);

    try {
      const loginRes = await api.post(`/auth/login`, { email, password });
      const data = loginRes.data;

      if (data.token) {
        setUser(data.user || null);
        setToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem("authToken", data.token);
        if (data.user) {
          localStorage.setItem("userData", JSON.stringify(data.user));
        }
        setupTokenExpirationCheck(data.token);
        return { success: true };
      } else {
        throw new Error("No token received from server");
      }
    } catch (err) {
      let errorMessage = "Login failed";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: {
    email: string;
    password: string;
    name: string;
  }) => {
    const { email, password, name } = credentials;
    setIsLoading(true);

    try {
      const registerRes = await api.post(`/auth/register`, {
        email,
        password,
        name,
      });
      const data = registerRes.data;

      if (data.token) {
        setUser(data.user || null);
        setToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem("authToken", data.token);
        if (data.user) {
          localStorage.setItem("userData", JSON.stringify(data.user));
        }
        setupTokenExpirationCheck(data.token);
        return { success: true };
      } else {
        throw new Error("No token received from server");
      }
    } catch (err) {
      let errorMessage = "Register failed";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleToken = async (googleToken: string) => {
    setIsLoading(true);

    try {
      const loginRes = await api.post(`/auth/google-login`, {
        token: googleToken,
      });
      const data = loginRes.data;

      if (data.token) {
        setUser(data.user || null);
        setToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem("authToken", data.token);
        if (data.user) {
          localStorage.setItem("userData", JSON.stringify(data.user));
        }
        setupTokenExpirationCheck(data.token);
        return { success: true };
      } else {
        throw new Error("No token received from server");
      }
    } catch (err) {
      let errorMessage = "Google login failed";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        token,
        isLoading,
        register,
        login,
        loginWithGoogleToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
