import api from "./index";

// 🔹 Получить все задачи
export const getTasks = async () => {
    const response = await api.get("/tasks");
    return response.data;
};

// 🔹 Создать задачу
export const createTask = async (taskData: {
    title: string;
    description?: string;
    dueDate: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "in_progress" | "done" | "canceled"; // Исправлено!
    assigneeId: number; // Исправлено на number
}) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
};
