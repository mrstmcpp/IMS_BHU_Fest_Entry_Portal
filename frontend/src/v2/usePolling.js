import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "./api";

// Loads data now, then every `intervalMs` while the page is visible (no requests from background tabs)
const usePolling = (fetcher, intervalMs) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetcherRef.current());
      setError("");
      setUpdatedAt(Date.now());
    } catch (err) {
      setError(errorMessage(err, "Couldn't load the latest numbers."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(() => {
      if (!document.hidden) refresh();
    }, intervalMs);
    const onVisibilityChange = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refresh, intervalMs]);

  return { data, error, loading, refresh, updatedAt };
};

export default usePolling;
