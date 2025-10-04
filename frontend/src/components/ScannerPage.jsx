import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import Footer from "../reusables/Footer";
import Header from "../reusables/Header";
import { Link } from "react-router-dom";


const ScannerPage = ({ token, onLogout }) => {
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extraResult, setExtraResult] = useState(null);

  const scannerRef = useRef(null);

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
      (err) => {}
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Scan QR Code</h1>
          <button
            onClick={onLogout}
            className="px-3 py-1 text-sm font-medium text-teal-600 bg-teal-100 rounded-md hover:bg-teal-200 cursor-pointer"
          >
            Logout
          </button>
        </div>

        <div
          id="qr-reader"
          className={`w-full ${item || scanError ? "hidden" : ""}`}
        ></div>

        <div className="mt-5 text-center">
          {isLoading && (
            <p className="text-gray-600">Verifying with server...</p>
          )}

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
                <div className="p-4 text-teal-800 bg-teal-100 border border-teal-200 rounded-lg">
                  <div className="text-left">
                    <p>
                      <strong>Elixir Pass ID:</strong>{" "}
                      {extraResult.elixirPassId}
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
                  </div>
                </div>
              )}
            </div>
          )}

          {item && (
            <div className="p-4 text-teal-800 bg-teal-100 border border-teal-200 rounded-lg">
              <p className="font-bold text-lg mb-2">{scanResult.message}</p>
              <div className="text-left">
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
                  <strong>Scanned At:</strong>{" "}
                  {new Date(item.lastScannedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={startScanningAgain}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
              >
                Scan Next Item
              </button>
            </div>
          )}
        </div>
          <div className="font-extrabold mt-6 text-center text-gray-500">
            OR
          </div>
            <br />
        <div>
          <button
            className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 cursor-pointer"
          >
            <Link to={"/search"}>
            Search By Elixir Pass ID
            </Link>
          </button>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ScannerPage;
