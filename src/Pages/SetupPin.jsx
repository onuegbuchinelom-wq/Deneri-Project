import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../Config/firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import heroImage from "../assets/denari-hero.png";
import PinKeypad from "../Components/PinKeypad";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";

const PIN_LENGTH = 4;

export default function SetupPin() {
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [stage, setStage] = useState("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { fullName, email, phone } = location.state || {};

  function handleContinue() {
    if (pin.length !== PIN_LENGTH) return;
    setError("");
    if (stage === "create") {
      setFirstPin(pin);
      setPin("");
      setStage("confirm");
      return;
    }
    if (pin !== firstPin) {
      setError("PINs do not match. Try again.");
      setPin("");
      return;
    }
    savePin(pin);
  }

  async function savePin(value) {
    setIsSubmitting(true);
    try {
      await setDoc(doc(getFirestore(), "users", auth.currentUser.uid), { pin: value }, { merge: true });
      navigate("/choose-currency", { state: { fullName, email, phone } });
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-white md:flex md:h-screen md:overflow-hidden">
      <div className="flex w-full items-center justify-center px-4 py-8 sm:px-8 md:w-1/2 md:px-16 lg:px-24">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{stage === "create" ? "Create PIN" : "Confirm PIN"}</h1>
          <p className="mt-3 text-base text-neutral-500">{stage === "create" ? "Choose a 4-digit PIN to secure your account." : "Enter your PIN again to confirm it."}</p>
          <div className="mt-8 rounded-3xl border border-neutral-200 px-5 py-6 shadow-sm sm:px-8">
            <PinKeypad value={pin} onChange={(value) => { setPin(value); setError(""); }} disabled={isSubmitting} />
            {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
            <button type="button" onClick={handleContinue} disabled={pin.length !== PIN_LENGTH || isSubmitting} className="mt-6 w-full rounded-full bg-orange-500 py-3.5 text-base font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? "Saving..." : stage === "create" ? "Continue" : "Save PIN"}
            </button>
            {stage === "confirm" && <button type="button" onClick={() => { setStage("create"); setFirstPin(""); setPin(""); setError(""); }} disabled={isSubmitting} className="mt-3 text-sm font-semibold text-orange-600">Start over</button>}
          </div>
        </div>
      </div>
      <div className="hidden py-6 pr-6 md:flex md:w-1/2 md:items-stretch">
        <div className="w-full overflow-hidden rounded-3xl"><img src={heroImage} alt="Denari branch lobby" className="h-full w-full object-cover" /></div>
      </div>
    </div>
  );
}
