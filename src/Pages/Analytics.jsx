import { useEffect, useMemo, useState } from "react";
import { auth } from "../Config/firebase";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const CATEGORY_COLORS = {
  Needs: "#3B82F6",
  "Food & Dining": "#22C55E",
  "Foods & Dining": "#22C55E",
  Transport: "#F97316",
  Entertainment: "#A855F7",
  "Savings & Investments": "#14B8A6",
  Shopping: "#EC4899",
};

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

// Simple back-chevron icon — no external icon package required
function ChevronLeftIcon(props) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function Analytics() {
  const [budget, setBudget] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const db = getFirestore();

        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setBudget(userSnap.data().budget || null);
        }

        const txQuery = query(
          collection(db, "users", user.uid, "transactions"),
          orderBy("createdAt", "asc")
        );
        const txSnap = await getDocs(txQuery);
        setTransactions(txSnap.docs.map((d) => d.data()));
      } catch (err) {
        console.error("Failed to load analytics:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Spending by category — from budget.categories' `spent` values
  const categoryData = useMemo(() => {
    if (!budget?.categories) return [];
    return Object.entries(budget.categories)
      .filter(([, c]) => c.spent > 0)
      .map(([name, c]) => ({ name, value: c.spent }));
  }, [budget]);

  const totalSpent = categoryData.reduce((sum, c) => sum + c.value, 0);

  // Monthly trend — sum of expenses (negative amounts) grouped by month
  const monthlyTrend = useMemo(() => {
    const byMonth = {};
    transactions.forEach((tx) => {
      if (tx.amount >= 0 || !tx.createdAt?.toDate) return;
      const date = tx.createdAt.toDate();
      const key = date.toLocaleDateString("en-US", { month: "short" });
      byMonth[key] = (byMonth[key] || 0) + Math.abs(tx.amount);
    });
    return Object.entries(byMonth).map(([month, total]) => ({ month, total }));
  }, [transactions]);

  // NEW: month-over-month change, derived from monthlyTrend (no new data source)
  const monthlyChange = useMemo(() => {
    if (monthlyTrend.length < 2) return null;
    const last = monthlyTrend[monthlyTrend.length - 1];
    const prev = monthlyTrend[monthlyTrend.length - 2];
    if (!prev.total) return null;
    const percent = ((last.total - prev.total) / prev.total) * 100;
    return { percent, prevMonth: prev.month };
  }, [monthlyTrend]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-8">
        <p className="text-neutral-500">Loading analytics…</p>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            aria-label="Go back"
            className="text-neutral-500 hover:text-neutral-900"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-xl font-bold text-neutral-900">Analytics</h1>
        </div>
        <div className="rounded-3xl border border-dashed border-neutral-300 px-8 py-16 text-center">
          <p className="text-neutral-600 mb-1">No spending data yet.</p>
          <p className="text-sm text-neutral-400">
            Add an expense and set up your budget to see analytics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header with back chevron */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="Go back"
          className="text-neutral-500 hover:text-neutral-900"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-xl font-bold text-neutral-900">Analytics</h1>
      </div>

      {/* Overall spent */}
      <div className="rounded-2xl border border-neutral-200 px-8 py-6 mb-10">
        <p className="text-sm text-neutral-500 mb-1">Overall spent</p>
        <p className="text-4xl font-bold text-neutral-900">
          {formatNaira(totalSpent)}
        </p>
        {monthlyChange && (
          <p
            className={`text-xs mt-2 font-medium ${
              monthlyChange.percent <= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {monthlyChange.percent <= 0 ? "▼" : "▲"}{" "}
            {Math.abs(monthlyChange.percent).toFixed(1)}% vs {monthlyChange.prevMonth}
          </p>
        )}
      </div>

      {/* Spending by category */}
      <h2 className="text-sm font-semibold text-neutral-500 mb-2">
        Spending by Category
      </h2>
      <div className="flex items-center gap-8 mb-10">
        <div style={{ width: 160, height: 160 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={categoryData.length > 1 ? 2 : 0}
              >
                {categoryData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[entry.name] || "#94A3B8"}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNaira(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {categoryData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: CATEGORY_COLORS[entry.name] || "#94A3B8",
                }}
              />
              <span className="text-neutral-700">{entry.name}</span>
              <span className="text-neutral-400">
                {totalSpent > 0 ? Math.round((entry.value / totalSpent) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly trend */}
      <h2 className="text-sm font-semibold text-neutral-500 mb-2">
        Monthly Trend
      </h2>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={monthlyTrend}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => formatNaira(v)} />
            <Tooltip formatter={(value) => formatNaira(value)} />
            <Bar dataKey="total" fill="#F97316" radius={[6, 6, 0, 0]} barSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}