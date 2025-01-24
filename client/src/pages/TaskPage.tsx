import { useContext, useState } from "react";
import { TaskContext, Task } from "../context/TaskContext";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import Select from "../components/Select";
import "../styles/TaskPage.scss";
import { AuthContext } from "../context/AuthContext.ts";

const TaskPage = () => {
    const taskContext = useContext(TaskContext);
    if (!taskContext) {
        throw new Error("TaskContext must be used within a TaskProvider");
    }

    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error("AuthContext must be used within an AuthProvider");
    }
    const { user } = authContext;

    const { tasks, createTask, updateTask } = taskContext;
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [viewMode, setViewMode] = useState<"all" | "date" | "assignee">("all");

    const groupTasksByDate = (task: Task): "today" | "thisWeek" | "future" | "overdue" => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();

        // Приводим даты к одному формату (убираем время)
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "today";
        if (diffDays > 0 && diffDays <= 7) return "thisWeek";
        if (diffDays > 7) return "future";
        return "overdue"; // Если дата в прошлом
    };

    const groupTasksByAssignee = (tasks: Task[]): Record<string, Task[]> => {
        return tasks.reduce((acc, task) => {
            const assignee = task.assigneeName || "Не назначен"; // Если нет ответственного, подписываем "Не назначен"

            if (!acc[assignee]) {
                acc[assignee] = [];
            }

            acc[assignee].push(task);
            return acc;
        }, {} as Record<string, Task[]>);
    };

    return (
        <div className="task-page">
            <h2>ЗАДАЧИ</h2>
            <div className="task-controls">
                <Select
                    label="Режим отображения"
                    options={[
                        { value: "all", label: "Все задачи" },
                        { value: "date", label: "Группировать по дате" },
                        { value: "assignee", label: "Группировать по ответственным" },
                    ]}
                    value={viewMode} // 👈 Передаем режим сортировки
                    onChange={(value) => setViewMode(value as "all" | "date" | "assignee")}
                />
                <button className="create-task-button" onClick={() => setIsCreating(true)}>
                    Новая задача
                </button>
            </div>

            <div className="task-list">
                {viewMode === "all" && (
                    <>
                        {["todo", "in_progress", "done", "canceled"].map((status) => {
                            const filteredTasks = tasks.filter((task) => task.status === status);

                            if (filteredTasks.length === 0) return null; // Пропускаем пустые статусы

                            return (
                                <div key={status} className="task-group">
                                    <h3>
                                        {status === "todo"
                                            ? "🔥 Надо сделать"
                                            : status === "in_progress"
                                                ? "⚡ В процессе выполнения"
                                                : status === "done"
                                                    ? "✅ Выполнено"
                                                    : "✨ Отменено"}
                                    </h3>
                                    {filteredTasks.map((task) => (
                                        <TaskCard key={task.id ?? `temp-${task.title}-${Date.now()}`} task={task} onClick={() => setSelectedTask(task)} />
                                    ))}
                                </div>
                            );
                        })}
                    </>
                )}

                {viewMode === "date" &&
                    (["today", "thisWeek", "future", "overdue"] as const).map((group) => (
                        <div key={group} className="task-group">
                            <h3>
                                {group === "today"
                                    ? "Сегодня"
                                    : group === "thisWeek"
                                        ? "На этой неделе"
                                        : group === "future"
                                            ? "Будущее"
                                            : "Просроченные"}
                            </h3>
                            {tasks.filter((task) => groupTasksByDate(task) === group).map((task) => (
                                <TaskCard key={task.id ?? `temp-${task.title}-${Date.now()}`} task={task} onClick={() => setSelectedTask(task)} />
                            ))}
                        </div>
                    ))}

                {viewMode === "assignee" &&
                    Object.entries(groupTasksByAssignee(tasks)).map(([assignee, assigneeTasks]) => (
                        <div key={assignee} className="task-group">
                            <h3>{assignee}</h3>
                            {assigneeTasks.map((task) => (
                                <TaskCard key={task.id ?? `temp-${task.title}-${Date.now()}`} task={task} onClick={() => setSelectedTask(task)} />
                            ))}
                        </div>
                    ))}
            </div>

            {(selectedTask || isCreating) && (
                <TaskModal
                    task={selectedTask || {
                        title: "",
                        description: "",
                        priority: "medium",
                        status: "todo",
                        assigneeId: user ? user.id : 0, // ID вместо строки
                        dueDate: new Date().toISOString().split("T")[0],
                        createdAt: new Date().toISOString().split("T")[0],
                        updatedAt: new Date().toISOString().split("T")[0],
                        creatorId: user ? user.id : 0 // Используем user.id вместо строки
                    }}
                    onClose={() => {
                        setSelectedTask(null);
                        setIsCreating(false);
                    }}
                    onSave={isCreating ? createTask : updateTask}
                />

            )}
        </div>
    );
};

export default TaskPage;
