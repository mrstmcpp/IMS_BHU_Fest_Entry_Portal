import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";

const AnalyticsPage = ({ token, onLogout }) => {
  const [analytics, setAnalytics] = useState({ count: 0, total: 0 });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError("");
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/scan/analytics`,
          config
        );
        setAnalytics({
          count: response.data.count,
          total: response.data.total,
        });
      } catch (err) {
        const msg =
          err.response?.data?.message || "Error while fetching analytics.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
        <Header />

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Analytics Overview
        </h2>

        {isLoading ? (
          <p className="text-blue-600 font-medium">Loading...</p>
        ) : error ? (
          <p className="text-red-600 font-medium">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-100 shadow">
              <p className="text-lg font-semibold text-gray-700">Total people inside fest</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.count}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-100 shadow">
              <p className="text-lg font-semibold text-gray-700">Total Registered</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.total}
              </p>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default AnalyticsPage;
