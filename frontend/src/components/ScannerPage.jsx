import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import Footer from "../reusables/Footer";
import Header from "../reusables/Header";
import { useNavigate } from "react-router-dom";

const ScannerPage = ({ token, onLogout }) => {
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extraResult, setExtraResult] = useState(null);

  const navigate = useNavigate();
  const isAdmin = JSON.parse(localStorage.getItem("isAdmin")) || false;

  const html5QrCodeRef = useRef(null);
  const isMountedRef = useRef(true);
  const scanningGuardRef = useRef(false);


  useEffect(() => {
    isMountedRef.current = true;
    startScanner();

    return () => {
      isMountedRef.current = false;
      stopScanner();
    };

  }, []);

  // ✅ Start scanner
  const startScanner = async () => {
    const containerId = "qr-reader";
    const container = document.getElementById(containerId);
    if (!container) return;

    await stopScanner();

    const html5QrCode = new Html5Qrcode(containerId);
    html5QrCodeRef.current = html5QrCode;

    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setScanError("No camera found on this device.");
        return;
      }

      const cameraId = cameras[0].id;

      await html5QrCode.start(
        { deviceId: { exact: cameraId } },
        { fps: 5, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (scanningGuardRef.current) return;
          scanningGuardRef.current = true;

          (async () => {
            try {
              await html5QrCode.stop();
            } catch {}
            try {
              html5QrCode.clear();
            } catch {}
            html5QrCodeRef.current = null;

            if (isMountedRef.current) {
              setTimeout(() => handleScan(decodedText), 100);
            }
          })();
        },
        () => {}
      );
    } catch (error) {
      console.error("Error starting QR scanner:", error);
      setScanError("Camera initialization failed. Check permissions.");
    }
  };


  const stopScanner = async () => {
    const scanner = html5QrCodeRef.current;
    if (!scanner) return;

    try {
      await scanner.stop();
    } catch {}
    try {
      scanner.clear();
    } catch {}

    html5QrCodeRef.current = null;
  };


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


  const startScanningAgain = async () => {
    scanningGuardRef.current = false;
    setScanResult(null);
    setScanError(null);
    setExtraResult(null);
    await startScanner();
  };


  const safeNavigate = async (path) => {
    await stopScanner(); 
    navigate(path);
  };

  const item = scanResult?.item;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLogout={async () => {
        await stopScanner();
        onLogout();
      }} />

      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">Scan QR Code</h1>
            <button
              onClick={async () => {
                await stopScanner();
                onLogout();
              }}
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
            {isLoading && <p className="text-gray-600">Verifying with server...</p>}

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

          <div className="font-extrabold mt-6 text-center text-gray-500">OR</div>

          <div className="mt-4 space-y-4">
            <button
              className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 cursor-pointer"
              onClick={() => safeNavigate("/search")}
            >
              Scan By Elixir Pass ID
            </button>

            <button
              className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 cursor-pointer"
              onClick={() => safeNavigate("/analytics")}
            >
              View Analytics
            </button>

            {isAdmin && (
              <button
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 cursor-pointer"
                onClick={() => safeNavigate("/mrstm")}
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
