import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.ts";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.scss";

const LoginPage = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null); // Теперь это состояние для ошибки
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    if (!authContext) {
        return <div>Ошибка загрузки контекста</div>;
    }

    const { loginUser } = authContext;

    const handleLogin: () => Promise<void> = async () => {
        setError(null); // Очистка предыдущей ошибки
        try {
            await loginUser({ login, password });
            navigate("/tasks"); // Перенаправление при успешном входе
        } catch (err: unknown) {  // Вместо `any` используем `unknown`
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Произошла неизвестная ошибка.");
            }
        }
    };


    return (
        <div className="login-container">
            {error && <Alert message={error} type="error" onClose={() => setError(null)} />}

            <div className="login-box">
                <h2>Вход</h2>
                <Input type="text" placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} />
                <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button text="Войти" onClick={handleLogin} />
                <p className="register-link">
                    Нет аккаунта?{" "}
                    <span onClick={() => navigate("/register")}>Зарегистрироваться</span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
