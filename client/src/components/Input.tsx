import React from "react";

interface InputProps {
    type?: "text" | "password" | "email";
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({ type = "text", placeholder, value, onChange }) => {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={{
                padding: "12px",
                margin: "12px 0 0 0",
                border: "1px solid #ccc",
                borderRadius: "8px",
                width: "100%",
                fontSize: "16px",
                backgroundColor: "#222",
                color: "#fff",
                outline: "none",
            }}
        />
    );
};

export default Input;
