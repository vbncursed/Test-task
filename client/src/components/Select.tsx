import "../styles/Select.scss"; // Подключаем стили

interface SelectProps<T> {
    label: string;
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
}

const Select = <T extends string | number>({ label, options, value, onChange }: SelectProps<T>) => {
    return (
        <div className="select-container">
            <label className="select-label">{label}</label>
            <select
                className="custom-select"
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;

