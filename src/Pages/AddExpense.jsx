import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config/firebase";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";

const CATEGORIES = [
  "Needs",
  "Transport",
  "Foods & Dining",
  "Entertainment",
  "Savings & Investments",
  "Income",
];

export default function AddExpense() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10) // yyyy-mm-dd, defaults to today
  );
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in to add an expense");
      return;
    }

    // Income category adds to balance, everything else subtracts
    const signedAmount =
      category === "Income" ? numericAmount : -numericAmount;

    setIsSubmitting(true);
    try {
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);

      await addDoc(collection(db, "users", user.uid, "transactions"), {
        title: notes.trim() || category,
        category,
        amount: signedAmount,
        paymentMethod,
        date,
        createdAt: serverTimestamp(),
      });

      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      const updates = {};

      // Balance
      updates.balance =
        typeof userData.balance === "number"
          ? increment(signedAmount)
          : signedAmount;

      // Only expenses (not Income) count against a budget category.
      // Only update it if that category actually exists in the saved budget,
      // i.e. the user picked it as a priority in the setup wizard.
      if (category !== "Income" && userData.budget?.categories?.[category]) {
        updates[`budget.categories.${category}.spent`] = increment(
          Math.abs(signedAmount)
        );
      }

      await updateDoc(userRef, updates);

      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Add Expense</h1>
        <span className="text-sm text-neutral-500">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-semibold text-neutral-900 mb-2"
          >
            Amount
          </label>
          <input
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="₦ 0.00"
            disabled={isSubmitting}
            className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                       text-base text-neutral-800 placeholder:text-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-orange-400
                       disabled:bg-neutral-50"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-semibold text-neutral-900 mb-2"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                       text-base text-neutral-800
                       focus:outline-none focus:ring-2 focus:ring-orange-400
                       disabled:bg-neutral-50"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-semibold text-neutral-900 mb-2"
          >
            Date
          </label>
          <input
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            disabled={isSubmitting}
            className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                       text-base text-neutral-800
                       focus:outline-none focus:ring-2 focus:ring-orange-400
                       disabled:bg-neutral-50"
          />
        </div>

        <div>
          <label
            htmlFor="paymentMethod"
            className="block text-sm font-semibold text-neutral-900 mb-2"
          >
            Payment method
          </label>
          <input
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            type="text"
            placeholder="e.g. GTB.....8785"
            disabled={isSubmitting}
            className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                       text-base text-neutral-800 placeholder:text-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-orange-400
                       disabled:bg-neutral-50"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-semibold text-neutral-900 mb-2"
          >
            Notes (optional)
          </label>
          <input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            type="text"
            placeholder="e.g. Groceries"
            disabled={isSubmitting}
            className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                       text-base text-neutral-800 placeholder:text-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-orange-400
                       disabled:bg-neutral-50"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 rounded-full bg-orange-500 hover:bg-orange-600
                     active:bg-orange-700 transition-colors text-white text-lg
                     font-semibold py-4 focus:outline-none focus-visible:ring-2
                     focus-visible:ring-orange-400 focus-visible:ring-offset-2
                     disabled:bg-orange-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving…" : "Save Expense"}
        </button>
      </form>
    </div>
  );
}