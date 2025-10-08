import React, { useState } from "react";
import axios from "axios";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";
import { Link } from "react-router-dom";

const SearchByIdPage = ({ token, onLogout }) => {
  const [elixirId, setElixirId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extraResult, setExtraResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!elixirId) return;
    setIsLoading(true);
    setSearchResult(null);
    setSearchError("");
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/scan`,
        { elixirPassId: elixirId },
        config
      );
      setSearchResult(response.data);
    } catch (err) {
      const message =
        err.response?.data?.message || "No record found for this ID.";
      const extra = err.response?.data?.item || null;
      setSearchError(message);
      setExtraResult(extra);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSearch = () => {
    setElixirId("");
    setSearchResult(null);
    setSearchError("");
  };

  const item = searchResult?.item;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onLogout={onLogout} />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Scan by Elixir Pass ID
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Enter the Elixir Pass ID to get attendee details
          </p>
          <form className="space-y-4 mt-4" onSubmit={handleSearch}>
            <input
              type="text"
              value={elixirId}
              onChange={(e) => setElixirId(e.target.value)}
              placeholder="Enter Elixir Pass ID"
              className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 cursor-pointer"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </form>

          <div className="mt-5 text-center">
            {searchError && (
              <div>
                <div className="p-4 text-rose-800 bg-rose-100 border border-rose-200 rounded-lg">
                  <p className="font-bold">Error</p>
                  <p>{searchError}</p>
                  <button
                    onClick={startNewSearch}
                    className="mt-3 px-4 py-2 text-sm font-medium cursor-pointer text-white bg-rose-600 rounded-md hover:bg-rose-700"
                  >
                    Try Again
                  </button>
                </div>
                {extraResult && (
                  <div
                    className={`p-4 border rounded-lg mt-2 text-left ${
                      extraResult.isSpecial
                        ? "text-yellow-900 bg-yellow-100 border-yellow-300"
                        : "text-teal-800 bg-teal-100 border-teal-200"
                    }`}
                  >
                    <p>
                      <strong>Elixir Pass ID:</strong> {extraResult.elixirPassId}
                    </p>
                    <p>
                      <strong>Name:</strong> {extraResult.name}
                    </p>
                    <p>
                      <strong>Department:</strong> {extraResult.department}
                    </p>
                    <p>
                      <strong>Batch:</strong> {extraResult.batch}
                    </p>
                    {extraResult.isSpecial && (
                      <p className="mt-2 font-semibold text-yellow-700">
                        Special Pass Detected
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {item && (
              <div
                className={`p-4 border rounded-lg text-left ${
                  item.isSpecial
                    ? "text-yellow-900 bg-yellow-100 border-yellow-300"
                    : "text-teal-800 bg-teal-100 border-teal-200"
                }`}
              >
                <p
                  className={`font-bold text-lg mb-2 ${
                    item.isSpecial ? "text-yellow-800" : "text-teal-800"
                  }`}
                >
                  {item.isSpecial
                    ? "Special Pass Validated"
                    : searchResult.message}
                </p>
                <p>
                  <strong>Elixir Pass ID:</strong> {item.elixirPassId}
                </p>
                <p>
                  <strong>Name:</strong> {item.name}
                </p>
                <p>
                  <strong>Department:</strong> {item.department}
                </p>
                <p>
                  <strong>Batch:</strong> {item.batch}
                </p>
                <p>
                  <strong>Last Scanned At:</strong>{" "}
                  {new Date(item.lastScannedAt).toLocaleString()}
                </p>
                {item.isSpecial && (
                  <p className="mt-2 font-semibold text-yellow-700">
                    Special Access Granted for Today!
                  </p>
                )}
                <button
                  onClick={startNewSearch}
                  className={`mt-4 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 cursor-pointer ${
                    item.isSpecial
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-teal-600 hover:bg-teal-700"
                  }`}
                >
                  Scan Another ID
                </button>
              </div>
            )}
          </div>

          <div className="font-extrabold mt-6 text-center text-gray-500">OR</div>
          <div>
            <Link to="/scan">
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-400 border border-transparent rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer">
                ← Scan By QR
              </button>
            </Link>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default SearchByIdPage;
