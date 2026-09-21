import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "firebase/auth";
import { auth } from "../Config/firebase";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import SubPageLayout from "../Components/SubPageLayout";
import { useSettings } from "../Components/SettingsProvider";

export default function Security() {
  const navigate = useNavigate();
  const [isWorking, setIsWorking] = useState(false);
  const { settings, saveSettings } = useSettings();
  const [security, setSecurity] = useState(settings.security);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleDeleteAccount() {
    if (!window.confirm("Delete your DENARI account? This cannot be undone.")) return;
    setIsWorking(true);
    try {
      await deleteUser(auth.currentUser);
      navigate("/welcome");
    } catch (error) {
      alert(error.code === "auth/requires-recent-login" ? "Please sign in again before deleting your account." : error.message);
      setIsWorking(false);
    }
  }

  async function handleSave() {
    if ((newPin || confirmPin) && (newPin.length !== 4 || newPin !== confirmPin)) {
      alert("PINs must match and contain 4 digits");
      return;
    }
    setIsWorking(true);
    try {
      await saveSettings({ security });
      if (newPin) await updateDoc(doc(getFirestore(), "users", auth.currentUser.uid), { pin: newPin });
      setNewPin("");
      setConfirmPin("");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <SubPageLayout title="Security">
      <div className="space-y-3">
        <div className="rounded-2xl border border-neutral-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-neutral-800">Change PIN</p>
          <input value={newPin} onChange={(event) => setNewPin(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} type="password" placeholder="New 4-digit PIN" className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm" />
          <input value={confirmPin} onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} type="password" placeholder="Confirm new PIN" className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm" />
        </div>
        <label className="flex items-center justify-between rounded-2xl border border-neutral-200 px-5 py-4 text-sm text-neutral-800">Enable biometric login<input type="checkbox" checked={security.biometric} onChange={() => setSecurity({ ...security, biometric: !security.biometric })} className="h-4 w-4 accent-orange-500" /></label>
        <label className="flex items-center justify-between rounded-2xl border border-neutral-200 px-5 py-4 text-sm text-neutral-800">Require PIN when opening DENARI<input type="checkbox" checked={security.requirePinOnOpen} onChange={() => setSecurity({ ...security, requirePinOnOpen: !security.requirePinOnOpen })} className="h-4 w-4 accent-orange-500" /></label>
        <button type="button" onClick={handleSave} disabled={isWorking} className="w-full rounded-full bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60">{isWorking ? "Saving..." : saved ? "Saved" : "Save Changes"}</button>
        <button type="button" onClick={handleDeleteAccount} disabled={isWorking} className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">Delete account</button>
      </div>
    </SubPageLayout>
  );
}