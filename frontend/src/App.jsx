import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import ScannerPage from './components/ScannerPage';
import SearchByIdPage from './components/SearchByIdPage';
import CreateNewPass from './components/CreateNewPass';
import AnalyticsPage from './components/AnalyticsPage';
import SecretRegister from './components/SecretRegister';

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

                <Route
                    path="/mrstm/secret-register"
                    element={<SecretRegister />}
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

                <Route
                    path="/secretPassCreation"
                    element={authToken ? <CreateNewPass token={authToken} onLogout={handleLogout} /> : <Navigate to="/login" />}
                />

                <Route
                    path="/analytics"
                    element={authToken ? <AnalyticsPage token={authToken} onLogout={handleLogout} /> : <Navigate to="/login" />}
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
