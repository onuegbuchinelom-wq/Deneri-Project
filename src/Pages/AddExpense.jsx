import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../Config/firebase";
import { useSettings } from "../Components/SettingsProvider";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
  increment,
  writeBatch,
} from "firebase/firestore";

const CATEGORIES = [
  "Needs",
  "Transport",
  "Foods & Dining",
  "Entertainment",
  "Savings & Investments",
  "Income",
];

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Card"];

export default function AddExpense() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10) // yyyy-mm-dd, defaults to today
  );
  const [paymentMethod, setPaymentMethod] = useState("");
  const [bankAccounts, setBankAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [loadingPaymentOptions, setLoadingPaymentOptions] = useState(true);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { formatCurrency, settings } = useSettings();

  useEffect(() => {
    async function loadPaymentOptions() {
      const user = auth.currentUser;
      if (!user) {
        setLoadingPaymentOptions(false);
        return;
      }
      try {
        const db = getFirestore();
        const [bankSnap, cardSnap] = await Promise.all([
          getDocs(collection(db, "users", user.uid, "bankAccounts")),
          getDocs(collection(db, "users", user.uid, "cards")),
        ]);
        setBankAccounts(bankSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setCards(cardSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Failed to load payment options:", err.message);
      } finally {
        setLoadingPaymentOptions(false);
      }
    }
    loadPaymentOptions();
  }, []);

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

    // Build a readable payment method label, e.g. "GTBank •••• 8785" or "Visa •••• 4321"
    let resolvedPaymentMethod = paymentMethod;
    if (paymentMethod === "Bank Transfer") {
      const acc = bankAccounts.find((a) => a.id === selectedBankAccountId);
      if (!acc) {
        alert("Please select a bank account");
        return;
      }
      resolvedPaymentMethod = `${acc.bankName} •••• ${String(
        acc.accountNumber
      ).slice(-4)}`;
    } else if (paymentMethod === "Card") {
      const card = cards.find((c) => c.id === selectedCardId);
      if (!card) {
        alert("Please select a card");
        return;
      }
      resolvedPaymentMethod = `${card.nickname} •••• ${card.last4}`;
    }

    setIsSubmitting(true);
    try {
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const batch = writeBatch(db);
      const timestamp = serverTimestamp();
      const transactionRef = doc(
        collection(db, "users", user.uid, "transactions")
      );
      const notificationRef = doc(
        collection(db, "users", user.uid, "notifications")
      );

      if (settings.privacy.saveHistory) {
        batch.set(transactionRef, {
          title: notes.trim() || category,
          category,
          amount: signedAmount,
          paymentMethod: resolvedPaymentMethod,
          date,
          createdAt: timestamp,
        });
      }

      // Notify the user that this transaction was logged
      const isIncome = category === "Income";
      if (settings.notifications.master && settings.notifications.expenseAdded) {
        batch.set(notificationRef, {
          title: isIncome ? "Income added" : "Expense added",
          message: `${isIncome ? "+" : "-"}${formatCurrency(numericAmount)} · ${notes.trim() || category}`,
          read: false,
          createdAt: timestamp,
        });
      }

      const updates = {
        balance:
          typeof userData.balance === "number"
            ? increment(signedAmount)
            : signedAmount,
      };

      // Only expenses (not Income) count against a budget category.
      // Only update it if that category actually exists in the saved budget,
      // i.e. the user picked it as a priority in the setup wizard.
      if (category !== "Income" && userData.budget?.categories?.[category]) {
        updates[`budget.categories.${category}.spent`] = increment(
          Math.abs(signedAmount)
        );
      }

      batch.update(userRef, updates);
      await batch.commit();

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
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setSelectedBankAccountId("");
              setSelectedCardId("");
            }}
            disabled={isSubmitting}
            required
            className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                       text-base text-neutral-800
                       focus:outline-none focus:ring-2 focus:ring-orange-400
                       disabled:bg-neutral-50"
          >
            <option value="" disabled>
              Select payment method
            </option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>

          {/* Bank Transfer: pick a saved bank account, or prompt to add one */}
          {paymentMethod === "Bank Transfer" && !loadingPaymentOptions && (
            <div className="mt-3">
              {bankAccounts.length === 0 ? (
                <p className="text-sm text-neutral-500 px-2">
                  You haven't added a bank account yet.{" "}
                  <Link
                    to="/dashboard/profile/bank-accounts"
                    className="font-semibold text-orange-600 hover:underline"
                  >
                    Add one in Profile →
                  </Link>
                </p>
              ) : (
                <select
                  value={selectedBankAccountId}
                  onChange={(e) => setSelectedBankAccountId(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                             text-base text-neutral-800
                             focus:outline-none focus:ring-2 focus:ring-orange-400
                             disabled:bg-neutral-50"
                >
                  <option value="" disabled>
                    Select a bank account
                  </option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} •••• {String(acc.accountNumber).slice(-4)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Card: pick a saved card, or prompt to add one */}
          {paymentMethod === "Card" && !loadingPaymentOptions && (
            <div className="mt-3">
              {cards.length === 0 ? (
                <p className="text-sm text-neutral-500 px-2">
                  You haven't added a card yet.{" "}
                  <Link
                    to="/dashboard/profile/bank-accounts"
                    className="font-semibold text-orange-600 hover:underline"
                  >
                    Add one in Profile →
                  </Link>
                </p>
              ) : (
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                             text-base text-neutral-800
                             focus:outline-none focus:ring-2 focus:ring-orange-400
                             disabled:bg-neutral-50"
                >
                  <option value="" disabled>
                    Select a card
                  </option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.nickname} •••• {card.last4}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
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