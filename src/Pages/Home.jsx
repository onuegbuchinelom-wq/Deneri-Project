import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config/firebase";
import { useSettings } from "../Components/SettingsProvider";
import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
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
  ChevronDown,
  Sunrise,
  Sun,
  Sunset,
  Moon,
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

function formatSigned(amount, formatCurrency) {
  const sign = amount < 0 ? "-" : "+";
  return `${sign}${formatCurrency(Math.abs(amount))}`;
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

function formatFullDateTime(timestamp) {
  if (!timestamp?.toDate) return { date: "—", time: "—" };
  const date = timestamp.toDate();
  return {
    date: date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

function getGreetingIcon(greeting) {
  if (greeting === "Good morning") return Sunrise;
  if (greeting === "Good afternoon") return Sun;
  if (greeting === "Good evening") return Sunset;
  return Moon;
}

export default function Home() {
  const [fullName, setFullName] = useState("");
  const [photoURL, setPhotoURL] = useState(null);
  const [balance, setBalance] = useState(0);
  const [changePercent, setChangePercent] = useState(null);
  const [budgetUsedPercent, setBudgetUsedPercent] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(() => {
    const preferences = localStorage.getItem("denari-privacy-preferences");
    return preferences ? JSON.parse(preferences).showBalance !== false : true;
  });
  const [moreOpen, setMoreOpen] = useState(false);
  const [expandedTxId, setExpandedTxId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [greeting, setGreeting] = useState(getGreeting);
  const moreRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const { formatCurrency, settings } = useSettings();
  const GreetingIcon = getGreetingIcon(greeting);

  useEffect(() => {
    const interval = window.setInterval(() => setGreeting(getGreeting()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    let userLoaded = false;
    let txLoaded = false;

    function maybeStopLoading() {
      if (userLoaded && txLoaded) setLoading(false);
    }

    // Profile + balance — live, so budget/expense changes reflect instantly
    const unsubUser = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
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
        userLoaded = true;
        maybeStopLoading();
      },
      (err) => {
        console.error("Failed to load user data:", err.message);
        userLoaded = true;
        maybeStopLoading();
      }
    );

    // 5 most recent transactions — live
    const txQuery = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubTx = onSnapshot(
      txQuery,
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        txLoaded = true;
        maybeStopLoading();
      },
      (err) => {
        console.error("Failed to load transactions:", err.message);
        txLoaded = true;
        maybeStopLoading();
      }
    );

    // 10 most recent notifications — live
    const notifQuery = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubNotif = onSnapshot(notifQuery, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubUser();
      unsubTx();
      unsubNotif();
    };
  }, []);

  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleNotificationClick(notif) {
    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      const user = auth.currentUser;
      if (user) {
        try {
          const db = getFirestore();
          await updateDoc(
            doc(db, "users", user.uid, "notifications", notif.id),
            { read: true }
          );
        } catch (err) {
          console.error("Failed to mark notification as read:", err.message);
        }
      }
    }
  }

  async function handleClearNotifications() {
    const user = auth.currentUser;
    if (!user) return;

    const previous = notifications;
    setNotifications([]); // clear instantly in the UI

    try {
      const db = getFirestore();
      await Promise.all(
        previous.map((n) =>
          deleteDoc(doc(db, "users", user.uid, "notifications", n.id))
        )
      );
    } catch (err) {
      console.error("Failed to clear notifications:", err.message);
      setNotifications(previous); // roll back if it failed
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-2xl font-bold text-neutral-900">
            {greeting}, {loading ? "…" : fullName || "there"}
            <GreetingIcon className="ml-2 inline-block text-orange-500" size={23} aria-hidden="true" />
          </p>
          <p className="mt-1 text-sm text-neutral-500">Here&apos;s your financial overview for today.</p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                aria-label="Notifications"
                aria-haspopup="true"
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-100
                           text-orange-600 hover:bg-orange-200 transition-colors focus:outline-none"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center
                               rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  className="absolute right-0 z-10 mt-2 w-72 max-h-80 overflow-y-auto rounded-2xl
                             border border-neutral-200 bg-white py-2 shadow-lg"
                >
                  {notifications.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-1.5 mb-1 border-b border-neutral-100">
                      <span className="text-xs font-semibold text-neutral-500">
                        Notifications
                      </span>
                      <button
                        type="button"
                        onClick={handleClearNotifications}
                        className="text-xs font-semibold text-orange-600 hover:underline focus:outline-none"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-neutral-400">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        type="button"
                        onClick={() => handleNotificationClick(notif)}
                        className={`flex w-full items-start gap-2 px-4 py-3 text-left text-sm
                                    hover:bg-orange-50 transition-colors focus:outline-none
                                    ${notif.read ? "opacity-60" : ""}`}
                      >
                        {!notif.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                        )}
                        <span className={notif.read ? "ml-4" : ""}>
                          <p className="font-semibold text-neutral-900">
                            {notif.title}
                          </p>
                          {notif.message && (
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {notif.message}
                            </p>
                          )}
                          <p className="text-xs text-neutral-400 mt-1">
                            {formatDate(notif.createdAt)}
                          </p>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

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
      <div className="rounded-3xl bg-linear-to-br from-orange-400 to-orange-600 px-8 py-7 text-white mb-8">
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
            : settings.privacy.showBalance && balanceVisible
            ? formatCurrency(balance)
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
            const isExpanded = expandedTxId === tx.id;
            const { date: fullDate, time: fullTime } = formatFullDateTime(tx.createdAt);

            return (
              <div
                key={tx.id}
                className="rounded-2xl border border-transparent hover:border-neutral-200
                           transition-colors"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTxId((current) => (current === tx.id ? null : tx.id))
                  }
                  aria-expanded={isExpanded}
                  className="flex w-full items-center gap-4 py-1 text-left focus:outline-none"
                >
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
                      {formatSigned(tx.amount, formatCurrency)}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-neutral-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="ml-14 mr-2 mb-3 mt-1 space-y-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Amount</span>
                      <span
                        className={`font-medium ${
                          isIncome ? "text-green-600" : "text-neutral-900"
                        }`}
                      >
                        {formatSigned(tx.amount, formatCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Category</span>
                      <span className="font-medium text-neutral-900">
                        {tx.category}
                      </span>
                    </div>
                    {tx.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Payment method</span>
                        <span className="font-medium text-neutral-900">
                          {tx.paymentMethod}
                        </span>
                      </div>
                    )}
                    {tx.recipient && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">
                          {isIncome ? "From" : "To"}
                        </span>
                        <span className="font-medium text-neutral-900">
                          {tx.recipient}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Date</span>
                      <span className="font-medium text-neutral-900">{fullDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Time</span>
                      <span className="font-medium text-neutral-900">{fullTime}</span>
                    </div>
                    {tx.note && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Note</span>
                        <span className="font-medium text-neutral-900">{tx.note}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Reference</span>
                      <span className="font-mono text-xs text-neutral-500">{tx.id}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => navigate("/dashboard/transactions")}
        className="mt-5 text-sm font-semibold text-orange-600 hover:text-orange-700"
      >
        See more <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}