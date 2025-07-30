import React, { useEffect, useState } from "react";
import { authApi } from "../lib/auth";
import type { User } from "../types";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { user } = await authApi.verify();
          setUser(user);
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await authApi.login(email, password);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "user";
  }) => {
    const { user, token } = await authApi.register(data);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
