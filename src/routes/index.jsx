import { createBrowserRouter, Navigate } from "react-router";
import App from "../pages/App";
import Layout from "../Layout";
import AdminRoot from "../admin/AdminRoot";
import AdminLayout from "../admin/AdminLayout";
import RequireAdmin from "../admin/RequireAdmin";
import PageLoading from "../components/PageLoading";

// Admin pages are code-split so the storefront bundle stays small.
const lazyPage = (load) => async () => ({ Component: (await load()).default });

const router = createBrowserRouter([
  // ----- Customer storefront -----
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: App },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },

  // ----- Admin dashboard (/admin/*) -----
  {
    path: "/admin",
    Component: AdminRoot,
    HydrateFallback: PageLoading,
    children: [
      { path: "login", lazy: lazyPage(() => import("../admin/pages/Login")) },
      {
        Component: RequireAdmin,
        children: [
          {
            Component: AdminLayout,
            children: [
              { index: true, lazy: lazyPage(() => import("../admin/pages/Home")) },
              { path: "services", lazy: lazyPage(() => import("../admin/pages/Services")) },
              { path: "projects", lazy: lazyPage(() => import("../admin/pages/Projects")) },
              { path: "*", element: <Navigate to="/admin" replace /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
