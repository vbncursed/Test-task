import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import dotenv from "dotenv";
import {AuthRequest} from "../types/authRequest";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET не установлен в .env");
}


interface UserParams {
    id: string;
}

const validateRegistration = [
    body("firstName").notEmpty().withMessage("Имя обязательно"),
    body("lastName").notEmpty().withMessage("Фамилия обязательна"),
    body("login")
        .notEmpty().withMessage("Логин обязателен")
        .isAlphanumeric().withMessage("Логин должен содержать только буквы и цифры")
        .isLength({ min: 4 }).withMessage("Логин должен быть не короче 4 символов"),
    body("password")
        .isLength({ min: 8 }).withMessage("Пароль должен быть не менее 8 символов")
        .matches(/\d/).withMessage("Пароль должен содержать хотя бы одну цифру")
        .matches(/[A-Z]/).withMessage("Пароль должен содержать хотя бы одну заглавную букву")
        .matches(/[!@#$%^&*]/).withMessage("Пароль должен содержать хотя бы один спец. символ"),
];

// Регистрация пользователя
export const registerUser = async (req: Request, res: Response) => {
    try {
        // 🔍 Валидация входных данных
        await body("firstName").trim().notEmpty().withMessage("Имя обязательно").isAlpha("ru-RU").run(req);
        await body("lastName").trim().notEmpty().withMessage("Фамилия обязательна").isAlpha("ru-RU").run(req);
        await body("middleName").optional().trim().isAlpha("ru-RU").run(req);
        await body("login").trim().notEmpty().withMessage("Логин обязателен").isAlphanumeric().run(req);
        await body("password")
            .isLength({ min: 8 })
            .matches(/\d/)
            .matches(/[A-Z]/)
            .matches(/[!@#$%^&*]/)
            .run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, middleName, login, password, managerId } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ where: { login: { [Op.eq]: login } } });
        if (existingUser) {
            return res.status(400).json({ message: "Логин уже используется" });
        }

        // ✅ Создаем пользователя
        const newUser = await User.create({
            firstName,
            lastName,
            middleName: middleName || null,
            login,
            password: password,
            managerId: managerId ?? null,
        });

        // 🔑 Генерируем JWT-токен (добавляем firstName, lastName, middleName, как при логине)
        const token = jwt.sign(
            {
                userId: newUser.id,
                login: newUser.login,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                middleName: newUser.middleName ? newUser.middleName : "",
            },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(201).json({ message: "Регистрация успешна", token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Ошибка сервера" });
    }
};


// ✅ Полная SQL-защита при входе
export const loginUser = async (req: Request, res: Response) => {
    try {
        await body("login").trim().notEmpty().isAlphanumeric().run(req);
        await body("password").notEmpty().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { login, password } = req.body;

        // 🛡 Безопасный поиск пользователя
        const user = await User.findOne({ where: { login: { [Op.eq]: login } } });
        if (!user) {
            return res.status(400).json({ message: "Неверный логин или пароль" });
        }

        // 🔐 Проверка пароля
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Неверный логин или пароль" });
        }

        // 🔑 Генерация токена
        const token = jwt.sign(
            {
                userId: user.id,
                login: user.login,
                firstName: user.firstName, // ✅ Кодируем русские символы
                lastName: user.lastName,
                middleName: user.middleName ? user.middleName : "",
            },
            JWT_SECRET,
            { expiresIn: "24h" });

        return res.status(200).json({ message: "Вход выполнен", token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Ошибка сервера" });
    }
};

// Получение данных пользователя по userId
export const getUserById = async (
    req: Request<UserParams>,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await User.findOne({
            where: { id },
            attributes: ["id", "firstName", "lastName", "middleName", "login"], // ✅ Теперь отдаем `login`
        });

        if (!user) {
            res.status(404).json({ message: "❌ Пользователь не найден" });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Ошибка при получении пользователя:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

export const getSubordinates = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id; // ID текущего пользователя (руководителя)

        if (!userId) {
            res.status(401).json({ message: "Пользователь не авторизован" });
        }

        // Находим всех пользователей, у которых managerId = userId
        const subordinates = await User.findAll({
            where: { managerId: userId },
            attributes: ["id", "firstName", "lastName", "middleName", "login"], // Выбираем нужные поля
        });

        res.status(200).json(subordinates);
    } catch (error) {
        console.error("Ошибка при получении подчиненных:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// Функция для получения всех руководителей
export const getManagers = async (req: Request, res: Response) => {
    try {
        const managers = await User.findAll({
            where: { managerId: null }, // Выбираем только тех, у кого нет руководителя
            attributes: ["id", "firstName", "lastName", "middleName"], // Поля, которые возвращаем
        });

        res.status(200).json(managers);
    } catch (error) {
        console.error("Ошибка при получении руководителей:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

export { validateRegistration };
