import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const TOKEN_KEY = "invoiceai_token";

export const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-logout when the server says our token is no longer valid.
    if (error?.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/signup" && path !== "/") {
        localStorage.removeItem(TOKEN_KEY);
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

/** Extracts a human-readable message from any axios error or thrown value. */
export const getErrorMessage = (err, fallback = "Something went wrong") => {
  if (!err) return fallback;
  const data = err?.response?.data;
  if (data?.message) return data.message;
  if (data?.details?.length) return data.details[0].message || fallback;
  if (err?.code === "ECONNABORTED") {
    return "Request timed out — the API is not responding. Check that the backend and database are running.";
  }
  if (!err?.response) {
    return "Network error — cannot reach the API. The server may be down or the database is not connected.";
  }
  if (err?.message) return err.message;
  return fallback;
};
