import React from "react";

interface AlertProps {
    message: string;
    type?: "error" | "success" | "warning"; // Типы алерта
    onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type = "error", onClose }) => {
    const alertStyles = {
        error: { background: "#ff4d4d", color: "#fff" }, // Красный (ошибка)
        success: { background: "#4CAF50", color: "#fff" }, // Зеленый (успех)
        warning: { background: "#ffcc00", color: "#000" }, // Желтый (предупреждение)
    };

    return (
        <div style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minWidth: "250px",
            ...alertStyles[type], // Подставляем нужный стиль
        }}>
            {message}
            <button
                onClick={onClose}
                style={{
                    marginLeft: "10px",
                    background: "none",
                    border: "none",
                    color: "#fff",
                    fontSize: "18px",
                    cursor: "pointer",
                }}
            >
                ✖
            </button>
        </div>
    );
};

export default Alert;
