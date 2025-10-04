import React, { useState } from "react";
import axios from "axios";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";
import { useNavigate } from "react-router-dom";

const FreeEntryPage = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const [elixirId, setElixirId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFreeEntry = async (e) => {
    e.preventDefault();
    if (!elixirId) return;

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
        `${import.meta.env.VITE_BACKEND_URL}/mrstm/freeEntry`,
        { elixirPassId: elixirId },
        config
      );

      setMessage(response.data.message);
      setElixirId("");
    } catch (err) {
      const msg = err.response?.data?.message || "Error freeing entry.";
      setMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onLogout={onLogout} />

      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900">Free Single Entry</h2>
          <p className="mt-1 text-sm text-gray-600">
            Enter the Elixir Pass ID to reset its scan
          </p>

          <form onSubmit={handleFreeEntry} className="mt-4 space-y-4">
            <input
              type="text"
              value={elixirId}
              onChange={(e) => setElixirId(e.target.value)}
              placeholder="Enter Elixir Pass ID"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-teal-400 cursor-pointer"
            >
              {isLoading ? "Processing..." : "Free Entry"}
            </button>
          </form>

          <button
            onClick={() => navigate("/mrstm")}
            className="mb-4 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 cursor-pointer"
          >
            ← Back to Admin Panel
          </button>

          {message && (
            <div className="mt-4 p-4 text-center text-white bg-teal-600 rounded-md">
              {message}
            </div>
          )}
      <Footer />
        </div>
      </div>

    </div>
  );
};

export default FreeEntryPage;
