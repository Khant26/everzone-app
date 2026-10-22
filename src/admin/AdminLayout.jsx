import { Outlet } from "react-router";
import Navbar from "./components/Navbar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
