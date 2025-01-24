import React, { useState, useEffect, useContext } from "react";
import "../styles/TaskModal.scss";
import Select from "../components/Select"; // Используем твой кастомный Select
import { AuthContext } from "../context/AuthContext.ts";
import axios from "axios";
import { Task } from "../context/TaskContext";

interface TaskModalProps {
    task: Task | null;
    onClose: () => void;
    onSave: (task: Task) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave }) => {
    const isNew = !task;
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error("AuthContext must be used within an AuthProvider");
    }

    const { user } = authContext;
    const [assignees, setAssignees] = useState<{ value: number; label: string }[]>([]);

    // Функция форматирования даты для input[type="date"]
    const formatDateForInput = (dateString: string): string => dateString.split("T")[0];

    // Формируем начальное состояние
    const [formData, setFormData] = useState<Task>(
        task || {
            title: "",
            description: "",
            dueDate: formatDateForInput(new Date().toISOString()), // Форматируем дату
            createdAt: new Date().toISOString(), // Сохраняем в ISO-формате
            updatedAt: new Date().toISOString(),
            priority: "medium",
            status: "todo",
            creatorId: Number(user?.id) || 0, // Приводим к числу
            assigneeId: Number(user?.id) || 0,
        }
    );

    // Загружаем список подчиненных руководителя
    useEffect(() => {
        const fetchAssignees = async () => {
            if (!user?.id) return; // Проверяем, что пользователь авторизован

            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get<{ id: number; firstName: string; lastName: string; middleName?: string }[]>(
                    `${import.meta.env.VITE_API_URL}/auth/subordinates`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const subordinates = response.data.map((sub) => ({
                    value: Number(sub.id), // Приводим ID к числу
                    label: `${sub.lastName} ${sub.firstName} ${sub.middleName || ""}`.trim(),
                }));

                setAssignees([
                    { value: Number(user.id), label: "Я" }, // Текущий пользователь
                    ...subordinates,
                ]);
            } catch (error) {
                console.error("Ошибка загрузки подчиненных:", error);
            }
        };

        fetchAssignees();
    }, [user?.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (value: number) => {
        setFormData({ ...formData, assigneeId: value });
    };

    const handleSubmit = () => {
        const updatedTask: Task = {
            ...formData,
            id: formData.id ?? Date.now(),
            dueDate: formatDateForInput(formData.dueDate), // Оставляем формат "yyyy-MM-dd"
            updatedAt: new Date().toISOString(), // Сохраняем в ISO-формате
        };
        onSave(updatedTask);
        onClose(); // ✅ Закрываем модалку после сохранения
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-header">{isNew ? "Создать задачу" : "Редактирование задачи"}</h2>

                <label>Заголовок:</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} />

                <label>Описание:</label>
                <textarea name="description" value={formData.description} onChange={handleChange} />

                <label>Дата окончания:</label>
                <input
                    type="date"
                    name="dueDate"
                    value={formatDateForInput(formData.dueDate)} // Форматируем дату
                    onChange={handleChange}
                />

                <label>Приоритет:</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                </select>

                <label>Статус:</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="todo">К выполнению</option>
                    <option value="in_progress">Выполняется</option>
                    <option value="done">Выполнена</option>
                    <option value="canceled">Отменена</option>
                </select>

                <Select<number>
                    label="Выберите ответственного"
                    options={assignees}
                    value={formData.assigneeId}
                    onChange={handleSelectChange}
                />

                <div className="modal-buttons">
                    <button onClick={handleSubmit}>{isNew ? "Создать" : "Сохранить"}</button>
                    <button onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
