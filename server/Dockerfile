# Используем официальный Node.js образ
FROM node:23.6.1

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json ./

# Устанавливаем **только production-зависимости**
RUN npm install --omit=dev

# Копируем файлы сборки сервера
COPY dist/ ./dist

# Копируем базу данных и `.env`
COPY database.sqlite /app/database.sqlite
COPY .env /app/.env

# Открываем порт сервера
EXPOSE 5001

# Запускаем сервер
CMD ["node", "./dist/server.js"]
