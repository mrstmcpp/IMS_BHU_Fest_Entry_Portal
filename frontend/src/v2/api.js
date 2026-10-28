import axios from "axios";
import { markApiActivity } from "../shared/activity";

const api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  markApiActivity();
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired/invalid token comes back as 401 "Not authorized…"; other 401s (e.g. a wrong
// free-all secret code) are normal errors and must not log the user out.
api.interceptors.response.use(undefined, (err) => {
  if (err.response?.status === 401 && err.response.data?.message?.startsWith("Not authorized")) {
    window.dispatchEvent(new Event("session-expired"));
  }
  return Promise.reject(err);
});

export const errorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (err.response) return err.response.data?.message || fallback;
  return "Can't reach the server. Check your internet connection and try again.";
};

export default api;
