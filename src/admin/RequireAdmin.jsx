import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { AuthContext } from "./contexts/auth-context";

/** Guards admin pages: only a logged-in superadmin may pass. */
function RequireAdmin() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user || user.role !== "superadmin") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireAdmin;
