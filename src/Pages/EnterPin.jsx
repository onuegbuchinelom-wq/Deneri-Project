import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import logo from "../assets/denari-logo.png.png";
import PinKeypad from "../Components/PinKeypad";
import "@fontsource/plus-jakarta-sans/600.css";

const PIN_LENGTH = 4;

export default function EnterPin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (pin.length !== PIN_LENGTH || isChecking) return;
    setIsChecking(true);
    setError("");
    try {
      const snap = await getDoc(doc(getFirestore(), "users", auth.currentUser.uid));
      const savedPin = snap.exists() ? snap.data().pin : null;
      if (savedPin && pin === savedPin) {
        sessionStorage.setItem("sessionVerified", "true");
        navigate("/dashboard");
      } else {
        setError("Incorrect PIN. Try again.");
        setPin("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FF8D28] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-sm flex-col items-center justify-center">
        <img src={logo} alt="Denari" className="mb-5 h-32 w-auto sm:h-40" />
        <h1 className="text-center text-2xl font-semibold text-white sm:text-3xl">Enter your PIN</h1>
        <p className="mt-2 text-center text-sm font-medium text-white/90">Enter your 4-digit PIN to continue</p>
        <div className="mt-8 w-full rounded-3xl bg-white px-5 py-6 shadow-xl sm:px-8">
          <PinKeypad value={pin} onChange={(value) => { setPin(value); setError(""); }} disabled={isChecking} />
          {error && <p className="mt-4 text-center text-sm font-medium text-red-600">{error}</p>}
          <button type="button" onClick={handleSubmit} disabled={pin.length !== PIN_LENGTH || isChecking} className="mt-6 w-full rounded-full bg-orange-500 py-3.5 text-base font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
            {isChecking ? "Checking..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
