import { useEffect, useState } from "react";
import SubPageLayout from "../Components/SubPageLayout";
import { auth } from "../Config/firebase";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { CreditCard, Trash2 } from "lucide-react";

const CARD_BRANDS = ["Visa", "Mastercard", "Verve", "American Express"];

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [brand, setBrand] = useState(CARD_BRANDS[0]);
  const [last4, setLast4] = useState("");
  const [nickname, setNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadCards() {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
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
        setLoading(false);
      }
    }
    loadCards();
  }, []);

  async function handleSave(e) {
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

    setIsSaving(true);
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
      setIsSaving(false);
    }
  }

  async function handleDelete(cardId) {
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
    <SubPageLayout title="Cards">
      {/* Saved cards list */}
      {loading ? (
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
                onClick={() => handleDelete(card.id)}
                aria-label="Remove card"
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new card form */}
      <h2 className="text-sm font-semibold text-neutral-900 mb-4">
        Add a card
      </h2>
      <p className="text-xs text-neutral-400 mb-4">
        For your safety, only the card brand and last 4 digits are saved —
        never the full card number, expiry, or CVV.
      </p>
      <form onSubmit={handleSave} className="space-y-5">
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
            disabled={isSaving}
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
            disabled={isSaving}
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
            disabled={isSaving}
            className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                       text-base text-neutral-800 placeholder:text-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-orange-400
                       disabled:bg-neutral-50"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full mt-2 rounded-full bg-orange-500 hover:bg-orange-600
                     active:bg-orange-700 transition-colors text-white text-base
                     font-semibold py-3.5 focus:outline-none focus-visible:ring-2
                     focus-visible:ring-orange-400 focus-visible:ring-offset-2
                     disabled:bg-orange-300 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving…" : "Save card"}
        </button>
      </form>
    </SubPageLayout>
  );
}