import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import {
  Settings,
  User as UserIcon,
  CreditCard,
  Landmark,
  Shield,
  HelpCircle,
  UserPlus,
  ChevronRight,
} from "lucide-react";

const MENU_ITEMS = [
  { label: "Personal information", icon: UserIcon, to: "/dashboard/profile/personal-info" },
  { label: "Linked device", icon: CreditCard, to: "/dashboard/profile/linked-devices" },
  { label: "Bank accounts", icon: Landmark, to: "/dashboard/profile/bank-accounts" },
  { label: "security", icon: Shield, to: "/dashboard/settings/security" },
  { label: "Help & support", icon: HelpCircle, to: "/dashboard/profile/help" },
  { label: "Invite friends", icon: UserPlus, to: "/dashboard/profile/invite" },
];

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

export default function Profile() {
  const [fullName, setFullName] = useState("");
  const [photoURL, setPhotoURL] = useState(null);
  const [balance, setBalance] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(getFirestore(), "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setFullName(data.fullName || "");
          setPhotoURL(data.photoURL || null);
          setBalance(data.balance || 0);

          const goals = data.savingsGoalsTotal;
          setTotalSavings(typeof goals === "number" ? goals : 0);
        }
      } catch (err) {
        console.error("Failed to load profile:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
        <button
          type="button"
          onClick={() => navigate("/dashboard/settings")}
          aria-label="Settings"
          className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserIcon size={36} className="text-neutral-400" />
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-neutral-500 mb-8">Loading…</p>
      ) : (
        <p className="text-center text-lg font-semibold text-neutral-900 mb-8">
          {fullName || "Your Name"}
        </p>
      )}

      {/* Account Overview */}
      <h2 className="text-sm font-semibold text-neutral-500 mb-3">
        Account Overview
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-neutral-200 px-5 py-4">
          <p className="text-xs text-neutral-500 mb-1">Total balance</p>
          <p className="text-lg font-bold text-neutral-900">
            {loading ? "…" : formatNaira(balance)}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 px-5 py-4">
          <p className="text-xs text-neutral-500 mb-1">Total savings</p>
          <p className="text-lg font-bold text-neutral-900">
            {loading ? "…" : formatNaira(totalSavings)}
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2">
        {MENU_ITEMS.map(({ label, icon: Icon, to }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(to)}
            className="w-full flex items-center gap-4 rounded-2xl border border-neutral-200
                       px-5 py-4 text-left hover:border-orange-300 hover:bg-orange-50
                       transition-colors focus:outline-none"
          >
            <Icon size={18} className="text-neutral-500" />
            <span className="flex-1 text-sm font-medium text-neutral-800">
              {label}
            </span>
            <ChevronRight size={16} className="text-neutral-400" />
          </button>
        ))}
      </div>
    </div>
  );
}