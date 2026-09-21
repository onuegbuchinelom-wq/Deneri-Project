import { useEffect, useMemo, useState } from "react";
import SubPageLayout from "../Components/SubPageLayout";
import { auth } from "../Config/firebase";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { Landmark, CreditCard, Trash2 } from "lucide-react";

const REGIONS = ["Nigeria"];

const BANKS_BY_REGION = {
  Nigeria: [
    "Access Bank",
    "Ecobank",
    "Fidelity Bank",
    "First Bank of Nigeria",
    "First City Monument Bank (FCMB)",
    "Globus Bank",
    "Guaranty Trust Bank (GTBank)",
    "Keystone Bank",
    "Kuda Bank",
    "Moniepoint",
    "Opay",
    "Paystack",
    "Polaris Bank",
    "Providus Bank",
    "Stanbic IBTC Bank",
    "Sterling Bank",
    "Union Bank",
    "United Bank for Africa (UBA)",
    "Unity Bank",
    "Wema Bank",
    "Zenith Bank",
  ],
};

const CARD_BRANDS = ["Visa", "Mastercard", "Verve", "American Express"];

function maskAccountNumber(number) {
  const digits = String(number || "");
  if (digits.length <= 4) return digits;
  return `•••• ${digits.slice(-4)}`;
}

export default function BankAccounts() {
  // Bank accounts state
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [region, setRegion] = useState(REGIONS[0]);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("Savings");
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Cards state
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [brand, setBrand] = useState(CARD_BRANDS[0]);
  const [last4, setLast4] = useState("");
  const [nickname, setNickname] = useState("");
  const [isSavingCard, setIsSavingCard] = useState(false);

  const bankOptions = useMemo(() => BANKS_BY_REGION[region] || [], [region]);

  useEffect(() => {
    async function loadAccounts() {
      const user = auth.currentUser;
      if (!user) {
        setLoadingAccounts(false);
        return;
      }
      try {
        const db = getFirestore();
        const q = query(
          collection(db, "users", user.uid, "bankAccounts"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setAccounts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Failed to load bank accounts:", err.message);
      } finally {
        setLoadingAccounts(false);
      }
    }
    loadAccounts();
  }, []);

  useEffect(() => {
    async function loadCards() {
      const user = auth.currentUser;
      if (!user) {
        setLoadingCards(false);
        return;
      }
      try {
        const db = getFirestore();
        const q = query(
          collection(db, "users", user.uid, "cards"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Failed to load cards:", err.message);
      } finally {
        setLoadingCards(false);
      }
    }
    loadCards();
  }, []);

  async function handleSaveAccount(e) {
    e.preventDefault();

    if (!bankName) {
      alert("Please select a bank");
      return;
    }
    if (!accountNumber.trim()) {
      alert("Please enter an account number");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in to save a bank account");
      return;
    }

    setIsSavingAccount(true);
    try {
      const db = getFirestore();
      const account = { region, bankName, accountName: accountName.trim(), accountType, accountNumber: accountNumber.trim() };
      if (editingAccountId) {
        await updateDoc(doc(db, "users", user.uid, "bankAccounts", editingAccountId), account);
        setAccounts((prev) => prev.map((item) => item.id === editingAccountId ? { ...item, ...account } : item));
      } else {
        const docRef = await addDoc(collection(db, "users", user.uid, "bankAccounts"), { ...account, isPrimary: accounts.length === 0, createdAt: serverTimestamp() });
        setAccounts((prev) => [{ id: docRef.id, ...account, isPrimary: prev.length === 0 }, ...prev]);
      }
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setAccountType("Savings");
      setEditingAccountId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function handleDeleteAccount(accountId) {
    if (!window.confirm("Remove this bank account?")) return;
    const user = auth.currentUser;
    if (!user) return;
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "users", user.uid, "bankAccounts", accountId));
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    } catch (err) {
      alert(err.message);
    }
  }

  function startEditingAccount(account) {
    setEditingAccountId(account.id);
    setRegion(account.region || REGIONS[0]);
    setBankName(account.bankName || "");
    setAccountNumber(account.accountNumber || "");
    setAccountName(account.accountName || "");
    setAccountType(account.accountType || "Savings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSetPrimary(accountId) {
    const user = auth.currentUser;
    if (!user) return;
    const batch = writeBatch(getFirestore());
    accounts.forEach((account) => {
      batch.update(doc(getFirestore(), "users", user.uid, "bankAccounts", account.id), { isPrimary: account.id === accountId });
    });
    await batch.commit();
    setAccounts((prev) => prev.map((account) => ({ ...account, isPrimary: account.id === accountId })));
  }

  async function handleSaveCard(e) {
    e.preventDefault();

    if (last4.trim().length !== 4) {
      alert("Please enter the last 4 digits of the card");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in to save a card");
      return;
    }

    setIsSavingCard(true);
    try {
      const db = getFirestore();
      const label = nickname.trim() || `${brand} card`;
      const docRef = await addDoc(collection(db, "users", user.uid, "cards"), {
        brand,
        last4: last4.trim(),
        nickname: label,
        createdAt: serverTimestamp(),
      });

      setCards((prev) => [
        { id: docRef.id, brand, last4: last4.trim(), nickname: label },
        ...prev,
      ]);
      setLast4("");
      setNickname("");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSavingCard(false);
    }
  }

  async function handleDeleteCard(cardId) {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "users", user.uid, "cards", cardId));
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <SubPageLayout title="Bank accounts">
      {/* ───────────── Bank accounts section ───────────── */}
      {loadingAccounts ? (
        <p className="text-neutral-500 text-sm mb-8">Loading…</p>
      ) : accounts.length === 0 ? (
        <p className="text-neutral-500 text-sm mb-8">
          No linked bank accounts yet.
        </p>
      ) : (
        <div className="space-y-3 mb-8">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center gap-4 rounded-2xl border border-neutral-200 px-5 py-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Landmark size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900">
                  {acc.bankName}
                </p>
                <p className="text-xs text-neutral-500">
                  {maskAccountNumber(acc.accountNumber)}
                </p>
                <p className="text-xs text-neutral-500">{acc.accountName || "Account holder"} · {acc.accountType || "Savings"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => startEditingAccount(acc)} className="text-xs font-semibold text-orange-600">Edit</button>
                <button type="button" onClick={() => handleSetPrimary(acc.id)} className={`text-xs font-semibold ${acc.isPrimary ? "text-green-600" : "text-neutral-400"}`}>{acc.isPrimary ? "Primary" : "Set primary"}</button>
              <button
                type="button"
                onClick={() => handleDeleteAccount(acc.id)}
                aria-label="Remove bank account"
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-sm font-semibold text-neutral-900 mb-4">
        {editingAccountId ? "Edit bank account" : "Add a bank account"}
      </h2>
      <form onSubmit={handleSaveAccount} className="space-y-5 mb-12">
        <div>
          <label htmlFor="accountName" className="block text-sm font-semibold text-neutral-900 mb-2">Account name</label>
          <input id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} type="text" placeholder="e.g. Ada Okafor" disabled={isSavingAccount} className="w-full rounded-full border border-neutral-300 px-6 py-3.5 text-base text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>

        <div>
          <label htmlFor="accountType" className="block text-sm font-semibold text-neutral-900 mb-2">Account type</label>
          <select id="accountType" value={accountType} onChange={(e) => setAccountType(e.target.value)} disabled={isSavingAccount} className="w-full rounded-full border border-neutral-300 px-6 py-3.5 text-base text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option>Savings</option>
            <option>Current</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="region"
            className="block text-sm font-semibold text-neutral-900 mb-2"
          >
            Region
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setBankName("");
            }}
            disabled={isSavingAccount}
            className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                       text-base text-neutral-800
                       focus:outline-none focus:ring-2 focus:ring-orange-400
                       disabled:bg-neutral-50"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="bankName"
            className="block text-sm font-semibold text-neutral-900 mb-2"
          >
            Select your bank
          </label>
          <select
            id="bankName"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            disabled={isSavingAccount}
            required
            className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                       text-base text-neutral-800
                       focus:outline-none focus:ring-2 focus:ring-orange-400
                       disabled:bg-neutral-50"
          >
            <option value="" disabled>
              Select your bank
            </option>
            {bankOptions.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="accountNumber"
            className="block text-sm font-semibold text-neutral-900 mb-2"
          >
            Account number
          </label>
          <input
            id="accountNumber"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
            type="text"
            inputMode="numeric"
            placeholder="0123456789"
            disabled={isSavingAccount}
            className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                       text-base text-neutral-800 placeholder:text-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-orange-400
                       disabled:bg-neutral-50"
          />
        </div>

        <button
          type="submit"
          disabled={isSavingAccount}
          className="w-full mt-2 rounded-full bg-orange-500 hover:bg-orange-600
                     active:bg-orange-700 transition-colors text-white text-base
                     font-semibold py-3.5 focus:outline-none focus-visible:ring-2
                     focus-visible:ring-orange-400 focus-visible:ring-offset-2
                     disabled:bg-orange-300 disabled:cursor-not-allowed"
        >
          {isSavingAccount ? "Saving…" : editingAccountId ? "Update bank account" : "Save bank account"}
        </button>
      </form>

      {/* ───────────── Cards section ───────────── */}
      <div className="border-t border-neutral-200 pt-8">
        <h1 className="text-lg font-bold text-neutral-900 mb-4">Cards</h1>

        {loadingCards ? (
          <p className="text-neutral-500 text-sm mb-8">Loading…</p>
        ) : cards.length === 0 ? (
          <p className="text-neutral-500 text-sm mb-8">No cards saved yet.</p>
        ) : (
          <div className="space-y-3 mb-8">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center gap-4 rounded-2xl border border-neutral-200 px-5 py-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <CreditCard size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    {card.nickname}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {card.brand} •••• {card.last4}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCard(card.id)}
                  aria-label="Remove card"
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-sm font-semibold text-neutral-900 mb-4">
          Add a card
        </h2>
        <p className="text-xs text-neutral-400 mb-4">
          For your safety, only the card brand and last 4 digits are saved —
          never the full card number, expiry, or CVV.
        </p>
        <form onSubmit={handleSaveCard} className="space-y-5">
          <div>
            <label
              htmlFor="brand"
              className="block text-sm font-semibold text-neutral-900 mb-2"
            >
              Card brand
            </label>
            <select
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              disabled={isSavingCard}
              className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                         text-base text-neutral-800
                         focus:outline-none focus:ring-2 focus:ring-orange-400
                         disabled:bg-neutral-50"
            >
              {CARD_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="last4"
              className="block text-sm font-semibold text-neutral-900 mb-2"
            >
              Last 4 digits
            </label>
            <input
              id="last4"
              value={last4}
              onChange={(e) =>
                setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              type="text"
              inputMode="numeric"
              placeholder="4321"
              disabled={isSavingCard}
              className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                         text-base text-neutral-800 placeholder:text-neutral-400
                         focus:outline-none focus:ring-2 focus:ring-orange-400
                         disabled:bg-neutral-50"
            />
          </div>

          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-semibold text-neutral-900 mb-2"
            >
              Nickname (optional)
            </label>
            <input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              type="text"
              placeholder="e.g. Personal Visa"
              disabled={isSavingCard}
              className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                         text-base text-neutral-800 placeholder:text-neutral-400
                         focus:outline-none focus:ring-2 focus:ring-orange-400
                         disabled:bg-neutral-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingCard}
            className="w-full mt-2 rounded-full bg-orange-500 hover:bg-orange-600
                       active:bg-orange-700 transition-colors text-white text-base
                       font-semibold py-3.5 focus:outline-none focus-visible:ring-2
                       focus-visible:ring-orange-400 focus-visible:ring-offset-2
                       disabled:bg-orange-300 disabled:cursor-not-allowed"
          >
            {isSavingCard ? "Saving…" : "Save card"}
          </button>
        </form>
      </div>
    </SubPageLayout>
  );
}