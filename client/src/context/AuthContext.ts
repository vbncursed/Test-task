import { createContext } from "react";

export interface User {
    id: number;
    login: string;
    lastName: string;
    firstName: string;
    middleName?: string;
}

interface AuthContextType {
    user: User | null;
    loginUser: (credentials: { login: string; password: string }) => Promise<void>;
    logoutUser: () => void;  // Добавили сюда
}

export const AuthContext = createContext<AuthContextType | null>(null);
