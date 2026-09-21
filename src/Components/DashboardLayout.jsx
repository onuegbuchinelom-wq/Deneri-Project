import { NavLink } from "react-router-dom";
import { Outlet } from "react-router-dom";
import {
  Home as HomeIcon,
  Wallet,
  Plus,
  BarChart2,
  User,
  PiggyBank,
  Settings as SettingsIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: HomeIcon, end: true },
  { to: "/dashboard/budget", label: "Budget", icon: Wallet },
  { to: "/dashboard/add-expense", label: "Add Expenses", icon: Plus },
  { to: "/dashboard/savings", label: "Savings", icon: PiggyBank },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

// Matches the reference screenshot: Home, Budget, Add (raised center button), Analytics, Profile
const BOTTOM_NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: HomeIcon, end: true },
  { to: "/dashboard/budget", label: "Budget", icon: Wallet },
  { to: "/dashboard/add-expense", label: "Add", icon: Plus, isCenter: true },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-56 shrink-0 bg-white border-r border-neutral-200 flex-col justify-between py-6">
        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-neutral-600 hover:bg-orange-50 hover:text-orange-600"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <nav className="px-3">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-neutral-600 hover:bg-orange-50 hover:text-orange-600"
              }`
            }
          >
            <SettingsIcon size={18} />
            Settings
          </NavLink>
        </nav>
      </aside>

      {/* Active page renders here. Bottom padding on mobile clears the tab bar. */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom tab bar — mobile only */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200
                   px-4 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between h-16">
          {BOTTOM_NAV_ITEMS.map(({ to, label, icon: Icon, end, isCenter }) =>
            isCenter ? (
              <NavLink key={to} to={to} end={end} className="relative -mt-6">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full
                             bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                >
                  <Icon size={26} />
                </span>
              </NavLink>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium ${
                    isActive ? "text-orange-600" : "text-neutral-400"
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            )
          )}
        </div>
      </nav>
    </div>
  );
}