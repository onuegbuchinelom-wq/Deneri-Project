// src/Pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Send,
  PiggyBank,
  TrendingUp,
  BarChart2,
  MoreHorizontal,
} from "lucide-react";
import { auth, db } from "../Config/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

// Icon/label/color lookup for transaction categories
const CATEGORY_META = {
  needs: { label: "Needs", color: "#F97316" },
  transport: { label: "Transport", color: "#3B82F6" },
  foodsAndDining: { label: "Foods & Dining", color: "#EF4444" },
  entertainment: { label: "Entertainment", color: "#A855F7" },
  shopping: { label: "Shopping", color: "#EC4899" },
  savingsAndInvestment: { label: "Savings & Investment", color: "#22C55E" },
  income: { label: "Income", color: "#22C55E" },
};

const QUICK_ACTIONS = [
  { key: "add-expense", label: "Add expenses", icon: Send, path: "/dashboard/add-expense" },
  { key: "budget", label: "Budget", icon: PiggyBank, path: "/dashboard/budget" },
  { key: "savings", label: "Savings", icon: TrendingUp, path: "/dashboard/savings" },
  { key: "analytics", label: "Analytics", icon: BarChart2, path: "/dashboard/analytics" },
  { key: "more", label: "More", icon: MoreHorizontal, path: "/dashboard/profile" },
];

function formatNaira(amount) {
  return `₦${Math.abs(amount).toLocaleString()}`;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatRelativeDate(date) {
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (isSameDay) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user.");

      // --- Read user profile + cached balance ---
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("User profile not found.");
      const userData = userSnap.data();

      // --- Read 5 most recent transactions ---
      const txRef = collection(db, "users", user.uid, "transactions");
      const recentQuery = query(txRef, orderBy("date", "desc"), limit(5));
      const recentSnap = await getDocs(recentQuery);

      const recentTransactions = recentSnap.docs.map((d) => {
        const tx = d.data();
        const jsDate = tx.date instanceof Timestamp ? tx.date.toDate() : new Date(tx.date);
        return {
          id: d.id,
          name: tx.name,
          category: tx.category,
          type: tx.type,
          amount: tx.amount,
          dateLabel: formatRelativeDate(jsDate),
        };
      });

      // --- Compute this-month vs last-month spend (client-side aggregation) ---
      const allTxSnap = await getDocs(txRef);
      const thisMonthStart = startOfMonth();
      const lastMonthStart = startOfMonth(
        new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth() - 1, 1)
      );

      let thisMonthSpend = 0;
      let lastMonthSpend = 0;

      allTxSnap.docs.forEach((d) => {
        const tx = d.data();
        if (tx.type !== "expense") return;
        const jsDate = tx.date instanceof Timestamp ? tx.date.toDate() : new Date(tx.date);
        if (jsDate >= thisMonthStart) {
          thisMonthSpend += tx.amount;
        } else if (jsDate >= lastMonthStart && jsDate < thisMonthStart) {
          lastMonthSpend += tx.amount;
        }
      });

      const percentVsLastMonth =
        lastMonthSpend > 0 ? ((thisMonthSpend - lastMonthSpend) / lastMonthSpend) * 100 : null;

      // --- Budget progress % (spend this month / monthly income) ---
      const monthlyIncome = userData.budget?.income?.amount
        ? userData.budget.income.frequency === "weekly"
          ? userData.budget.income.amount * 4
          : userData.budget.income.amount
        : null;
      const budgetProgressPercent = monthlyIncome
        ? Math.min(100, Math.round((thisMonthSpend / monthlyIncome) * 100))
        : null;

      return {
        firstName: userData.firstName || "",
        totalBalance: userData.totalBalance ?? 0,
        percentVsLastMonth,
        budgetProgressPercent,
        recentTransactions,
      };
    }

    loadHomeData()
      .then((homeData) => {
        if (!cancelled) setData(homeData);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("Couldn't load your dashboard. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">HELLO!</p>
          <h1 className="text-2xl font-bold text-gray-900">{data.firstName}</h1>
        </div>
        <span className="text-gray-400 text-sm">{monthLabel}</span>
      </div>

      {/* Total balance card */}
      <div className="rounded-2xl p-6 mb-8 text-white bg-gradient-to-r from-orange-400 to-orange-600">
        <div className="flex items-center gap-2 mb-2 text-sm opacity-90">
          <span>Total Balance</span>
          <button onClick={() => setShowBalance((v) => !v)} aria-label="Toggle balance visibility">
            {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        <p className="text-3xl font-bold mb-3">
          {showBalance ? formatNaira(data.totalBalance) : "₦••••••"}
        </p>
        {data.budgetProgressPercent !== null && (
          <>
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${data.budgetProgressPercent}%` }}
              />
            </div>
            <p className="text-xs opacity-90">
              {data.percentVsLastMonth !== null
                ? `${data.percentVsLastMonth >= 0 ? "+" : ""}${data.percentVsLastMonth.toFixed(1)}% vs last month`
                : "No spending history yet"}
            </p>
          </>
        )}
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-5 gap-3 mb-8">
        {QUICK_ACTIONS.map(({ key, label, icon: Icon, path }) => (
          <button
            key={key}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 border border-gray-200 rounded-xl py-4 hover:border-orange-400 transition-colors"
          >
            <Icon size={20} className="text-gray-700" />
            <span className="text-xs text-gray-600 text-center px-1">{label}</span>
          </button>
        ))}
      </div>

      {/* Recent transactions */}
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Recent transactions</h2>
      <div className="space-y-4">
        {data.recentTransactions.length === 0 && (
          <p className="text-sm text-gray-400">No transactions yet.</p>
        )}
        {data.recentTransactions.map((tx) => {
          const meta = CATEGORY_META[tx.type === "income" ? "income" : tx.category] || {};
          const isIncome = tx.type === "income";
          return (
            <div key={tx.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: meta.color || "#9CA3AF" }}
                >
                  {tx.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.name}</p>
                  <p className="text-xs text-gray-400">{meta.label || tx.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${isIncome ? "text-green-500" : "text-gray-900"}`}>
                  {isIncome ? "+" : "-"}
                  {formatNaira(tx.amount)}
                </p>
                <p className="text-xs text-gray-400">{tx.dateLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}