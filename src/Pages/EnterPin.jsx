import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import logo from "../assets/denari-logo.png.png";
import "@fontsource/plus-jakarta-sans/600.css";

const PIN_LENGTH = 4;

function EnterPin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setPin(value);
    if (error) setError("");
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const isComplete = pin.length === PIN_LENGTH;

  async function handleSubmit() {
    if (!isComplete || isChecking) return;

    setIsChecking(true);
    setError("");
    try {
      const snap = await getDoc(doc(getFirestore(), "users", auth.currentUser.uid));
      const savedPin = snap.exists() ? snap.data().pin : null;

      if (savedPin && pin === savedPin) {
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
    <div className="relative flex h-screen flex-col items-center justify-between 
    overflow-hidden bg-[#FF8D28] px-8 py-16">
      {/* Logo */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <img src={logo} alt="Denari" className="h-60 w-auto" />
      </div>

      {/* PIN prompt */}
      <div className="flex flex-col items-center gap-6 mt-10">
        <p className="text-lg font-semibold text-white">
          Enter your 4-digit PIN
        </p>

        {error && (
          <p className="text-sm font-medium text-white bg-red-500/30 px-4 py-1.5 rounded-full">
            {error}
          </p>
        )}

        {/* Hidden input drives the system keyboard */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={PIN_LENGTH}
          value={pin}
          onChange={handleChange}
          disabled={isChecking}
          className="sr-only"
        />

        <div
          onClick={focusInput}
          className="flex cursor-text justify-center gap-4"
        >
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <span
              key={index}
              className={`h-4 w-4 rounded-full border-2 border-white transition-colors ${
                index < pin.length ? "bg-white" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm pt-16">
        <button
          type="button"
          disabled={!isComplete || isChecking}
          onClick={handleSubmit}
          className="w-full rounded-full bg-white py-4 text-lg font-semibold
                     text-orange-500 transition-colors hover:bg-orange-50
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                     focus-visible:ring-offset-2 focus-visible:ring-offset-[#FF8D28]
                     disabled:opacity-50 disabled:hover:bg-white"
        >
          {isChecking ? "Checking…" : "Get Started"}
        </button>
      </div>
    </div>
  );
}

export default EnterPin;