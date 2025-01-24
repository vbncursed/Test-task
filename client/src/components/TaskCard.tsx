import React from "react";
import "../styles/TaskCard.scss";
import { Task } from "../context/TaskContext";

interface TaskCardProps {
    task: Task;
    onClick: () => void;
}

const priorityColors: Record<string, string> = {
    high: "red",
    medium: "orange",
    low: "green",
};

const statusLabels: Record<string, string> = {
    todo: "К выполнению",
    in_progress: "Выполняется",
    done: "Выполнена",
    canceled: "Отменена",
};

const priorityLabels: Record<string, string> = {
    high: "Высокий",
    medium: "Средний",
    low: "Низкий",
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
    return (
        <div className="task-card" onClick={onClick}>
            <h3 style={{ color: priorityColors[task.priority] }}>{task.title}</h3>
            <p><strong>Описание:</strong> {task.description}</p>
            <p><strong>Срок:</strong> {new Date(task.dueDate).toLocaleDateString("ru-RU")}</p>
            <p><strong>Создано:</strong> {new Date(task.createdAt).toLocaleDateString("ru-RU")}</p>
            <p><strong>Обновлено:</strong> {new Date(task.updatedAt).toLocaleDateString("ru-RU")}</p>
            <p><strong>Приоритет:</strong> {priorityLabels[task.priority]}</p>
            <p><strong>Статус:</strong> {statusLabels[task.status]}</p>
            <p><strong>Создатель:</strong> {task.creatorName}</p>  {/* 👈 Здесь теперь ФИО */}
            <p><strong>Ответственный:</strong> {task.assigneeName}</p>  {/* 👈 Здесь теперь ФИО */}
        </div>
    );
};

export default TaskCard;
