import axios from "axios";

// 🔧 Базовый конфиг axios
const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔒 Автоматически подставляем токен в заголовки
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // Получаем токен
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("🔹 Request Headers:", config.headers); // Проверяем, добавляется ли токен
    return config;
});


export default api;
