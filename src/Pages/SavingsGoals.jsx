import { useEffect, useState } from "react";
import { auth } from "../Config/firebase";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { PiggyBank, Home as HomeIcon, Plane, Laptop, Landmark, X } from "lucide-react";

const GOAL_ICONS = {
  "Emergency Funds": PiggyBank,
  "Vacation Trip": Plane,
  "New Laptop": Laptop,
  "House Deposit": Landmark,
};

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Live listener — updates automatically whenever a goal changes
    const unsubscribe = onSnapshot(
      collection(getFirestore(), "users", user.uid, "savingsGoals"),
      (snap) => {
        setGoals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load savings goals:", err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const totalSaved = goals.reduce((sum, g) => sum + (g.saved || 0), 0);

  async function handleCreateGoal(e) {
    e.preventDefault();
    const numericTarget = Number(target);
    if (!name.trim() || !numericTarget || numericTarget <= 0) {
      alert("Please enter a goal name and a valid target amount");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setIsSubmitting(true);
    try {
      await addDoc(
        collection(getFirestore(), "users", user.uid, "savingsGoals"),
        {
          name: name.trim(),
          target: numericTarget,
          saved: 0,
          createdAt: serverTimestamp(),
        }
      );
      setName("");
      setTarget("");
      setShowNewGoal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddFunds(goalId, currentSaved) {
    const input = prompt("How much would you like to add to this goal?");
    const amount = Number(input);
    if (!input || isNaN(amount) || amount <= 0) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(
        doc(getFirestore(), "users", user.uid, "savingsGoals", goalId),
        { saved: currentSaved + amount }
      );
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Savings Goals</h1>
        <button
          type="button"
          onClick={() => setShowNewGoal(true)}
          className="rounded-full bg-orange-500 hover:bg-orange-600
                     transition-colors text-white text-sm font-semibold
                     px-5 py-2.5 focus:outline-none focus-visible:ring-2
                     focus-visible:ring-orange-400"
        >
          + New Goal
        </button>
      </div>

      {/* Total Saved card */}
      <div className="rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 px-8 py-7 text-white mb-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90 mb-1">Total Saved</p>
          <p className="text-3xl font-bold">{formatNaira(totalSaved)}</p>
        </div>
        <PiggyBank size={40} className="opacity-90" />
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : goals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 px-8 py-16 text-center">
          <p className="text-neutral-600 mb-1">No savings goals yet.</p>
          <p className="text-sm text-neutral-400">
            Tap &quot;+ New Goal&quot; to create your first one.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const Icon = GOAL_ICONS[goal.name] || PiggyBank;
            const percent =
              goal.target > 0
                ? Math.min(Math.round(((goal.saved || 0) / goal.target) * 100), 100)
                : 0;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => handleAddFunds(goal.id, goal.saved || 0)}
                className="w-full flex items-center gap-4 rounded-2xl border border-neutral-200
                           px-5 py-4 text-left hover:border-orange-300 transition-colors"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Icon size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900 mb-1">
                    {goal.name}
                  </p>
                  <div className="h-1.5 w-full rounded-full bg-neutral-100 mb-1">
                    <div
                      className="h-1.5 rounded-full bg-orange-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500">
                    {formatNaira(goal.saved || 0)}/{formatNaira(goal.target)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-neutral-700">
                  {percent}%
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* New Goal modal */}
      {showNewGoal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-3xl px-8 py-8 w-full max-w-sm relative">
            <button
              type="button"
              onClick={() => setShowNewGoal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-600"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold text-neutral-900 mb-6">
              New Savings Goal
            </h2>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Goal name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="e.g. Vacation Trip"
                  disabled={isSubmitting}
                  className="w-full rounded-full border border-neutral-300 px-5 py-3
                             text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Target amount
                </label>
                <input
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  type="number"
                  min="0"
                  placeholder="₦ 0.00"
                  disabled={isSubmitting}
                  className="w-full rounded-full border border-neutral-300 px-5 py-3
                             text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-orange-500 hover:bg-orange-600
                           transition-colors text-white font-semibold py-3
                           disabled:bg-orange-300"
              >
                {isSubmitting ? "Creating…" : "Create Goal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}