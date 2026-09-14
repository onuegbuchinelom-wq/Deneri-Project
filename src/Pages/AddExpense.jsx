// src/Pages/AddExpense.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { auth, db } from "../Config/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

// TODO: replace with real saved payment methods once Profile > Bank accounts is built
const PAYMENT_METHODS = ["Gtb.......8785", "Opay.......4021", "Cash"];

const CATEGORIES = [
  { value: "needs", label: "Needs" },
  { value: "transport", label: "Transport" },
  { value: "foodsAndDining", label: "Foods & Dining" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "savingsAndInvestment", label: "Savings & Investment" },
];

function todayFormatted() {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function AddExpense() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [name, setName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!name.trim()) {
      setError("Please give this expense a name.");
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user.");

      const userRef = doc(db, "users", user.uid);
      const transactionsRef = collection(db, "users", user.uid, "transactions");
      const notificationsRef = collection(db, "users", user.uid, "notifications");

      // 1. Write the transaction
      await addDoc(transactionsRef, {
        amount: parsedAmount,
        type: "expense",
        category,
        name: name.trim(),
        paymentMethod,
        notes,
        date: new Date(),
        createdAt: serverTimestamp(),
      });

      // 2. Update cached balance
      await updateDoc(userRef, {
        totalBalance: increment(-Math.abs(parsedAmount)),
      });

      // 3. Log a notification (client-side for now; move to a Cloud Function later
      //    without changing anything else on this page)
      await addDoc(notificationsRef, {
        type: "transaction",
        title: "Transaction",
        message: `₦${parsedAmount.toLocaleString()} spent at ${name.trim()}`,
        createdAt: serverTimestamp(),
        read: false,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong saving your expense.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
        <span className="text-sm text-gray-400">{todayFormatted()}</span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Groceries"
            className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-full border border-gray-200 pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Payment method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-full py-3 flex items-center justify-center gap-2"
        >
          {saving ? "Saving..." : "Save Expense"}
          {!saving && <ChevronRight size={18} />}
        </button>
      </form>
    </div>
  );
}