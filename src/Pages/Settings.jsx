import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../Config/firebase";
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

const SETTINGS_ITEMS = [
  {
    label: "General",
    sub: "Language, currency, theme",
    icon: SettingsIcon,
    to: "/dashboard/settings/general",
  },
  {
    label: "Notifications",
    sub: "Manage notification preferences",
    icon: Bell,
    to: "/dashboard/settings/notifications",
  },
  {
    label: "Privacy",
    sub: "Manage your data and privacy",
    icon: Lock,
    to: "/dashboard/settings/privacy",
  },
  {
    label: "Security",
    sub: "Change Pin and Biometric",
    icon: ShieldCheck,
    to: "/dashboard/settings/security",
  },
  {
    label: "About DENARI",
    sub: "Version 1.0.0",
    icon: HelpCircle,
    to: "/dashboard/settings/about",
  },
];

export default function Settings() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  async function handleLogOut() {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      navigate("/welcome");
    } catch (err) {
      alert(err.message);
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Settings</h1>

      <div className="space-y-2 mb-10">
        {SETTINGS_ITEMS.map(({ label, sub, icon: Icon, to }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(to)}
            className="w-full flex items-center gap-4 rounded-2xl border border-neutral-200
                       px-5 py-4 text-left hover:border-orange-300 hover:bg-orange-50
                       transition-colors focus:outline-none"
          >
            <Icon size={18} className="text-neutral-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-800">{label}</p>
              <p className="text-xs text-neutral-400">{sub}</p>
            </div>
            <ChevronRight size={16} className="text-neutral-400" />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="w-full rounded-full bg-red-50 hover:bg-red-100 transition-colors
                   text-red-600 font-semibold py-3.5 focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-red-300"
      >
        Log out
      </button>

      {/* Log Out confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-3xl px-8 py-8 w-full max-w-sm text-center">
            <h2 className="text-lg font-bold text-red-600 mb-3">LOG OUT</h2>
            <p className="text-neutral-700 mb-6">
              Are you sure you want to log out?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isLoggingOut}
                className="flex-1 rounded-full bg-green-600 hover:bg-green-700
                           transition-colors text-white font-semibold py-3
                           disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogOut}
                disabled={isLoggingOut}
                className="flex-1 rounded-full bg-red-600 hover:bg-red-700
                           transition-colors text-white font-semibold py-3
                           disabled:opacity-50"
              >
                {isLoggingOut ? "Logging out…" : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}