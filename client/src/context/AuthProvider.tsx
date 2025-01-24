import { ReactNode, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.ts";
import { login as apiLogin, logout as apiLogout } from "../api/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User } from "./AuthContext.ts";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    // ✅ Функция безопасного декодирования JWT (Base64Url -> Base64)
    const decodeJWT = (token: string) => {
        try {
            const parts = token.split(".");
            if (parts.length !== 3) {
                console.error("❌ Ошибка: Токен невалидный!", token);
                return null;
            }

            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Преобразуем в Base64

            const decoded = JSON.parse(atob(base64));
            console.log("🔹 Раскодированные данные из токена:", decoded);

            return decoded;
        } catch (error) {
            console.error("❌ Ошибка при декодировании токена:", error);
            return null;
        }
    };

    // ✅ Функция загрузки данных пользователя по userId
    const fetchUserData = async (userId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await axios.get<User>(`${API_URL}/auth/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data) {
                setUser(response.data);
                localStorage.setItem(
                    "currentUser",
                    `${response.data.lastName} ${response.data.firstName} ${response.data.middleName || ""}`.trim()
                );
            }
        } catch (error) {
            console.error("❌ Ошибка загрузки данных пользователя:", error);
            logoutUser();
        }
    };

    // ✅ Проверяем токен при загрузке страницы
    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("🔹 Токен из localStorage:", token);

        if (token) {
            const decoded = decodeJWT(token);
            if (decoded?.userId) {
                fetchUserData(decoded.userId);
            } else {
                logoutUser();
            }
        }
    }, []);

    // ✅ Функция логина
    const loginUser = async ({ login, password }: { login: string; password: string }) => {
        try {
            const response = await apiLogin({ login, password });

            if (!response || !response.token) {
                throw new Error("❌ Неверный логин или пароль");
            }

            localStorage.setItem("token", response.token);

            const decoded = decodeJWT(response.token);
            if (decoded?.userId) {
                fetchUserData(decoded.userId);
            } else {
                logoutUser();
                throw new Error("Ошибка токена. Попробуйте снова.");
            }

            navigate("/tasks");
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Ошибка входа");
        }
    };

    // ✅ Функция выхода
    const logoutUser = () => {
        apiLogout();
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
