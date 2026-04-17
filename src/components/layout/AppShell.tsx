import { Bell, LayoutDashboard, Map, Moon, Package, Sun, Truck } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "Trips", icon: Truck },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/vehicles", label: "Vehicles", icon: Truck },
  { to: "/tracking", label: "Tracking", icon: Map }
];

export const AppShell = ({
  darkMode,
  onToggleDarkMode,
  onSignOut,
  mode
}: {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSignOut: () => void;
  mode: "demo" | "live";
}) => (
  <div className={cn("min-h-screen p-4 text-slate-900", darkMode && "dark")}>
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-[32px] border border-white/40 bg-ink px-6 py-8 text-white shadow-panel">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">FleetFlow</p>
          <h1 className="mt-3 text-3xl font-semibold">Trip Optimizer</h1>
          <p className="mt-3 text-sm text-white/70">
            SaaS control tower for scheduling, allocation, and live fleet visibility.
          </p>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    isActive ? "bg-white text-ink" : "text-white/75 hover:bg-white/10 hover:text-white"
                  )
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-10 rounded-3xl bg-white/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-white/55">Mode</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase">
              {mode}
            </span>
          </div>
          <p className="mt-3 text-sm text-white/70">
            Demo data is always available, while Supabase realtime takes over automatically when connected.
          </p>
        </div>
      </aside>

      <main className="rounded-[32px] border border-slate-200/70 bg-white/80 p-5 shadow-panel backdrop-blur lg:p-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white/80 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Control tower</p>
            <div className="mt-2 flex items-center gap-3">
              <Bell className="text-accent" size={20} />
              <h2 className="text-2xl font-semibold">Fleet operations overview</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="inline-flex items-center gap-2">
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? "Light mode" : "Dark mode"}
              </span>
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-2xl bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  </div>
);
