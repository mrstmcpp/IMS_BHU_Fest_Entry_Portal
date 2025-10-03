import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import ScannerPage from './components/ScannerPage';
import SearchByIdPage from './components/SearchByIdPage';

function App() {
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

    const handleLogin = (token) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
    };

    return (
        <Router>
            <Routes>
                {/* Public route */}
                <Route
                    path="/login"
                    element={authToken ? <Navigate to="/scan" /> : <LoginPage onLoginSuccess={handleLogin} />}
                />

                {/* Protected routes */}
                <Route
                    path="/scan"
                    element={authToken ? <ScannerPage token={authToken} onLogout={handleLogout} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/search"
                    element={authToken ? <SearchByIdPage token={authToken} onLogout={handleLogout} /> : <Navigate to="/login" />}
                />

                {/* Default route */}
                <Route
                    path="/"
                    element={<Navigate to={authToken ? "/scan" : "/login"} />}
                />

                {/* Catch all */}
                <Route
                    path="*"
                    element={<Navigate to={authToken ? "/scan" : "/login"} />}
                />
            </Routes>
        </Router>
    );
}

export default App;
