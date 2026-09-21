import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config/firebase";
import { useSettings } from "../Components/SettingsProvider";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import {
  Car,
  Home as HomeIcon,
  Utensils,
  Gamepad2,
  ShoppingBag,
  PiggyBank,
  Check,
} from "lucide-react";

const INCOME_PRESETS = [250000, 500000, 750000];

const PRIORITY_OPTIONS = [
  { key: "Transport", label: "Transport", sub: "Fuel, public transport", icon: Car },
  { key: "Needs", label: "Needs", sub: "Rent, groceries, bills", icon: HomeIcon },
  { key: "Foods & Dining", label: "Foods & Dining", sub: "Meals, Restaurant", icon: Utensils },
  { key: "Entertainment", label: "Entertainment", sub: "Movies, games, subscription", icon: Gamepad2 },
  { key: "Shopping", label: "Shopping", sub: "Clothing, Gadgets", icon: ShoppingBag },
  { key: "Savings & Investments", label: "Savings & Investment", sub: "Build your future", icon: PiggyBank },
];

export default function BudgetSetup() {
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState(INCOME_PRESETS[1]);
  const [customIncome, setCustomIncome] = useState("");
  const [isWeekly, setIsWeekly] = useState(false);
  const [priorities, setPriorities] = useState(
    new Set(["Transport", "Needs", "Foods & Dining", "Savings & Investments"])
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  function togglePriority(key) {
    setPriorities((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function handleFinish() {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in to set up a budget");
      return;
    }
    if (priorities.size === 0) {
      alert("Please select at least one spending priority");
      return;
    }

    // Monthly total: if the user picked "weekly", scale it up ×4
    const monthlyTotal = isWeekly ? income * 4 : income;

    // Even split of the total across the selected priority categories
    const perCategory = Math.round(monthlyTotal / priorities.size);
    const categories = {};
    priorities.forEach((key) => {
      categories[key] = { spent: 0, limit: perCategory };
    });

    setIsSubmitting(true);
    try {
      await setDoc(
        doc(getFirestore(), "users", user.uid),
        {
          budget: { total: monthlyTotal, categories },
          // Home's balance starts at the budget total, then AddExpense.jsx
          // decrements it as expenses are logged.
          balance: monthlyTotal,
        },
        { merge: true }
      );
      navigate("/dashboard/budget");
    } catch (err) {
      alert(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">
        Let&apos;s create your budget
      </h1>

      {/* Step 1 & 2 share the same income-picker layout */}
      {(step === 1 || step === 2) && (
        <div className="text-center">
          <p className="text-lg font-medium text-neutral-800 mb-8">
            What&apos;s your {step === 1 ? "monthly" : "weekly"} income?
          </p>

          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border-4 border-orange-400">
            <span className="text-sm font-semibold text-neutral-800 px-2 text-center">
              {formatCurrency(customIncome || income)}
            </span>
          </div>

          <div className="flex justify-center gap-2 mb-2">
            {INCOME_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setIncome(preset);
                  setCustomIncome("");
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  income === preset && !customIncome
                    ? "bg-orange-400 text-white"
                    : "bg-orange-50 text-neutral-700 hover:bg-orange-100"
                }`}
              >
                {formatCurrency(preset)}
              </button>
            ))}
            <input
              type="number"
              min="0"
              placeholder="Other"
              value={customIncome}
              onChange={(e) => setCustomIncome(e.target.value)}
              className="w-24 rounded-xl bg-orange-50 px-3 py-2 text-sm text-center
                         placeholder:text-neutral-400 focus:outline-none focus:ring-2
                         focus:ring-orange-400"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsWeekly((v) => !v)}
            className="text-sm text-orange-500 font-medium mb-8"
          >
            or {step === 1 ? "weekly?" : "monthly?"}
          </button>

          <button
            type="button"
            onClick={() => {
              const finalIncome = Number(customIncome) || income;
              setIncome(finalIncome);
              setCustomIncome("");
              setStep(step + 1);
            }}
            className="w-full rounded-full bg-orange-500 hover:bg-orange-600
                       active:bg-orange-700 transition-colors text-white text-lg
                       font-semibold py-4"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 3 — spending priorities */}
      {step === 3 && (
        <div>
          <p className="text-lg font-medium text-neutral-800 mb-6 text-center">
            What&apos;s your spending priority?
          </p>

          <div className="space-y-3 mb-8">
            {PRIORITY_OPTIONS.map(({ key, label, sub, icon: Icon }) => {
              const isSelected = priorities.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePriority(key)}
                  className={`w-full flex items-center gap-4 rounded-2xl border px-5 py-3.5
                              text-left transition-colors ${
                    isSelected
                      ? "border-orange-300 bg-orange-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <Icon size={16} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-neutral-900">
                      {label}
                    </span>
                    <span className="block text-xs text-neutral-500">{sub}</span>
                  </span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-orange-500 bg-orange-500"
                        : "border-neutral-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <Check size={14} strokeWidth={3} className="text-white" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleFinish}
            disabled={isSubmitting}
            className="w-full rounded-full bg-orange-500 hover:bg-orange-600
                       active:bg-orange-700 transition-colors text-white text-lg
                       font-semibold py-4 disabled:bg-orange-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving…" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}