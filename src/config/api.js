// Single source of truth for the backend URL used by both the storefront and
// the admin dashboard. Set VITE_API_BASE_URL to the API's base, with or without
// a trailing "/api" (e.g. https://api.example.com/api). When it is not set the
// app falls back to same-origin "/api" requests.
const raw = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");

/** Origin of the API server, without the "/api" suffix (may be "" = same origin). */
export const API_ORIGIN = raw.endsWith("/api") ? raw.slice(0, -4) : raw;

/** Base URL for REST calls, always ending in "/api". */
export const API_BASE_URL = `${API_ORIGIN}/api`;
