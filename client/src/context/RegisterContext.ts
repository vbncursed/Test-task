import { createContext } from "react";
import { RegisterUserData } from "./RegisterProvider.tsx";

// Определяем структуру данных, которые будут в контексте
export interface RegisterContextType {
    registerUser: (userData: RegisterUserData) => Promise<void>;
    loading: boolean;
    error: string | null;
}

// Создаем сам контекст с начальным значением `null`
export const RegisterContext = createContext<RegisterContextType | null>(null);
