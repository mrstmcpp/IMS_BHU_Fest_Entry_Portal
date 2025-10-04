import React, { useState } from "react";
import axios from "axios";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";

const CreateNewPass = ({ token, onLogout }) => {
  const [formData, setFormData] = useState({
    elixirPassId: "",
    name: "",
    department: "",
    batch: "",
  });

  const [message, setMessage] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setQrCode(null);
    setIsLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/scan/create`,
        formData,
        config
      );
      setMessage(response.data.message);
      setQrCode(response.data.qrCodeData);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Error while creating Elixir Pass.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
        <Header />

        <h2 className="text-2xl font-bold text-gray-900">
          Create a New Elixir Pass
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Fill the form to generate a new Elixir Pass
        </p>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="elixirPassId"
            value={formData.elixirPassId}
            onChange={handleChange}
            placeholder="Elixir Pass ID"
            required
            className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Department"
            required
            className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
          <input
            type="text"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            placeholder="Batch (e.g., 2025)"
            required
            className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-teal-400"
          >
            {isLoading ? "Creating..." : "Create Pass"}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-4 text-green-800 bg-green-100 border border-green-200 rounded-lg">
            <p>{message}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 text-rose-800 bg-rose-100 border border-rose-200 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {qrCode && (
          <div className="mt-6">
            <p className="font-bold">Scan this QR Code:</p>
            <img
              src={qrCode}
              alt="QR Code"
              className="mx-auto mt-2 border rounded-lg"
            />

            <a
              href={qrCode}
              download={`ElixirPass-${formData.elixirPassId || "QRCode"}.png`}
              className="inline-block mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Download QR Code
            </a>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default CreateNewPass;
