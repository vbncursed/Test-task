import React from "react";

interface ButtonProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: "12px",
                backgroundColor: disabled ? "#555" : "#007BFF",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: "16px",
                width: "100%",
                transition: "0.3s",
                boxShadow: disabled ? "none" : "0px 4px 10px rgba(0, 123, 255, 0.3)",
                margin: "12px 0 0 0", // Делаем отступы такими же, как у Input
                display: "block",
            }}
        >
            {text}
        </button>
    );
};

export default Button;
