import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TaskPage from "./pages/TaskPage";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthProvider";
import {RegisterProvider} from "./context/RegisterProvider.tsx";  // 👈 Провайдер импортирован
import { TaskProvider } from "./context/TaskProvider.tsx";

function App() {
    return (
        <Router>
            <AuthProvider> {/* 👈 Теперь AuthProvider внутри Router */}
                <RegisterProvider>
                    <TaskProvider>
                        <Routes>
                            {/* Начальная страница - редирект на регистрацию */}
                            <Route path="/" element={<Navigate to="/register" />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/login" element={<LoginPage />} />

                            {/* Защищенный маршрут для /tasks */}
                            <Route element={<PrivateRoute />}>
                                <Route path="/tasks" element={<TaskPage />} />
                            </Route>
                        </Routes>
                    </TaskProvider>
                </RegisterProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
