import axios from "axios";

// Any API call already marks the user active on the server; the heartbeat only fills the gaps
// while the app sits open with nothing happening (e.g. a scanner waiting at the gate).
const HEARTBEAT_CHECK_MS = 60 * 1000;
const IDLE_BEFORE_HEARTBEAT_MS = 110 * 1000;

let lastRequestAt = 0;

export const markApiActivity = () => {
  lastRequestAt = Date.now();
};

axios.interceptors.request.use((config) => {
  markApiActivity();
  return config;
});

export const startActivityTracking = (token) => {
  const beat = () => {
    if (document.hidden || Date.now() - lastRequestAt < IDLE_BEFORE_HEARTBEAT_MS) return;
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/auth/heartbeat`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .catch(() => {});
  };
  const onVisibilityChange = () => {
    if (!document.hidden) beat();
  };
  const timer = setInterval(beat, HEARTBEAT_CHECK_MS);
  document.addEventListener("visibilitychange", onVisibilityChange);
  return () => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
};
