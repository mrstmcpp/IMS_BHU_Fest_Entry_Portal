import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LuChartColumn, LuChevronDown, LuLayoutDashboard, LuLogOut, LuScanLine, LuSettings } from "react-icons/lu";
import logo from "/logo.png";
import { cx } from "./cx";
import { Avatar } from "./ui";

const NAV = [
  { to: "/scan", label: "Scan", icon: LuScanLine, match: ["/scan", "/search"] },
  { to: "/analytics", label: "Stats", icon: LuChartColumn, match: ["/analytics"] },
  { to: "/mrstm", label: "Admin", icon: LuLayoutDashboard, match: ["/mrstm", "/meraj"], adminOnly: true },
  { to: "/settings", label: "Settings", icon: LuSettings, match: ["/settings"] },
];

const UserMenu = ({ username, isAdmin, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100 cursor-pointer"
      >
        <Avatar name={username} className="h-8 w-8 text-xs" />
        <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 sm:block">{username}</span>
        <LuChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{username}</p>
            <p className="text-xs text-slate-500">{isAdmin ? "Admin" : "Scanner"}</p>
          </div>
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LuSettings className="h-4 w-4" /> Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <LuLogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
};

// App shell for the new design: top bar on all screens, bottom tab bar on phones
const V2Layout = ({ username, isAdmin, onLogout }) => {
  const { pathname } = useLocation();
  const items = NAV.filter((item) => !item.adminOnly || isAdmin);
  const isActive = (item) => item.match.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/scan" className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-9 w-9 object-contain" />
            <span className="leading-tight">
              <span className="block text-base font-bold text-slate-900">IMS Fest Entry</span>
              <span className="block text-xs text-slate-500">Elixir · IMS BHU</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive(item) ? "page" : undefined}
                className={cx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive(item) ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
          </nav>
          <UserMenu username={username} isAdmin={isAdmin} onLogout={onLogout} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 md:pb-10">
        <Outlet />
        <footer className="mt-10 text-center text-xs text-slate-400">
          Created by{" "}
          <a href="https://mrstm.in" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-500 hover:text-teal-700">
            Satyam Prajapati
          </a>{" "}
          ·{" "}
          <a href="https://www.linkedin.com/in/mrstmcpp" target="_blank" rel="noopener noreferrer" className="hover:text-teal-700">
            LinkedIn
          </a>
        </footer>
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive(item) ? "page" : undefined}
              className={cx(
                "flex flex-col items-center gap-1 py-2.5 text-xs font-medium",
                isActive(item) ? "text-teal-700" : "text-slate-500"
              )}
            >
              <item.icon className={cx("h-6 w-6", isActive(item) && "stroke-[2.5]")} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default V2Layout;
