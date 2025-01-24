import { Response } from "express";
import Task from "../models/Task";
import User from "../models/User";
import { AuthRequest } from "../types/authRequest"; // Подключаем кастомный тип
import { Op } from "sequelize";
import { body, validationResult } from "express-validator";

// ✅ Полная SQL-защита при создании задач
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // 🔍 Валидация входных данных
        await body("title").trim().notEmpty().isString().escape().run(req);
        await body("description").trim().optional().isString().escape().run(req);
        await body("dueDate").notEmpty().isISO8601().run(req);
        await body("priority").notEmpty().isIn(["low", "medium", "high"]).run(req);
        await body("status").notEmpty().isIn(["todo", "in-progress", "done", "canceled"]).escape().run(req);
        await body("assignee").trim().notEmpty().isAlphanumeric().isLength({ min: 3, max: 20 }).run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { title, description, dueDate, priority, status, assignee } = req.body;

        // 🔐 Проверяем, что токен содержит `user`
        if (!req.user || !req.user.id) {
            res.status(403).json({ message: "Пользователь не авторизован" });
            return;
        }

        // 🛡 Безопасный поиск ответственного пользователя
        const assigneeUser = await User.findOne({ where: { login: { [Op.eq]: assignee } } });
        if (!assigneeUser) {
            res.status(400).json({ message: "Ответственный пользователь не найден" });
            return;
        }

        // ✅ Создание задачи с защитой от SQL-инъекций
        const newTask = await Task.create({
            title,
            description,
            dueDate,
            priority,
            status,
            creatorId: req.user.id, // Из токена
            assigneeId: assigneeUser.id,
        });

        res.status(201).json({ message: "Задача создана", task: newTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // 🔍 Валидация входных данных
        await body("title").trim().notEmpty().isString().escape().run(req);
        await body("description").trim().optional().isString().escape().run(req);
        await body("dueDate").notEmpty().isISO8601().run(req);
        await body("priority").notEmpty().isIn(["low", "medium", "high"]).run(req);
        await body("status").notEmpty().isIn(["todo", "in-progress", "done", "canceled"]).escape().run(req);
        await body("assignee").trim().notEmpty().isAlphanumeric().isLength({ min: 3, max: 20 }).run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = req.params;
        const { title, description, dueDate, priority, status, assignee } = req.body;

        // 🔐 Проверяем, что токен содержит `user`
        if (!req.user || !req.user.id) {
            res.status(403).json({ message: "Пользователь не авторизован" });
            return;
        }

        // 📌 Проверяем, существует ли задача
        const task = await Task.findByPk(id);
        if (!task) {
            res.status(404).json({ message: "Задача не найдена" });
            return;
        }

        // 🛡 Находим пользователя по логину (аналогично createTask)
        const assigneeUser = await User.findOne({ where: { login: { [Op.eq]: assignee } } });
        if (!assigneeUser) {
            res.status(400).json({ message: "Ответственный пользователь не найден" });
            return;
        }

        // ✅ Обновляем задачу
        task.title = title;
        task.description = description;
        task.dueDate = dueDate;
        task.priority = priority;
        task.status = status;
        task.assigneeId = assigneeUser.id;

        await task.save();

        res.status(200).json({ message: "Задача обновлена", task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 📌 Получить все задачи (только для авторизованных)
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(403).json({ message: "Нет доступа" });
            return;
        }

        // 🛡️ Если обычный пользователь, то только свои или те, где он исполнитель
        const tasks = await Task.findAll({
            where: {
                [Op.or]: [{ creatorId: req.user.id }, { assigneeId: req.user.id }]
            }
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error("Ошибка при получении задач:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};
