import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import ScannerPage from "./components/ScannerPage";
import SearchByIdPage from "./components/SearchByIdPage";
import CreateNewPass from "./components/CreateNewPass";
import AnalyticsPage from "./components/AnalyticsPage";
import SecretRegister from "./components/SecretRegister";
import SecretPage from "./components/SecretPage";
import AdminRoute from "./admin/AdminWrapper";
import FreeEntryPage from "./components/FreeEntryPage";
import FreeMultiplePage from "./components/FreeMultiplePage";
import FreeAllPage from "./components/FreeAllPage"; 


function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isAdmin, setIsAdmin] = useState(JSON.parse(localStorage.getItem('isAdmin')) || false);

const handleLogin = (data) => {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('isAdmin', JSON.stringify(data.isAdmin));
    setAuthToken(data.token);
    setUsername(data.username);
    setIsAdmin(data.isAdmin);
};

const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
    setAuthToken(null);
    setIsAdmin(false);
    setUsername('');
};


  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={
            authToken ? (
              <Navigate to="/scan" />
            ) : (
              <LoginPage onLoginSuccess={handleLogin} />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/scan"
          element={
            authToken ? (
              <ScannerPage token={authToken} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/*admin routes start */}
        <Route
          path="/mrstm"
          element={
            <AdminRoute token={authToken} isAdmin={isAdmin}>
              <SecretPage token={authToken} onLogout={handleLogout} />
            </AdminRoute>
          }
        />

        <Route
          path="/mrstm/secret-register"
          element={
            <AdminRoute token={authToken} isAdmin={isAdmin}>
              <SecretRegister token={authToken} onLogout={handleLogout} />
            </AdminRoute>
          }
        />

        <Route
          path="/mrstm/free-entry"
          element={
            <AdminRoute token={authToken} isAdmin={isAdmin}>
              <FreeEntryPage token={authToken} onLogout={handleLogout} />
            </AdminRoute>
          }
        />

        <Route
          path="/mrstm/free-multiple-entries"
          element={
            <AdminRoute token={authToken} isAdmin={isAdmin}>
              <FreeMultiplePage token={authToken} onLogout={handleLogout} />
            </AdminRoute>
          }
        />

        <Route
          path="/mrstm/free-all-entries"
          element={
            <AdminRoute token={authToken} isAdmin={isAdmin}>
              <FreeAllPage token={authToken} onLogout={handleLogout} />
            </AdminRoute>
          }
        />


        {/*secret routes end */}

        <Route
          path="/search"
          element={
            authToken ? (
              <SearchByIdPage token={authToken} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/meraj/secret-pass-creation"
          element={
            authToken ? (
              <CreateNewPass token={authToken} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/analytics"
          element={
            authToken ? (
              <AnalyticsPage token={authToken} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
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
