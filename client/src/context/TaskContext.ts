import { createContext } from "react";

export interface Task {
    id?: number;
    title: string;
    description: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    priority: "high" | "medium" | "low";
    status: "todo" | "in_progress" | "done" | "canceled";
    creatorId: number; // Храним ID создателя
    assigneeId: number; // Храним ID ответственного
    creatorName?: string; // Подменяем ID на имя создателя
    assigneeName?: string; // Подменяем ID на имя ответственного
}

export interface TaskContextType {
    tasks: Task[];
    fetchTasks: () => Promise<void>;
    createTask: (task: Task) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
}

export const TaskContext = createContext<TaskContextType | null>(null);
