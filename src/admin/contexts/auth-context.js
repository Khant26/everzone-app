import { createContext } from "react";

export const AuthContext = createContext(null);

const TOKEN_KEY = "access_token";
const USER_KEY = "user_data";

const decodeJwtPayload = (token) => {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/** Returns true when the JWT has an `exp` claim in the past. */
export const isTokenExpired = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const storeAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user ?? {}));
};

/** Reads a still-valid stored session, or null (clearing stale data). */
export const readStoredUser = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);
    if (!token || !userData) return null;
    if (isTokenExpired(token)) {
      clearStoredAuth();
      return null;
    }
    return JSON.parse(userData);
  } catch {
    clearStoredAuth();
    return null;
  }
};
