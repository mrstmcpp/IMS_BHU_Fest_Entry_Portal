import React, { useState } from "react";
import axios from "axios";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";
import { useNavigate } from "react-router-dom";

// inside your component

const FreeAllPage = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const [secretCode, setSecretCode] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFreeAll = async (e) => {
    e.preventDefault();
    if (!secretCode) return;

    setIsLoading(true);
    setMessage("");

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/mrstm/freeAllEntries`,
        { secretCode },
        config
      );

      setMessage(
        `✅ ${response.data.message} (${response.data.modifiedCount} entries freed)`
      );
      setSecretCode("");
    } catch (err) {
      const msg = err.response?.data?.message || "Error freeing all entries.";
      setMessage(`❌ ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
        <Header />

        <h2 className="text-2xl font-bold text-gray-900">Free All Entries</h2>
        <p className="mt-1 text-sm text-gray-600">
          Enter the secret code to reset all scanned entries.
        </p>

        <form onSubmit={handleFreeAll} className="mt-4 space-y-4">
          <input
            type="password"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            placeholder="Enter secret code"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-teal-400 cursor-pointer"
          >
            {isLoading ? "Processing..." : "Free All Entries"}
          </button>
        </form>

        <button
          onClick={() => navigate("/mrstm")}
          className="mb-4 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 cursor-pointer"
        >
          ← Back to Admin Panel
        </button>
        {message && (
          <div
            className={`mt-4 p-4 text-center rounded-md ${
              message.startsWith("✅")
                ? "bg-teal-100 text-teal-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {message}
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default FreeAllPage;
