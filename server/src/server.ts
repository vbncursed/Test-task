import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import sequelize from "./config/database";
import cors from "cors"; // 👈 Добавляем CORS
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// 🔹 Разрешаем CORS для всех источников (можно настроить точечно)
app.use(cors({
    origin: "*",  // Разрешаем запросы с любого источника
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());

// Подключение маршрутов
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Подключено к базе данных!");

        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Ошибка при подключении к БД:", error);
    }
};

startServer().then(r => null);
