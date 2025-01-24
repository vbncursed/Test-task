import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DB_NAME || "./database.sqlite",
    logging: false, // Убираем логи SQL-запросов
});

export default sequelize;
