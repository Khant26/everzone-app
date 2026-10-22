import React from "react";
import { Link, useLocation } from "react-router";

function Sidebar() {
  const { pathname } = useLocation();

  const linkClass = (to) => {
    const isActive = pathname === to;
    return [
      "block rounded-lg px-3 py-2 text-sm font-semibold transition",
      isActive
        ? "bg-transparent text-[#4d9843]"
        : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-900",
    ].join(" ");
  };

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-black/5 bg-white">
      <div className="flex h-full flex-col p-4">
        <div className="mb-6">
          <div className="text-xl font-extrabold tracking-tight text-slate-900">
            EverZone
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">Dashboard</div>
        </div>

        <nav aria-label="Sidebar" className="flex-1">
          <ul className="space-y-1">
            <li>
              <Link to="/Home" className={linkClass("/Home")}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/Services" className={linkClass("/Services")}>
                Services
              </Link>
            </li>
            <li>
              <Link to="/Projects" className={linkClass("/Projects")}>
                Projects
              </Link>
            </li>
          </ul>
        </nav>

        <div className="pt-4 text-xs text-slate-500">© 2026 EverZone</div>
      </div>
    </aside>
  );
}

export default Sidebar;