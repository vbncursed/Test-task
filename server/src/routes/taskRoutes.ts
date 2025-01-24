import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware"; // Импортируем middleware
import { createTask, getTasks, updateTask } from "../controllers/taskController";

const router: Router = Router();

router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getTasks);
router.put("/:id", authMiddleware, updateTask);

export default router;
