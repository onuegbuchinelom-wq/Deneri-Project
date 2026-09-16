import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config/firebase";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import {
  Bell,
  Eye,
  EyeOff,
  Send,
  PiggyBank,
  TrendingUp,
  BarChart2,
  MoreHorizontal,
  ShoppingBag,
  ArrowDownLeft,
  Tv,
  Receipt,
  Settings,
  User,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Add expenses", icon: Send, to: "/dashboard/add-expense" },
  { label: "Budget", icon: PiggyBank, to: "/dashboard/budget" },
  { label: "Savings", icon: TrendingUp, to: "/dashboard/savings" },
  { label: "Analytics", icon: BarChart2, to: "/dashboard/analytics" },
];

const MORE_MENU_ITEMS = [
  { label: "Profile", icon: User, to: "/dashboard/profile" },
  { label: "Settings", icon: Settings, to: "/dashboard/settings" },
];

const CATEGORY_ICONS = {
  "Foods & Dining": ShoppingBag,
  Income: ArrowDownLeft,
  Entertainment: Tv,
};

function formatNaira(amount) {
  const sign = amount < 0 ? "-" : "+";
  return `${sign}₦${Math.abs(amount).toLocaleString("en-NG")}`;
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "";
  const date = timestamp.toDate();
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Home() {
  const [fullName, setFullName] = useState("");
  const [photoURL, setPhotoURL] = useState(null);
  const [balance, setBalance] = useState(0);
  const [changePercent, setChangePercent] = useState(null);
  const [budgetUsedPercent, setBudgetUsedPercent] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadHomeData() {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();

        // Profile + balance
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setFullName((data.fullName || "").split(" ")[0] || "");
          setPhotoURL(data.photoURL || null);
          setBalance(data.balance || 0);
          setChangePercent(
            typeof data.balanceChangePercent === "number"
              ? data.balanceChangePercent
              : null
          );
          setBudgetUsedPercent(
            typeof data.budgetUsedPercent === "number"
              ? data.budgetUsedPercent
              : null
          );
        }

        // 3 most recent transactions
        const txQuery = query(
          collection(db, "users", user.uid, "transactions"),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const txSnap = await getDocs(txQuery);
        setTransactions(
          txSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (err) {
        console.error("Failed to load home data:", err.message);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-2xl font-bold text-neutral-900">HELLO!</p>
          <p className="text-2xl font-bold text-neutral-900">
            {loading ? "…" : fullName || "there"}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => navigate("/dashboard/notifications")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100
                         text-orange-600 hover:bg-orange-200 transition-colors focus:outline-none"
            >
              <Bell size={18} />
            </button>

            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-neutral-200" />
            )}
          </div>
          <p className="text-sm text-neutral-500">{monthLabel}</p>
        </div>
      </div>

      {/* Total Balance card */}
      <div className="rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 px-8 py-7 text-white mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium opacity-90">Total Balance</span>
          <button
            type="button"
            aria-label={balanceVisible ? "Hide balance" : "Show balance"}
            onClick={() => setBalanceVisible((v) => !v)}
            className="opacity-90 hover:opacity-100 focus:outline-none"
          >
            {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        <p className="text-4xl font-bold mb-3">
          {loading
            ? "…"
            : balanceVisible
            ? `₦${balance.toLocaleString("en-NG")}`
            : "••••••••"}
        </p>

        {budgetUsedPercent !== null && (
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 flex-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${Math.min(Math.max(budgetUsedPercent, 0), 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium opacity-90">
              {budgetUsedPercent}%
            </span>
          </div>
        )}

        {changePercent !== null && (
          <p className="text-xs opacity-80">
            {changePercent >= 0 ? "+" : ""}
            {changePercent}% vs last month
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-5 gap-3 mb-10">
        {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(to)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200
                       bg-white px-3 py-5 text-center hover:border-orange-300 hover:bg-orange-50
                       transition-colors focus:outline-none"
          >
            <Icon size={20} className="text-neutral-700" />
            <span className="text-xs font-medium text-neutral-600">{label}</span>
          </button>
        ))}

        {/* More: opens a dropdown instead of navigating away */}
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={moreOpen}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border border-neutral-200
                       bg-white px-3 py-5 text-center hover:border-orange-300 hover:bg-orange-50
                       transition-colors focus:outline-none"
          >
            <MoreHorizontal size={20} className="text-neutral-700" />
            <span className="text-xs font-medium text-neutral-600">More</span>
          </button>

          {moreOpen && (
            <div
              className="absolute right-0 z-10 mt-2 w-48 rounded-2xl border border-neutral-200
                         bg-white py-2 shadow-lg"
            >
              {MORE_MENU_ITEMS.map(({ label, icon: Icon, to }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    navigate(to);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm
                             text-neutral-700 hover:bg-orange-50 hover:text-orange-600
                             transition-colors focus:outline-none"
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <h2 className="text-lg font-bold text-neutral-900 mb-4">
        Recent transactions
      </h2>

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : transactions.length === 0 ? (
        <p className="text-neutral-400 text-sm">
          No transactions yet. Add your first expense to see it here.
        </p>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => {
            const Icon = CATEGORY_ICONS[tx.category] || Receipt;
            const isIncome = tx.amount > 0;
            return (
              <div key={tx.id} className="flex items-center gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isIncome
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-500"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    {tx.title}
                  </p>
                  <p className="text-xs text-neutral-500">{tx.category}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      isIncome ? "text-green-600" : "text-neutral-900"
                    }`}
                  >
                    {formatNaira(tx.amount)}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}