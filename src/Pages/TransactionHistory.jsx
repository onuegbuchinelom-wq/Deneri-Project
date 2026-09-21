import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config/firebase";
import { useSettings } from "../Components/SettingsProvider";
import {
  collection,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import { ChevronLeft, ChevronLeft as PreviousIcon, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

function formatDate(transaction) {
  const date = transactionDate(transaction);
  if (!date) return "Date unavailable";
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { formatCurrency, settings } = useSettings();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return undefined;
    }

    return onSnapshot(
      collection(getFirestore(), "users", user.uid, "transactions"),
      (snapshot) => {
        setTransactions(
          snapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }))
            .sort((first, second) => {
              const firstDate = transactionDate(first)?.getTime() || 0;
              const secondDate = transactionDate(second)?.getTime() || 0;
              return secondDate - firstDate;
            })
        );
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load transaction history:", error.message);
        setLoading(false);
      }
    );
  }, []);

  const years = useMemo(() => {
    const availableYears = transactions
      .map(transactionDate)
      .filter(Boolean)
      .map((date) => date.getFullYear());
    return [...new Set([new Date().getFullYear(), ...availableYears])].sort(
      (first, second) => second - first
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const date = transactionDate(transaction);
      if (year !== "all" && date?.getFullYear() !== Number(year)) return false;
      if (month !== "all" && date?.getMonth() !== Number(month)) return false;
      if (type === "expenses" && (transaction.amount >= 0 || isSavings(transaction))) {
        return false;
      }
      if (type === "savings" && !isSavings(transaction)) return false;
      if (!searchTerm) return true;

      return [transaction.title, transaction.category, transaction.paymentMethod]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchTerm));
    });
  }, [month, search, transactions, type, year]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const visibleTransactions = filteredTransactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [month, search, type, year]);

  if (!settings.privacy.saveHistory) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <h1 className="text-xl font-bold text-neutral-900">Transaction History</h1>
        <p className="mt-4 text-sm text-neutral-500">Transaction history is disabled in Privacy settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="text-neutral-500 hover:text-neutral-900"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Transaction History</h1>
          <p className="text-sm text-neutral-500">Expenses and savings in one place</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <select value={year} onChange={(event) => setYear(event.target.value)} className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
          <option value="all">All years</option>
          {years.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select value={month} onChange={(event) => setMonth(event.target.value)} className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
          <option value="all">All months</option>
          {MONTHS.map((value, index) => <option key={value} value={index}>{value}</option>)}
        </select>
        <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
          <option value="all">All types</option>
          <option value="expenses">Expenses</option>
          <option value="savings">Savings</option>
        </select>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search transactions"
          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading transactions...</p>
      ) : visibleTransactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center text-sm text-neutral-500">
          No transactions match these filters.
        </div>
      ) : (
        <div className="space-y-2">
          {visibleTransactions.map((transaction) => {
            const savings = isSavings(transaction);
            return (
              <div key={transaction.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${savings ? "bg-teal-500" : transaction.amount >= 0 ? "bg-green-500" : "bg-orange-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900">{transaction.title || transaction.category || "Transaction"}</p>
                  <p className="text-xs text-neutral-500">{savings ? "Savings" : transaction.amount >= 0 ? "Income" : "Expense"} · {transaction.category || "Uncategorized"}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-sm font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-neutral-900"}`}>{transaction.amount < 0 ? "-" : "+"}{formatCurrency(Math.abs(transaction.amount))}</p>
                  <p className="text-xs text-neutral-400">{formatDate(transaction)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredTransactions.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-neutral-500">
          <span>Page {page} of {pageCount}</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-neutral-200 p-2 disabled:opacity-40" aria-label="Previous page"><PreviousIcon size={16} /></button>
            <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-neutral-200 p-2 disabled:opacity-40" aria-label="Next page"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
