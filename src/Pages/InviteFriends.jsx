import { useEffect, useState } from "react";
import { doc, getFirestore, onSnapshot, updateDoc } from "firebase/firestore";
import { auth } from "../Config/firebase";
import SubPageLayout from "../Components/SubPageLayout";

function makeCode(uid) {
  return `DENARI-${uid.slice(0, 6).toUpperCase()}`;
}

export default function InviteFriends() {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return undefined;
    const userRef = doc(getFirestore(), "users", user.uid);
    return onSnapshot(userRef, async (snapshot) => {
      const existing = snapshot.data()?.referral?.code || makeCode(user.uid);
      setCode(existing);
      if (!snapshot.data()?.referral?.code) await updateDoc(userRef, { "referral.code": existing });
    });
  }, []);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function shareInvite() {
    const text = `Join me on DENARI. My invite code is ${code}.`;
    if (navigator.share) await navigator.share({ title: "Join DENARI", text });
    else await navigator.clipboard.writeText(text);
  }

  return (
    <SubPageLayout title="Invite friends">
      <div className="space-y-5">
        <div className="rounded-2xl border border-neutral-200 px-5 py-5 text-center">
          <p className="text-sm text-neutral-500">Your invite code</p>
          <p className="mt-2 text-2xl font-bold tracking-wider text-neutral-900">{code || "Generating..."}</p>
          <div className="mt-4 flex gap-2"><button type="button" onClick={copyCode} className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white">{copied ? "Copied" : "Copy code"}</button><button type="button" onClick={shareInvite} className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-700">Share</button></div>
        </div>
      </div>
    </SubPageLayout>
  );
}
