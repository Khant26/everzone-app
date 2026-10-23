// Single source of truth for the backend URL used by both the storefront and
// the admin dashboard. Set VITE_API_BASE_URL to the API's base, with or without
// a trailing "/api" (e.g. https://api-everzone.khantmaung.com). It is read at
// build time, so set it in the Vercel project before building.
//
// Without it, `npm run dev` talks to a local backend on http://localhost:5000;
// a production build falls back to same-origin "/api" (and warns), never to
// localhost.
const DEV_FALLBACK = "http://localhost:5000";

const configured = (import.meta.env.VITE_API_BASE_URL || "").trim();
if (!configured && import.meta.env.PROD) {
  console.warn("VITE_API_BASE_URL is not set; API requests go to same-origin /api.");
}

const raw = (configured || (import.meta.env.DEV ? DEV_FALLBACK : "")).replace(/\/+$/, "");

/** Origin of the API server, without the "/api" suffix (may be "" = same origin). */
export const API_ORIGIN = raw.endsWith("/api") ? raw.slice(0, -4) : raw;

/** Base URL for REST calls, always ending in "/api". */
export const API_BASE_URL = `${API_ORIGIN}/api`;
