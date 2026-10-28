import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
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
import SettingsPage from "./components/SettingsPage";
import ActiveUsersPage from "./components/ActiveUsersPage";
import ChooseVersionPage from "./shared/ChooseVersionPage";
import { startActivityTracking } from "./shared/activity";
import V2Layout from "./v2/Layout";
import LoginV2 from "./v2/LoginV2";
import ScanV2 from "./v2/ScanV2";
import StatsV2 from "./v2/StatsV2";
import AdminV2 from "./v2/AdminV2";
import AddScannerV2 from "./v2/AddScannerV2";
import CreatePassV2 from "./v2/CreatePassV2";
import ResetEntriesV2 from "./v2/ResetEntriesV2";
import SettingsV2 from "./v2/SettingsV2";

const API = import.meta.env.VITE_BACKEND_URL;

// The design last used on this device (also decides which login screen to show)
const readStoredVersion = () => {
  const v = Number(localStorage.getItem("uiVersion"));
  return v === 1 || v === 2 ? v : null;
};


function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isAdmin, setIsAdmin] = useState(JSON.parse(localStorage.getItem('isAdmin')) || false);
  // undefined = not known yet (waiting for /auth/me), null = never chosen (show prompt), 1 | 2 = chosen design
  const [uiVersion, setUiVersion] = useState(() =>
    localStorage.getItem("authToken") ? readStoredVersion() ?? undefined : readStoredVersion()
  );

const applyVersion = (v) => {
    setUiVersion(v);
    if (v) localStorage.setItem("uiVersion", String(v));
};

const handleLogin = (data) => {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('isAdmin', JSON.stringify(data.isAdmin));
    setAuthToken(data.token);
    setUsername(data.username);
    setIsAdmin(data.isAdmin);
    // The classic login page doesn't pass uiVersion on; /auth/me fills it in
    if (data.uiVersion === undefined) setUiVersion(undefined);
    else applyVersion(data.uiVersion);
};

const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
    setAuthToken(null);
    setIsAdmin(false);
    setUsername('');
    setUiVersion(readStoredVersion());
}, []);

  // Refresh profile + design choice from the server; drop sessions whose token has expired
  useEffect(() => {
    if (!authToken) return undefined;
    let cancelled = false;
    axios
      .get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(({ data }) => {
        if (cancelled) return;
        setUsername(data.username);
        setIsAdmin(data.isAdmin);
        localStorage.setItem('username', data.username);
        localStorage.setItem('isAdmin', JSON.stringify(data.isAdmin));
        applyVersion(data.uiVersion);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 401) handleLogout();
        // Offline / server down: keep going with this device's last design instead of blocking
        else setUiVersion((v) => (v === undefined ? readStoredVersion() ?? 1 : v));
      });
    return () => {
      cancelled = true;
    };
  }, [authToken, handleLogout]);

  useEffect(() => (authToken ? startActivityTracking(authToken) : undefined), [authToken]);

  useEffect(() => {
    const onExpired = () => {
      sessionStorage.setItem("sessionExpired", "1");
      handleLogout();
    };
    window.addEventListener("session-expired", onExpired);
    return () => window.removeEventListener("session-expired", onExpired);
  }, [handleLogout]);

  // Saves to the account first; throws if the server can't be reached
  const changeVersion = async (v) => {
    await axios.put(`${API}/auth/preferences`, { uiVersion: v }, { headers: { Authorization: `Bearer ${authToken}` } });
    applyVersion(v);
  };

  if (authToken && uiVersion === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (authToken && uiVersion === null) {
    return (
      <ChooseVersionPage
        username={username}
        onChoose={changeVersion}
        onChooseLocally={applyVersion}
        onLogout={handleLogout}
      />
    );
  }

  const isV2 = uiVersion === 2;
  const requireAuth = (element) => (authToken ? element : <Navigate to="/login" />);
  const adminOnly = (element) => (
    <AdminRoute token={authToken} isAdmin={isAdmin}>
      {element}
    </AdminRoute>
  );

  const v2Routes = (
    <Route element={requireAuth(<V2Layout username={username} isAdmin={isAdmin} onLogout={handleLogout} />)}>
      <Route path="/scan" element={<ScanV2 />} />
      <Route path="/search" element={<ScanV2 initialMode="manual" />} />
      <Route path="/analytics" element={<StatsV2 />} />
      <Route
        path="/settings"
        element={
          <SettingsV2
            username={username}
            isAdmin={isAdmin}
            uiVersion={uiVersion}
            onChangeVersion={changeVersion}
            onLogout={handleLogout}
          />
        }
      />
      <Route path="/meraj/secret-pass-creation" element={<CreatePassV2 />} />
      <Route path="/mrstm" element={adminOnly(<AdminV2 />)} />
      <Route path="/mrstm/active-users" element={adminOnly(<AdminV2 section="team" />)} />
      <Route path="/mrstm/secret-register" element={adminOnly(<AddScannerV2 />)} />
      <Route path="/mrstm/free-entry" element={adminOnly(<ResetEntriesV2 focus="one" />)} />
      <Route path="/mrstm/free-multiple-entries" element={adminOnly(<ResetEntriesV2 focus="multiple" />)} />
      <Route path="/mrstm/free-all-entries" element={adminOnly(<ResetEntriesV2 focus="all" />)} />
    </Route>
  );

  const v1Routes = (
    <>
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

        <Route
          path="/mrstm/active-users"
          element={
            <AdminRoute token={authToken} isAdmin={isAdmin}>
              <ActiveUsersPage token={authToken} onLogout={handleLogout} />
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

        <Route
          path="/settings"
          element={requireAuth(
            <SettingsPage uiVersion={uiVersion} onChangeVersion={changeVersion} onLogout={handleLogout} />
          )}
        />
    </>
  );


  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={
            authToken ? (
              <Navigate to="/scan" />
            ) : isV2 ? (
              <LoginV2 onLoginSuccess={handleLogin} />
            ) : (
              <LoginPage onLoginSuccess={handleLogin} />
            )
          }
        />

        {isV2 ? v2Routes : v1Routes}

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
