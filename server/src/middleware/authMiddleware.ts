import { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET не задан в .env");
}

export interface AuthRequest extends Request {
    user?: { id: number; login: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Нет токена, авторизация запрещена" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; login: string };
        req.user = { id: decoded.userId, login: decoded.login };
        next(); // ✅ Теперь middleware не возвращает `Response`, а просто вызывает `next()`
    } catch (error) {
        res.status(401).json({ message: "Неверный или истекший токен" });
    }
};

