import React from "react";
import "../styles/RadioButton.scss"; // Импорт SCSS

interface RadioButtonProps {
    label: string;
    name: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ label, name, value, checked, onChange }) => {
    return (
        <label className="radio-button">
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={() => onChange(value)}
            />
            <span className="custom-radio" />
            {label}
        </label>
    );
};

export default RadioButton;
