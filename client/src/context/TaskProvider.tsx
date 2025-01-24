import { Task, TaskContext } from "./TaskContext";
import { ReactNode, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext.ts";

interface TaskProviderProps {
    children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [assignees, setAssignees] = useState<{ value: number; label: string; login: string }[]>([]);
    const API_URL = import.meta.env.VITE_API_URL;
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error("AuthContext must be used within an AuthProvider");
    }

    const { user } = authContext;

    // 🔹 Функция преобразования даты в "YYYY-MM-DD"
    const formatDate = (dateString: string): string => dateString.split("T")[0];

    // 🔹 Функция загрузки списка подчиненных и самого пользователя
    // Функция получения списка подчиненных
    // Функция получения списка подчиненных
    const fetchAssignees = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            // Запрашиваем список подчиненных (но логина там нет)
            const response = await axios.get<{ id: number; firstName: string; lastName: string; middleName?: string }[]>(
                `${API_URL}/auth/subordinates`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 🔥 Запрашиваем логины каждого пользователя по `id`
            const subordinatesWithLogin = await Promise.all(
                response.data.map(async (sub) => {
                    try {
                        const userResponse = await axios.get<{ login: string }>(
                            `${API_URL}/auth/users/${sub.id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        return {
                            value: sub.id,
                            label: `${sub.lastName} ${sub.firstName} ${sub.middleName || ""}`.trim(),
                            login: userResponse.data.login, // ✅ Теперь у нас есть логин
                        };
                    } catch (error) {
                        console.error(`❌ Ошибка загрузки логина для ID ${sub.id}:`, error);
                        return {
                            value: sub.id,
                            label: `${sub.lastName} ${sub.firstName} ${sub.middleName || ""}`.trim(),
                            login: "",
                        };
                    }
                })
            );

            // ✅ Добавляем текущего пользователя с его логином
            setAssignees([
                { value: user?.id || 0, label: "Я", login: user?.login || "" },
                ...subordinatesWithLogin,
            ]);

            console.log("🔍 Загружены assignees:", [{ value: user?.id || 0, label: "Я", login: user?.login || "" }, ...subordinatesWithLogin]);
        } catch (error) {
            console.error("❌ Ошибка загрузки подчиненных:", error);
        }
    };

    const fetchUserById = async (userId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Токен не найден");

            const response = await axios.get(`${API_URL}/auth/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return response.data; // { id, firstName, lastName, middleName, login }
        } catch (error) {
            console.error(`Ошибка загрузки пользователя ${userId}:`, error);
            return null;
        }
    };

    // 🔹 Функция загрузки задач с сервера
    const fetchTasks = async () => {
        if (!user) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Токен не найден");

            const response = await axios.get<Task[]>(`${API_URL}/tasks`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Полученные задачи:", response.data);

            // 🔹 Загружаем данные о создателе и ответственном
            const tasksWithNames = await Promise.all(
                response.data.map(async (task) => {
                    const creator = await fetchUserById(task.creatorId);
                    const assignee = await fetchUserById(task.assigneeId);

                    return {
                        ...task,
                        creatorName: creator ? `${creator.lastName} ${creator.firstName} ${creator.middleName || ""}`.trim() : "Неизвестный",
                        assigneeName: assignee ? `${assignee.lastName} ${assignee.firstName} ${assignee.middleName || ""}`.trim() : "Не назначен"
                    };
                })
            );

            setTasks(tasksWithNames);
        } catch (error) {
            console.error("Ошибка загрузки задач:", error);
        }
    };

    // 🔹 Функция обновления задачи
    const updateTask = async (updatedTask: Task) => {
        if (!updatedTask.id) {
            console.error("Ошибка: id задачи отсутствует!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Токен не найден");

            // 🔹 Находим логин ответственного перед отправкой
            const assignee = assignees.find((a) => a.value === updatedTask.assigneeId);
            if (!assignee) {
                throw new Error(`Ответственный с ID ${updatedTask.assigneeId} не найден`);
            }

            const formattedTask = {
                title: updatedTask.title.trim(),
                description: updatedTask.description.trim(),
                dueDate: formatDate(updatedTask.dueDate),
                priority: updatedTask.priority,
                status: updatedTask.status,
                assignee: assignee.login, // ✅ Отправляем логин ответственного
                updatedAt: new Date().toISOString(),
            };

            console.log("📤 Обновляем задачу на сервере:", JSON.stringify(formattedTask, null, 2));

            await axios.put(`${API_URL}/tasks/${updatedTask.id}`, formattedTask, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // ✅ После обновления загружаем свежие данные с сервера
            await fetchTasks();

            console.log("✅ Задача успешно обновлена!");
        } catch (error) {
            console.error("❌ Ошибка обновления задачи:", error);
        }
    };

    // 🔹 Функция создания новой задачи
    const createTask = async (newTask: Task) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Токен не найден");

            if (!user) throw new Error("Пользователь не найден в контексте");

            // 🔹 Проверяем, есть ли выбранный ответственный
            if (!newTask.assigneeId) {
                throw new Error("Не выбран ответственный исполнитель");
            }

            // 🔍 Находим логин пользователя по `assigneeId`
            const assignee = assignees.find(a => a.value === Number(newTask.assigneeId));
            console.log("🛠 Найден ответственный:", assignee); // <-- ДЕБАГ
            console.log("🔍 Ищем assigneeId:", newTask.assigneeId);
            console.log("📋 Доступные assignees:", assignees.map(a => ({ value: a.value, login: a.login })));


            if (!assignee) {
                throw new Error(`Выбранный ответственный с ID ${newTask.assigneeId} не найден`);
            }

            console.log("🔍 Ищем assigneeId:", newTask.assigneeId);
            console.log("📋 Доступные assignees:", assignees.map(a => ({ value: a.value, login: a.login })));


            // 🔹 Формируем объект запроса
            const formattedTask = {
                title: newTask.title.trim(),
                description: newTask.description.trim(),
                dueDate: newTask.dueDate,
                priority: newTask.priority,
                status: newTask.status,
                assignee: assignee.login, // ✅ Отправляем логин
            };

            console.log("📤 Отправляем задачу на сервер:", JSON.stringify(formattedTask, null, 2));

            console.log("🔍 Ищем assigneeId:", newTask.assigneeId);
            console.log("📋 Доступные assignees:", assignees.map(a => ({ value: a.value, login: a.login })));

            const response = await axios.post<Task>(`${API_URL}/tasks`, formattedTask, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTasks((prevTasks) => [...prevTasks, response.data]);

            console.log("✅ Задача успешно создана:", response.data);
            await fetchTasks();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("❌ Ошибка создания задачи:", error.response?.data || error.message);
            } else if (error instanceof Error) {
                console.error("❌ Ошибка:", error.message);
            } else {
                console.error("❌ Произошла неизвестная ошибка при создании задачи");
            }
        }
    };


    // 🔹 Загружаем задачи и подчиненных при первом рендере
    useEffect(() => {
        fetchTasks();
        fetchAssignees();
    }, [user]);

    return (
        <TaskContext.Provider value={{ tasks, fetchTasks, updateTask, createTask }}>
            {children}
        </TaskContext.Provider>
    );
};
