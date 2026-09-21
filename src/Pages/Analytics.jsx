import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config/firebase";
import { useSettings } from "../Components/SettingsProvider";
import { collection, doc, getFirestore, onSnapshot } from "firebase/firestore";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CATEGORY_COLORS = {
  Needs: "#3B82F6",
  "Food & Dining": "#22C55E",
  "Foods & Dining": "#22C55E",
  Transport: "#F97316",
  Entertainment: "#A855F7",
  Shopping: "#EC4899",
};

function formatCompactAmount(amount, formatCurrency) {
  const value = Number(amount || 0);
  if (value >= 1000000) return `${formatCurrency(value / 1000000)}m`;
  if (value >= 1000) return `${formatCurrency(value / 1000)}k`;
  return formatCurrency(value);
}

function transactionDate(transaction) {
  if (transaction.createdAt?.toDate) return transaction.createdAt.toDate();
  if (transaction.date) {
    const date = new Date(`${transaction.date}T00:00:00`);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

function isSavings(transaction) {
  return transaction.category === "Savings & Investments";
}

function ChevronLeftIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { formatCurrency, settings } = useSettings();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return undefined;
    }

    const db = getFirestore();
    let userLoaded = false;
    let transactionsLoaded = false;
    const finishLoading = () => {
      if (userLoaded && transactionsLoaded) setLoading(false);
    };

    const unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setBalance(snapshot.exists() ? Number(snapshot.data().balance || 0) : 0);
      userLoaded = true;
      finishLoading();
    }, (error) => {
      console.error("Failed to load analytics balance:", error.message);
      userLoaded = true;
      finishLoading();
    });

    const unsubscribeTransactions = onSnapshot(
      collection(db, "users", user.uid, "transactions"),
      (snapshot) => {
        setTransactions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        transactionsLoaded = true;
        finishLoading();
      },
      (error) => {
        console.error("Failed to load analytics transactions:", error.message);
        transactionsLoaded = true;
        finishLoading();
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, []);

  const years = useMemo(() => {
    const values = transactions
      .map(transactionDate)
      .filter(Boolean)
      .map((date) => date.getFullYear());
    return [...new Set([new Date().getFullYear(), ...values])].sort((a, b) => b - a);
  }, [transactions]);

  const filteredTransactions = useMemo(() => transactions.filter((transaction) => {
    const date = transactionDate(transaction);
    if (year !== "all" && date?.getFullYear() !== Number(year)) return false;
    if (month !== "all" && date?.getMonth() !== Number(month)) return false;
    if (type === "expenses" && (transaction.amount >= 0 || isSavings(transaction))) return false;
    if (type === "savings" && !isSavings(transaction)) return false;
    return transaction.amount < 0;
  }), [month, transactions, type, year]);

  const totals = useMemo(() => filteredTransactions.reduce((result, transaction) => {
    const amount = Math.abs(Number(transaction.amount || 0));
    if (isSavings(transaction)) result.savings += amount;
    else result.expenses += amount;
    return result;
  }, { expenses: 0, savings: 0 }), [filteredTransactions]);

  const categoryData = useMemo(() => {
    const byCategory = {};
    filteredTransactions.forEach((transaction) => {
      if (isSavings(transaction)) return;
      const category = transaction.category || "Other";
      byCategory[category] = (byCategory[category] || 0) + Math.abs(Number(transaction.amount || 0));
    });
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((first, second) => second.value - first.value);
  }, [filteredTransactions]);

  const monthlyTrend = useMemo(() => {
    const byMonth = {};
    filteredTransactions.forEach((transaction) => {
      const date = transactionDate(transaction);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[key]) {
        byMonth[key] = {
          key,
          month: date.toLocaleDateString("en-US", { month: "short" }),
          year: date.getFullYear(),
          expenses: 0,
          savings: 0,
        };
      }
      byMonth[key][isSavings(transaction) ? "savings" : "expenses"] += Math.abs(Number(transaction.amount || 0));
    });
    return Object.values(byMonth).sort((first, second) => first.key.localeCompare(second.key));
  }, [filteredTransactions]);

  const chartData = monthlyTrend.map((item) => ({
    ...item,
    total: type === "savings" ? item.savings : type === "expenses" ? item.expenses : item.expenses + item.savings,
    label: `${item.month} ${String(item.year).slice(-2)}`,
  }));
  const totalTracked = totals.expenses + totals.savings;

  if (loading) {
    return <div className="max-w-4xl mx-auto px-8 py-8"><p className="text-neutral-500">Loading analytics...</p></div>;
  }

  if (!settings.privacy.analytics) {
    return <div className="max-w-4xl mx-auto px-8 py-8"><h1 className="text-xl font-bold text-neutral-900">Analytics</h1><p className="mt-4 text-sm text-neutral-500">Analytics is disabled in Privacy settings.</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="text-neutral-500 hover:text-neutral-900"><ChevronLeftIcon /></button>
        <h1 className="text-xl font-bold text-neutral-900">Analytics</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mb-8">
        <select value={year} onChange={(event) => setYear(event.target.value)} className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
          <option value="all">All years</option>
          {years.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select value={month} onChange={(event) => setMonth(event.target.value)} className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
          <option value="all">All months</option>
          {Array.from({ length: 12 }, (_, index) => <option key={index} value={index}>{new Date(2000, index).toLocaleDateString("en-US", { month: "long" })}</option>)}
        </select>
        <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
          <option value="all">All transactions</option>
          <option value="expenses">Expenses</option>
          <option value="savings">Savings</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="rounded-2xl border border-neutral-200 px-4 py-4"><p className="text-xs text-neutral-500">Total expenses</p><p className="text-xl font-bold text-neutral-900">{formatCurrency(totals.expenses)}</p></div>
        <div className="rounded-2xl border border-neutral-200 px-4 py-4"><p className="text-xs text-neutral-500">Total savings</p><p className="text-xl font-bold text-neutral-900">{formatCurrency(totals.savings)}</p></div>
        <div className="rounded-2xl border border-neutral-200 px-4 py-4"><p className="text-xs text-neutral-500">Transactions</p><p className="text-xl font-bold text-neutral-900">{filteredTransactions.length}</p></div>
        <div className="rounded-2xl border border-neutral-200 px-4 py-4"><p className="text-xs text-neutral-500">Remaining money</p><p className="text-xl font-bold text-neutral-900">{formatCurrency(balance)}</p></div>
      </div>

      {categoryData.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-neutral-500 mb-2">Expense Categories</h2>
          <div className="flex flex-wrap items-center gap-8">
            <div style={{ width: 160, height: 160 }}><ResponsiveContainer><PieChart><Pie data={categoryData} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={categoryData.length > 1 ? 2 : 0}>{categoryData.map((entry) => <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#94A3B8"} />)}</Pie><Tooltip formatter={(value) => formatCurrency(value)} /></PieChart></ResponsiveContainer></div>
            <div className="space-y-2">{categoryData.map((entry) => <div key={entry.name} className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name] || "#94A3B8" }} /><span className="text-neutral-700">{entry.name}</span><span className="text-neutral-400">{totalTracked > 0 ? Math.round((entry.value / totalTracked) * 100) : 0}%</span></div>)}</div>
          </div>
        </>
      )}

      {chartData.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 px-8 py-16 text-center mt-10">
          <p className="text-neutral-600 mb-1">No transactions match these filters.</p>
          <button type="button" onClick={() => navigate("/dashboard/transactions")} className="mt-3 text-sm font-semibold text-orange-600">View transaction history</button>
        </div>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-neutral-500 mt-10 mb-2">Expense Overview</h2>
          <div className="w-full overflow-x-auto">
            <div className="min-w-130" style={{ height: 290 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 8 }} barCategoryGap="22%">
                  <XAxis dataKey="label" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} width={72} tickFormatter={(value) => formatCompactAmount(value, formatCurrency)} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value, name) => [formatCurrency(value), name === "savings" ? "Savings" : "Expenses"]} />
                  {type === "all" ? <><Bar dataKey="expenses" stackId="amount" fill="#F97316" maxBarSize={48} radius={[6, 6, 0, 0]} /><Bar dataKey="savings" stackId="amount" fill="#14B8A6" maxBarSize={48} /></> : <Bar dataKey="total" fill={type === "savings" ? "#14B8A6" : "#F97316"} maxBarSize={48} radius={[6, 6, 0, 0]} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <button type="button" onClick={() => navigate("/dashboard/transactions")} className="mt-8 text-sm font-semibold text-orange-600 hover:text-orange-700">View full transaction history <span aria-hidden="true">→</span></button>
    </div>
  );
}
