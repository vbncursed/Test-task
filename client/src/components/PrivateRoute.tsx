import { useState, useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Alert from "./Alert";

const PrivateRoute = () => {
    const isAuthenticated = !!localStorage.getItem("token");
    const [showAlert, setShowAlert] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const logRef = useRef(false); // Флаг, чтобы лог вызывался один раз

    useEffect(() => {
        if (!isAuthenticated && !logRef.current) {
            console.log("❌ Пользователь не авторизован!");
            logRef.current = true; // Запоминаем, что лог уже был
            setShowAlert(true);

            setTimeout(() => {
                setShowAlert(false);
                setRedirect(true);
            }, 3000);
        }
    }, [isAuthenticated]);

    if (redirect) {
        return <Navigate to="/" replace />;
    }

    if (!isAuthenticated) {
        return (
            <>
                {showAlert && <Alert message="Извините, неавторизованному пользователю нельзя на эту страницу" onClose={() => setShowAlert(false)} />}
            </>
        );
    }

    return <Outlet />;
};

export default PrivateRoute;
