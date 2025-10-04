import React, { useState } from "react";
import axios from "axios";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        {
          username,
          password,
        }
      );

      if (response.data && response.data.token) {
        const { username, token, isAdmin } = response.data;

        localStorage.setItem("authToken", token);
        localStorage.setItem("username", username);
        localStorage.setItem("isAdmin", JSON.stringify(isAdmin));

        onLoginSuccess({ username, token, isAdmin });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Scanner Authorization
          </h2>
          <p className="mt-1 text-sm text-gray-600">Please log in to continue</p>

          <form className="space-y-6 mt-4" onSubmit={handleLogin}>
            <div className="text-left">
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="username"
                required
              />
            </div>
            <div className="text-left">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-center text-rose-600">{error}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 text-sm font-medium cursor-pointer text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>
      <Footer />
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
