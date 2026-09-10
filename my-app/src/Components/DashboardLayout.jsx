import { Outlet, NavLink } from "react-router-dom";
import {
  Home as HomeIcon,
  Wallet,
  PlusCircle,
  PiggyBank,
  BarChart2,
  User,
  Settings as SettingsIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: HomeIcon, end: true },
  { to: "/dashboard/budget", label: "Budget", icon: Wallet },
  { to: "/dashboard/add-expense", label: "Add Expenses", icon: PlusCircle },
  { to: "/dashboard/savings", label: "Savings", icon: PiggyBank },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-neutral-200 flex flex-col justify-between py-6">
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

      {/* Active page renders here */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}