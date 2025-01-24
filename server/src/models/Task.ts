import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

class Task extends Model {
    public id!: number;
    public title!: string;
    public description!: string;
    public dueDate!: Date;
    public createdAt!: Date;
    public updatedAt!: Date;
    public priority!: "high" | "medium" | "low";
    public status!: "todo" | "in_progress" | "done" | "canceled";
    public creatorId!: number;
    public assigneeId!: number;
}

Task.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        priority: {
            type: DataTypes.ENUM("high", "medium", "low"),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("todo", "in_progress", "done", "canceled"),
            allowNull: false,
        },
        creatorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        assigneeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
    },
    {
        sequelize,
        tableName: "tasks",
    }
);

// Устанавливаем связи
Task.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Task.belongsTo(User, { foreignKey: "assigneeId", as: "assignee" });

export default Task;
