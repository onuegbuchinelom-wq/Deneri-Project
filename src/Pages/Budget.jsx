import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config/firebase";
import { useSettings } from "../Components/SettingsProvider";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { Home as HomeIcon, Car, Utensils, Gamepad2, PiggyBank } from "lucide-react";

const CATEGORY_ICONS = {
  Needs: HomeIcon,
  Transport: Car,
  "Foods & Dining": Utensils,
  Entertainment: Gamepad2,
  "Savings & Investments": PiggyBank,
};

export default function Budget() {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Live listener — bars update in real time as spending changes,
    // even while you're sitting on this page.
    const unsubscribe = onSnapshot(
      doc(getFirestore(), "users", user.uid),
      (snap) => {
        setBudget(snap.exists() ? snap.data().budget || null : null);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load budget:", err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-8">
        <p className="text-neutral-500">Loading budget…</p>
      </div>
    );
  }

  // No budget set up yet
  if (!budget) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">Budget</h1>
        <div className="rounded-3xl border border-dashed border-neutral-300 px-8 py-16 text-center">
          <p className="text-neutral-600 mb-1">
            You haven&apos;t set up a budget yet.
          </p>
          <p className="text-sm text-neutral-400 mb-6">
            Set your income and spending priorities to get started.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard/budget-setup")}
            className="rounded-full bg-orange-500 hover:bg-orange-600
                       transition-colors text-white text-sm font-semibold
                       px-6 py-3 focus:outline-none focus-visible:ring-2
                       focus-visible:ring-orange-400"
          >
            Set up budget
          </button>
        </div>
      </div>
    );
  }

  const { total, categories = {} } = budget;
  const totalSpent = Object.values(categories).reduce(
    (sum, c) => sum + (c.spent || 0),
    0
  );
  const remaining = Math.max(total - totalSpent, 0);
  const percent = total > 0 ? Math.min(Math.round((totalSpent / total) * 100), 100) : 0;

  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Budget</h1>
        <span className="text-sm text-neutral-500">{monthLabel}</span>
      </div>

      {/* Overall Budget card */}
      <div className="rounded-3xl bg-linear-to-br from-orange-400 to-orange-600 px-8 py-7 text-white mb-10">
        <p className="text-sm font-medium opacity-90 mb-2">Overall Budget</p>
        <p className="text-3xl font-bold mb-4">
          {formatCurrency(totalSpent)}{" "}
          <span className="text-lg font-medium opacity-80">
            of {formatCurrency(total)}
          </span>
        </p>

        <div className="h-2 w-full rounded-full bg-white/30 mb-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-white transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs opacity-90">
          <span>Remaining {formatCurrency(remaining)}</span>
          <span>{percent}%</span>
        </div>
      </div>

      {/* Category breakdown */}
      <h2 className="text-lg font-bold text-neutral-900 mb-4">
        Category breakdown
      </h2>
      <div className="space-y-4">
        {Object.entries(categories).map(([name, { spent = 0, limit = 0 }]) => {
          const Icon = CATEGORY_ICONS[name] || HomeIcon;
          const catPercent = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;

          return (
            <div
              key={name}
              className="flex items-center gap-4 rounded-2xl border border-neutral-200 px-5 py-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Icon size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900 mb-1">
                  {name}
                </p>
                <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-orange-500 transition-all duration-700 ease-out"
                    style={{ width: `${catPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-neutral-500 whitespace-nowrap">
                {formatCurrency(spent)}/{formatCurrency(limit)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}