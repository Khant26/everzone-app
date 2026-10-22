import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AuthContext } from "../contexts/AuthContext";

const navItems = [
  { label: "Home", to: "/Home" },
  { label: "Services", to: "/Services" },
  { label: "Projects", to: "/Projects" },
];

function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);

  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    logout();
    navigate("/Login");
  };

  const linkClass = (to) => {
    const isActive = pathname === to;
    return [
      "text-sm font-medium transition",
      isActive ? "text-[#4d9843]" : "text-slate-700 hover:text-slate-900",
    ].join(" ");
  };

  useEffect(() => {
    if (!showSignOutModal) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowSignOutModal(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSignOutModal]);

  useEffect(() => {
    const handleDrawerVisibility = (event) => {
      setHideNavbar(Boolean(event.detail?.hidden));
    };

    window.addEventListener("everzone:navbar-visibility", handleDrawerVisibility);
    return () => {
      window.removeEventListener("everzone:navbar-visibility", handleDrawerVisibility);
    };
  }, []);

  return (
    <>
      <header
        className={[
          "sticky top-0 z-30 border-b border-black/5 bg-white",
          hideNavbar ? "hidden" : "",
        ].join(" ")}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/Home" className="flex items-center gap-2">
              <img
                src="/everzone%20Logo.jpg"
                alt="Ever Zone"
                className="h-15 w-15 object-contain"
              />
              <span className="text-base font-semibold text-slate-900">
                EverZone
              </span>
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={linkClass(item.to)}
                  aria-current={pathname === item.to ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <button className="font-semibold text-[#4d9843]" type="button">
                EN
              </button>
              <span className="text-slate-300">|</span>
              <button className="font-semibold transition hover:text-slate-900" type="button">
                MM
              </button>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-slate-700 transition hover:border-black/20 hover:text-slate-900"
              onClick={() => setShowSignOutModal(true)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>
        </div>

        <nav aria-label="Primary" className="border-t border-black/5 md:hidden">
          <div className="flex items-center gap-6 px-6 py-3 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={linkClass(item.to)}
                aria-current={pathname === item.to ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {showSignOutModal ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 px-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close sign out confirmation"
            onClick={() => setShowSignOutModal(false)}
          />

          <div className="relative w-full max-w-[424px] rounded-2xl bg-white px-10 py-9 shadow-2xl">
            <h2 className="text-[30px] font-semibold tracking-tight text-slate-700">
              Confirm Sign Out
            </h2>

            <p className="mt-9 text-[17px] leading-8 text-slate-500">
              Are you sure you want to sign out?
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="min-w-[142px] rounded-full border border-slate-200 bg-white px-8 py-4 text-[17px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSignOut}
                className="min-w-[142px] rounded-full bg-[#2f6d8d] px-8 py-4 text-[17px] font-semibold text-white transition hover:bg-[#285e79]"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Navbar;