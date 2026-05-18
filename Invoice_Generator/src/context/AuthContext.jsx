import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, TOKEN_KEY, getErrorMessage } from "../lib/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  // On boot: if a token is in localStorage, try to rehydrate the user profile.
  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) setUser(data.data.user);
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const persist = (newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      persist(data.data.token, data.data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: getErrorMessage(err, "Sign in failed") };
    }
  }, []);

  const signup = useCallback(async (fullName, email, password) => {
    try {
      const { data } = await api.post("/auth/signup", { fullName, email, password });
      persist(data.data.token, data.data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: getErrorMessage(err, "Sign up failed") };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data.user);
      return data.data.user;
    } catch {
      return null;
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    signup,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
