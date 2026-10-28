import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";
import { timeAgo } from "../shared/format";

const ActiveUsersPage = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivity = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/mrstm/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error while fetching user activity.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchActivity();
    const timer = setInterval(() => {
      if (!document.hidden) fetchActivity();
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchActivity]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onLogout={onLogout} />

      <div className="flex flex-col items-center justify-center flex-grow px-4 py-8">
        <div className="w-full max-w-4xl p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900">Active Users & Scan Stats</h2>
          <p className="text-sm text-gray-600">
            Online = active in the last {data ? Math.round(data.onlineWindowSeconds / 60) : 3} minutes. Refreshes every 30 seconds.
          </p>

          {error && <p className="text-red-600 font-medium">{error}</p>}
          {!data && isLoading && <p className="text-blue-600 font-medium">Loading...</p>}

          {data && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ["Online now", `${data.summary.onlineCount} / ${data.summary.totalUsers}`],
                  ["Let in today", data.summary.todayEntered],
                  ["Scans today", data.summary.todayScans],
                  ["Let in last hour", data.summary.enteredLastHour],
                ].map(([label, value]) => (
                  <div key={label} className="p-4 rounded-lg bg-gray-100 shadow">
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border border-gray-200">
                  <thead className="bg-teal-600 text-white">
                    <tr>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Let in today</th>
                      <th className="px-3 py-2 text-right">Scans today</th>
                      <th className="px-3 py-2 text-right">Let in total</th>
                      <th className="px-3 py-2 text-right">Scans total</th>
                      <th className="px-3 py-2 text-right">Rejected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((u) => (
                      <tr key={u._id} className="border-t border-gray-200">
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {u.username}
                          {u.isAdmin && <span className="ml-1 text-xs text-teal-700">(admin)</span>}
                        </td>
                        <td className="px-3 py-2">
                          {u.online ? (
                            <span className="font-semibold text-green-700">● Online</span>
                          ) : (
                            <span className="text-gray-500">
                              {u.lastActiveAt ? `Seen ${timeAgo(u.lastActiveAt)}` : "Never signed in"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-green-700">{u.stats.today.entered}</td>
                        <td className="px-3 py-2 text-right">{u.stats.today.scans}</td>
                        <td className="px-3 py-2 text-right font-semibold">{u.stats.entered}</td>
                        <td className="px-3 py-2 text-right">{u.stats.scans}</td>
                        <td className="px-3 py-2 text-right text-gray-500">{u.stats.rejected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500">Scan counts include only scans made since activity tracking was turned on.</p>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={fetchActivity}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-teal-400 cursor-pointer"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => navigate("/mrstm")}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 cursor-pointer"
            >
              ← Back to Admin Panel
            </button>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ActiveUsersPage;
