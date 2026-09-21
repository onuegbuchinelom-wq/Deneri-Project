import { useState } from "react";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { auth } from "../Config/firebase";
import SubPageLayout from "../Components/SubPageLayout";

const FAQS = [
  ["How is my balance calculated?", "Your balance changes from the income, expense, and savings transactions stored in Firebase."],
  ["Where are my accounts saved?", "Bank accounts are saved under your Firebase user record and can be edited or removed from Profile."],
  ["Can I change the app theme?", "Open Settings, General, choose Light, Dark, or System, then save your changes."],
];

export default function HelpSupport() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function submitRequest(event) {
    event.preventDefault();
    if (!message.trim() || !auth.currentUser) return;
    setIsSending(true);
    try {
      await addDoc(collection(getFirestore(), "users", auth.currentUser.uid, "supportRequests"), { message: message.trim(), createdAt: serverTimestamp(), status: "open" });
      setMessage("");
      setSent(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <SubPageLayout title="Help & support">
      <div className="space-y-7">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">Frequently asked questions</h2>
          <div className="space-y-3">{FAQS.map(([question, answer]) => <details key={question} className="rounded-2xl border border-neutral-200 px-4 py-3"><summary className="cursor-pointer text-sm font-semibold text-neutral-800">{question}</summary><p className="mt-2 text-sm text-neutral-500">{answer}</p></details>)}</div>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">Contact support</h2>
          <a href="mailto:support@denari.app" className="block rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-orange-600">Email support@denari.app</a>
        </section>
        <form onSubmit={submitRequest} className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-500">Report a problem or send feedback</h2>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what happened..." rows={4} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm" />
          <button type="submit" disabled={isSending} className="w-full rounded-full bg-orange-500 py-3 font-semibold text-white disabled:opacity-60">{isSending ? "Sending..." : sent ? "Sent" : "Send request"}</button>
        </form>
      </div>
    </SubPageLayout>
  );
}
