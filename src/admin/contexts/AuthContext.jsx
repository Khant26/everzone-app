import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { AUTH_CLEARED_EVENT } from "../services/apiService";
import {
  AuthContext,
  clearStoredAuth,
  readStoredUser,
  storeAuth,
} from "./auth-context";

const AuthContextProvider = ({ children }) => {
  // Initialise synchronously so protected routes don't bounce to /admin/login
  // on a page refresh before an effect has run.
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);

  const getUser = useCallback(async () => {
    const stored = readStoredUser();
    setUser(stored);
    return stored;
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const username = credentials?.username ?? credentials?.email;
      const password = credentials?.password;

      const response = await axios.post(
        `${API_BASE_URL}/admin/login`,
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const payload = response.data;
      const token = payload?.data?.token;
      const admin = payload?.data?.admin;

      if (response.status === 200 && payload?.success === true && token) {
        if (admin?.role !== "superadmin") {
          return {
            success: false,
            error: "Access denied. Super admin privileges required.",
          };
        }
        storeAuth(token, admin);
        setUser(admin ?? {});
        return { success: true, data: payload.data };
      }

      return {
        success: false,
        error: payload?.message || "Login failed. Please check your credentials.",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Login failed. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  // apiService clears storage on 401/403; mirror that in React state.
  useEffect(() => {
    const onCleared = () => setUser(null);
    window.addEventListener(AUTH_CLEARED_EVENT, onCleared);
    return () => window.removeEventListener(AUTH_CLEARED_EVENT, onCleared);
  }, []);

  const value = useMemo(
    () => ({ user, getUser, login, logout, loading }),
    [user, getUser, login, logout, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContextProvider };
