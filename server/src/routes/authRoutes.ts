import { Router, Request, Response, NextFunction } from "express";
import { registerUser,
    loginUser,
    validateRegistration,
    getManagers,
    getUserById,
    getSubordinates, } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = Router();

router.post(
    "/register",
    validateRegistration,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await registerUser(req, res);
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/login",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await loginUser(req, res);
        } catch (error) {
            next(error);
        }
    }
);

router.get("/managers", getManagers); // Новый маршрут
router.get("/users/:id", getUserById);
router.get("/subordinates", authMiddleware, getSubordinates);

export default router;
