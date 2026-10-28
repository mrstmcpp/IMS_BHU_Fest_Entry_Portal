import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const cameraErrorMessage = (error) => {
  const text = String(error?.message || error);
  if (/NotAllowedError|Permission/i.test(text)) {
    return "Camera access is blocked. Allow camera permission for this site in your browser settings, then try again.";
  }
  if (/NotFoundError|Requested device not found|no camera/i.test(text)) return "No camera was found on this device.";
  if (/NotReadableError|Could not start video source/i.test(text)) {
    return "The camera is being used by another app. Close it and try again.";
  }
  return "Couldn't start the camera. Try again, or type the ID instead.";
};

// Runs the QR camera while `active` is true. The camera is released when `active` turns false,
// when the page unmounts, and while the tab/app is in the background (saves battery).
const useQrScanner = (elementId, active, onDecode) => {
  const [status, setStatus] = useState("idle"); // idle | starting | scanning | error
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  const startingRef = useRef(null);
  const onDecodeRef = useRef(onDecode);

  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);

  const stop = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    scannerRef.current = null;
    // stop() throws while the camera is still starting; wait for the start so its camera gets released
    await startingRef.current?.catch(() => {});
    try {
      await scanner.stop();
    } catch {
      // camera never started
    }
    try {
      scanner.clear();
    } catch {
      // element already gone
    }
  }, []);

  const start = useCallback(async () => {
    await stop();
    if (!document.getElementById(elementId)) return;
    const scanner = new Html5Qrcode(elementId, {
      verbose: false,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    });
    scannerRef.current = scanner;
    setStatus("starting");
    setError("");
    const starting = scanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: (width, height) => {
          const size = Math.floor(Math.min(width, height) * 0.7);
          return { width: size, height: size };
        },
      },
      (decodedText) => {
        if (scannerRef.current !== scanner) return;
        stop();
        setStatus("idle");
        onDecodeRef.current(decodedText);
      },
      () => {}
    );
    startingRef.current = starting;
    try {
      await starting;
      if (scannerRef.current === scanner) setStatus("scanning");
    } catch (err) {
      if (scannerRef.current !== scanner) return;
      scannerRef.current = null;
      setStatus("error");
      setError(cameraErrorMessage(err));
    }
  }, [elementId, stop]);

  useEffect(() => {
    if (!active) {
      stop();
      setStatus("idle");
      return undefined;
    }
    start();
    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
        setStatus("idle");
      } else {
        start();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [active, start, stop]);

  return { status, error, retry: start };
};

export default useQrScanner;
