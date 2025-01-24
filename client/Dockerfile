# Используем официальный образ Nginx
FROM nginx:latest

# Удаляем дефолтные конфиги Nginx и добавляем свой
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем билд фронтенда в папку Nginx
COPY dist/ /usr/share/nginx/html

# Открываем порт для клиента
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
