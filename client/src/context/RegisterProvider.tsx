import { RegisterContext, RegisterContextType } from "./RegisterContext.ts";
import { ReactNode, useState } from "react";
import { register as apiRegister } from "../api/auth"; // API-функция для запроса на бэкенд
import { useNavigate } from "react-router-dom";

// Интерфейс для пропсов провайдера
interface RegisterProviderProps {
    children: ReactNode;
}

// Определяем тип данных пользователя для регистрации
export interface RegisterUserData {
    firstName: string;
    lastName: string;
    middleName?: string;
    login: string;
    password: string;
    managerId?: number | null;
}

export const RegisterProvider = ({ children }: RegisterProviderProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Функция для регистрации нового пользователя
    const registerUser = async (userData: RegisterUserData) => {
        setLoading(true);
        setError(null);

        try {
            // Приводим managerId: если null, то заменяем на undefined
            const preparedUserData = {
                ...userData,
                managerId: userData.managerId ?? undefined, // Заменяем `null` на `undefined`
            };

            const response = await apiRegister(preparedUserData); // Отправляем запрос на бэкенд

            if (!response || !response.token) {
                throw new Error("Некорректный ответ сервера");
            }

            // Сохраняем токен
            localStorage.setItem("token", response.token);

            // Сохраняем ФИО в localStorage в формате "Фамилия Имя Отчество"
            const fullName = `${userData.lastName} ${userData.firstName} ${userData.middleName || ""}`.trim();
            localStorage.setItem("currentUser", fullName);

            navigate("/tasks"); // Перенаправляем пользователя
        } catch (err: unknown) {
            console.error("Ошибка регистрации:", err);
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        } finally {
            setLoading(false);
        }
    };

    // Создаем объект контекста
    const contextValue: RegisterContextType = { registerUser, loading, error };

    return (
        <RegisterContext.Provider value={contextValue}>
            {children}
        </RegisterContext.Provider>
    );
};
