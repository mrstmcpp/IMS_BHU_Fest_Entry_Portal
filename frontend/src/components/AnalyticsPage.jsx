import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen flex flex-col bg-gray-50">

      <Header onLogout={onLogout} />


      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
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
                <p className="text-lg font-semibold text-gray-700">
                  Total people inside fest
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.count}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-100 shadow">
                <p className="text-lg font-semibold text-gray-700">
                  Total Registered
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.total}
                </p>
              </div>
            </div>
          )}

          <div>
            <Link to="/scan">
              <button className="w-full px-4 py-2 cursor-pointer text-sm font-medium text-white bg-gray-400 border border-transparent rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                ← Back to scanner
              </button>
            </Link>
          </div>
      <Footer />
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
