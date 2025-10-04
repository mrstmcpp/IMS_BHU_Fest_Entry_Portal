import React, { useState } from "react";
import axios from "axios";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";
import { useNavigate } from "react-router-dom";

const SecretRegister = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/mrstm/secretRegister`,
        {
          username,
          password,
        }
      );

      if (response.data?.success) {
        setMessage("✅ Account created successfully!");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage(response.data?.message || "Registration failed.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Registration failed. Try again.";
      setMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
        {/* Header */}
        <Header />

        <h2 className="text-2xl font-bold text-gray-900">Secret Registration</h2>
        <p className="mt-1 text-sm text-gray-600">
          Create a new account (restricted access)
        </p>

        <form className="space-y-6 mt-4" onSubmit={handleRegister}>
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

          <div className="text-left">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="confirm password"
              required
            />
          </div>

          {message && (
            <p
              className={`text-sm text-center ${
                message.includes("success")
                  ? "text-green-600"
                  : "text-rose-600"
              }`}
            >
              {message}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm font-medium cursor-pointer text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
            <button
          onClick={() => navigate("/mrstm")}
          className="mb-4 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 cursor-pointer"
        >
          ← Back to Admin Panel
        </button>
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default SecretRegister;
