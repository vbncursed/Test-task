import api from "./index";

// 🔹 Регистрация
export const register = async (userData: {
    firstName: string;
    lastName: string;
    middleName?: string;
    login: string;
    password: string;
    managerId?: number;
}) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

// 🔹 Логин
export const login = async (credentials: { login: string; password: string }) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
};

// 🔹 Выход
export const logout = () => {
    localStorage.removeItem("token");
};
