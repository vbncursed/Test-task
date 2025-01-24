import sequelize from "./config/database";
import User from "./models/User";
import Task from "./models/Task";
import dotenv from "dotenv";

dotenv.config();

const initDB = async () => {
    try {
        console.log("🔄 Подключение к базе данных...");

        await sequelize.authenticate();
        console.log("✅ Подключение к SQLite успешно!");

        // Удаляем старые таблицы и создаем новые
        await sequelize.sync({ force: true });
        console.log("✅ База данных пересоздана!");

        // Создаем тестового пользователя с хешированным паролем
        const admin = await User.create({
            firstName: "Админ",
            lastName: "Админов",
            middleName: "Админович",
            login: "admin",
            password: "password123", // Этот пароль будет хеширован автоматически
        });

        console.log("✅ Создан пользователь:", {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            login: admin.login,
        });

        // Создаем тестовую задачу
        const task = await Task.create({
            title: "Тестовая задача",
            description: "Это тестовая задача.",
            dueDate: new Date().toISOString().split("T")[0],
            priority: "high",
            status: "todo",
            creatorId: admin.id,
            assigneeId: admin.id,
        });

        console.log("✅ Создана задача:", task.get({ plain: true }));

        console.log("🎉 Инициализация базы данных завершена!");
    } catch (error) {
        console.error("❌ Ошибка при инициализации базы данных:", error);
    } finally {
        await sequelize.close();
    }
};

initDB();
