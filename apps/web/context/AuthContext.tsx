"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api, UserSession } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: UserSession | null;
  role: "citizen" | "field_worker" | "admin" | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role: "citizen" | "field_worker" | "admin") => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setDemoUser: (role: "citizen" | "field_worker" | "admin") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load initial session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = api.getUser();
      if (savedUser) {
        setUser(savedUser);
        // Validate with backend in background
        const res = await api.get("/auth/me");
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          api.setUser(res.data.user);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await api.post("/auth/login", { email, password });
    setIsLoading(false);

    if (res.success && res.data?.user && res.data?.tokens) {
      api.setTokens(res.data.tokens);
      api.setUser(res.data.user);
      setUser(res.data.user);
      return { success: true };
    }

    return {
      success: false,
      message: res.message || "Failed to log in. Please check credentials.",
    };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "citizen" | "field_worker" | "admin"
  ) => {
    setIsLoading(true);
    const res = await api.post("/auth/register", { name, email, password, role });
    setIsLoading(false);

    if (res.success && res.data?.user && res.data?.tokens) {
      api.setTokens(res.data.tokens);
      api.setUser(res.data.user);
      setUser(res.data.user);
      return { success: true };
    }

    return {
      success: false,
      message: res.message || "Registration failed. Please try again.",
    };
  };

  const logout = async () => {
    await api.post("/auth/logout", {});
    api.clearTokens();
    setUser(null);
    router.push("/login");
  };

  // Instant demo role switch for zero-friction exploration
  const setDemoUser = (demoRole: "citizen" | "field_worker" | "admin") => {
    const demoProfiles: Record<"citizen" | "field_worker" | "admin", UserSession> = {
      citizen: {
        id: "demo-citizen-id-01",
        name: "Jane Doe (Citizen)",
        email: "citizen@pawtrack.org",
        role: "citizen",
        createdAt: new Date().toISOString(),
      },
      field_worker: {
        id: "demo-field-id-02",
        name: "Officer Alex Rivera (Unit 402)",
        email: "officer.rivera@pawtrack.org",
        role: "field_worker",
        organization: "Northside Animal Care Unit",
        createdAt: new Date().toISOString(),
      },
      admin: {
        id: "demo-admin-id-03",
        name: "Dr. Sarah Chen (Chief Admin)",
        email: "admin@pawtrack.org",
        role: "admin",
        organization: "Municipal Animal Welfare Division",
        createdAt: new Date().toISOString(),
      },
    };

    const targetUser = demoProfiles[demoRole];
    setUser(targetUser);
    api.setUser(targetUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
