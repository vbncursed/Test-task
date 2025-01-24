import { useState, useEffect, useContext } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";
import RadioButton from "../components/RadioButton";
import Select from "../components/Select";
import { useNavigate } from "react-router-dom";
import { RegisterContext } from "../context/RegisterContext.ts";
import "../styles/RegisterPage.scss";
import axios from "axios";

const RegisterPage = () => {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("RegisterContext must be used within a RegisterProvider");
    }

    const { registerUser, loading, error } = context;
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("no_manager");
    const [manager, setManager] = useState<string | null>(null);
    const [managers, setManagers] = useState<{ id: number; name: string }[]>([]);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    // Загружаем список руководителей с сервера
    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL;
                const response = await axios.get<{ id: number; firstName: string; lastName: string; middleName?: string }[]>(
                    `${API_URL}/auth/managers`
                );

                setManagers(
                    response.data.map((m) => ({
                        id: m.id,
                        name: `${m.lastName} ${m.firstName} ${m.middleName || ""}`.trim(),
                    }))
                );
            } catch (error) {
                console.error("Ошибка загрузки списка руководителей:", error);
            }
        };

        if (role === "has_manager") {
            fetchManagers().catch((error) => console.error("Ошибка при загрузке руководителей:", error));
        }
    }, [role]);

    const validateName = (name: string, fieldName: string) => {
        const nameRegex = /^[A-Za-zА-Яа-яЁё]{3,}$/;
        if (!name.trim()) return `Поле "${fieldName}" обязательно`;
        if (!nameRegex.test(name)) return `Поле "${fieldName}" должно содержать только буквы и минимум 3 буквы`;
        return null;
    };

    const validate = () => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        const error = validateName(firstName, "Имя") ||
            validateName(lastName, "Фамилия") ||
            validateName(middleName, "Отчество");

        if (error) return error;
        if (!login.trim()) return "Логин обязателен";
        if (!/^[a-zA-Z0-9_-]{4,16}$/.test(login))
            return "Логин должен содержать от 4 до 16 символов (буквы, цифры, _ и -)";
        if (!passwordRegex.test(password))
            return "Пароль должен содержать минимум 8 символов, 1 заглавную букву, 1 цифру и 1 специальный символ";
        if (password !== confirmPassword)
            return "Пароли не совпадают";
        if (role === "has_manager" && !manager)
            return "Выберите руководителя";

        return null;
    };

    const handleRegister = async () => {
        const errorMessage = validate();
        if (errorMessage) {
            setSuccess(null);
            return;
        }

        try {
            await registerUser({
                firstName,
                lastName,
                middleName,
                login,
                password,
                managerId: role === "has_manager" ? Number(manager) : undefined,
            });

            setSuccess("✅ Регистрация успешна!");
            setTimeout(() => navigate("/tasks"), 2000);
        } catch (err) {
            console.error("Ошибка регистрации:", err);
        }
    };

    return (
        <div className="register-container">
            {error && <Alert message={error} type="error" onClose={() => {}} />}
            {success && <Alert message={success} type="success" onClose={() => setSuccess(null)} />}

            <div className="register-box">
                <h2>Регистрация</h2>
                <Input type="text" placeholder="Фамилия" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                <Input type="text" placeholder="Имя" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input type="text" placeholder="Отчество" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                <Input type="text" placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} />
                <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Input type="password" placeholder="Повторите пароль" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                <div className="radio-group">
                    <h4>Выберите роль:</h4>
                    <RadioButton label="Я руководитель" name="role" value="no_manager" checked={role === "no_manager"} onChange={setRole} />
                    <RadioButton label="Я подчиненный" name="role" value="has_manager" checked={role === "has_manager"} onChange={setRole} />
                </div>

                {role === "has_manager" && (
                    <Select
                        label="Выберите руководителя"
                        options={managers.map(manager => ({ value: manager.id.toString(), label: manager.name }))}
                        value={manager || ""}
                        onChange={setManager}
                    />
                )}

                <Button text={loading ? "Регистрация..." : "Зарегистрироваться"} onClick={handleRegister} disabled={loading} />

                <p className="login-link">
                    Уже есть аккаунт?{" "}
                    <span onClick={() => navigate("/login")}>Войти</span>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
