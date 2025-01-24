# todo list app

todo list app - это полнофункциональное веб-приложение для управления задачами. Оно включает **клиентскую** часть на **React + TypeScript** и **серверную** часть на **Node.js (Express) + база данных**.

## 📂 Структура проекта

```
todo-list-app/
│── client/        # Фронтенд (React + TypeScript)
│── server/        # Бэкенд (Node.js + Express)
│── docker-compose.yml  # Конфигурация Docker
│── README.md      # Документация проекта
```

## 🚀 Функционал
- Регистрация и авторизация пользователей (JWT)
- CRUD-операции для задач (создание, редактирование)
- Фильтрация и сортировка задач
- Хранение задач в базе данных (SQLite/PostgreSQL)
- Docker-контейнеризация для удобного деплоя

---
## 🔧 Установка и запуск

### 1️⃣ Клонирование репозитория
```bash
git https://github.com/vbncursed/Test-task.git
cd Test-task
```

### 2️⃣ Запуск с помощью Docker (Рекомендуемый способ)
```bash
docker-compose up --build
```

### 3️⃣ Запуск вручную (локальная установка)

#### **Сервер** (Node.js + Express)
```bash
cd server
npm install
npm run dev
```

#### **Клиент** (React + Vite + TypeScript)
```bash
cd client
npm install
npm run dev
```

После запуска сервер работает на **`http://localhost:5001`**, а клиент - на **`http://localhost:3000`**.

---
## ⚙️ Переменные окружения
Создай `.env` файлы в **client/** и **server/**.

### **Server/.env:**
```plaintext
PORT=5001
JWT_SECRET=your_secret_key
DATABASE_URL=your_database_url
```

### **Client/.env:**
```plaintext
VITE_API_URL=http://localhost:5001
```

---
## 📌 API Эндпоинты
### **Аутентификация**
| Метод  | Эндпоинт         | Описание          |
|--------|----------------|------------------|
| POST   | `/auth/register` | Регистрация      |
| POST   | `/auth/login`    | Логин            |

### **Задачи (CRUD)**
| Метод  | Эндпоинт       | Описание              |
|--------|--------------|----------------------|
| GET    | `/tasks`      | Получить все задачи  |
| POST   | `/tasks`      | Создать новую задачу |
| PUT    | `/tasks/:id`  | Обновить задачу      |

---
## 🛠️ Технологии
**Фронтенд:** React, TypeScript, Vite 
**Бэкенд:** Node.js, Express, JWT, SQLite/PostgreSQL  
**Инструменты:** Docker, ESLint, Prettier

---
## 📝 Авторы
- **[Эдуард](https://github.com/vbncursed)**

---
## 🔗 Лицензия
Этот проект лицензируется под MIT License.

