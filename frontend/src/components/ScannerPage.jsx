import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import Footer from "../reusables/Footer";
import Header from "../reusables/Header";
import { useNavigate } from "react-router-dom";

const ScannerPage = ({ token, onLogout }) => {
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extraResult, setExtraResult] = useState(null);

  const scannerRef = useRef(null);
  const navigate = useNavigate();
  const isAdmin = JSON.parse(localStorage.getItem("isAdmin")) || false;

  const initScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }

    const scanner = new Html5QrcodeScanner("qr-reader", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(
      (result) => {
        scanner.clear().catch(() => {});
        setTimeout(() => {
          handleScan(result);
        }, 100);
      },
      () => {}
    );

    scannerRef.current = scanner;
  };

  useEffect(() => {
    initScanner();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const handleScan = async (qrCodeId) => {
    setIsLoading(true);
    setScanResult(null);
    setScanError(null);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/scan`,
        { elixirPassId: qrCodeId },
        config
      );
      setScanResult(response.data);
    } catch (err) {
      const message =
        err.response?.data?.message || "An error occurred during the scan.";
      setScanError(message);
      const extra = err.response?.data?.item || null;
      setExtraResult(extra);
    } finally {
      setIsLoading(false);
    }
  };

  const startScanningAgain = () => {
    setScanResult(null);
    setScanError(null);
    initScanner();
  };

  const item = scanResult?.item;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLogout={onLogout} />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">Scan QR Code</h1>
            <button
              onClick={onLogout}
              className="px-3 py-1 text-sm font-medium text-teal-600 bg-teal-100 rounded-md hover:bg-teal-200 cursor-pointer"
            >
              Logout
            </button>
          </div>

          {/* QR Scanner */}
          <div
            id="qr-reader"
            className={`w-full ${item || scanError ? "hidden" : ""}`}
          ></div>

          <div className="mt-5 text-center">
            {isLoading && <p className="text-gray-600">Verifying with server...</p>}

            {/* Error state */}
            {scanError && (
              <div>
                <div className="p-4 text-rose-800 bg-rose-100 border border-rose-200 rounded-lg">
                  <p className="font-bold">Error</p>
                  <p>{scanError}</p>
                  <button
                    onClick={startScanningAgain}
                    className="mt-3 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
                  >
                    Scan Again
                  </button>
                </div>
                {extraResult && (
                  <div className="p-4 text-teal-800 bg-teal-100 border border-teal-200 rounded-lg mt-2 text-left">
                    <p><strong>Elixir Pass ID:</strong> {extraResult.elixirPassId}</p>
                    <p><strong>Name:</strong> {extraResult.name}</p>
                    <p><strong>Department:</strong> {extraResult.department}</p>
                    <p><strong>Batch:</strong> {extraResult.batch}</p>
                  </div>
                )}
              </div>
            )}

            {/* Success state */}
            {item && (
              <div className="p-4 text-teal-800 bg-teal-100 border border-teal-200 rounded-lg text-left">
                <p className="font-bold text-lg mb-2">{scanResult.message}</p>
                <p><strong>Elixir Pass ID:</strong> {item.elixirPassId}</p>
                <p><strong>Name:</strong> {item.name}</p>
                <p><strong>Department:</strong> {item.department}</p>
                <p><strong>Batch:</strong> {item.batch}</p>
                <p><strong>Scanned At:</strong> {new Date(item.lastScannedAt).toLocaleString()}</p>
                <button
                  onClick={startScanningAgain}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 cursor-pointer"
                >
                  Scan Next Item
                </button>
              </div>
            )}
          </div>

          {/* OR Section */}
          <div className="font-extrabold mt-6 text-center text-gray-500">OR</div>

          {/* Buttons */}
          <div className="mt-4 space-y-4">
            <button
              className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md cursor-pointer hover:bg-teal-700"
              onClick={() => navigate("/search")}
            >
              Scan By Elixir Pass ID
            </button>

            <button
              className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md cursor-pointer hover:bg-teal-700"
              onClick={() => navigate("/analytics")}
            >
              View Analytics
            </button>

            {isAdmin && (
              <button
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 cursor-pointer"
                onClick={() => navigate("/mrstm")}
              >
                Go to Admin Panel
              </button>
            )}
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
