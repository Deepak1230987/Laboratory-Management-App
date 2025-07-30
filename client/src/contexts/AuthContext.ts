import { createContext } from "react";
import type { User } from "../types";

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        name: string;
        email: string;
        password: string;
        role?: "admin" | "user";
    }) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);