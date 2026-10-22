import { useEffect } from "react";
import { Outlet } from "react-router";
import { AuthContextProvider } from "./contexts/AuthContext";
import "./admin.css";

/** Root of every /admin/* route: provides auth state and admin-scoped styles. */
function AdminRoot() {
  useEffect(() => {
    const previous = document.title;
    document.title = "EverZone Admin";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <AuthContextProvider>
      <div className="admin-root">
        <Outlet />
      </div>
    </AuthContextProvider>
  );
}

export default AdminRoot;
