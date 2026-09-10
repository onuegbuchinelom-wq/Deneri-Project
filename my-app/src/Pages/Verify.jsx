import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/denari-hero.png";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 90;

export default function Verify({ phoneNumber = "+234 8133901794" }) {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputsRef = useRef([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  function handleChange(e, index) {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value === "") {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    const chars = value.split("");
    setDigits((prev) => {
      const next = [...prev];
      let i = index;
      for (const ch of chars) {
        if (i >= CODE_LENGTH) break;
        next[i] = ch;
        i += 1;
      }
      return next;
    });

    const nextIndex = Math.min(index + chars.length, CODE_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
  }

  function handleKeyDown(e, index) {
    if (e.key === "Backspace" && digits[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill("");
    pasted
      .slice(0, CODE_LENGTH)
      .split("")
      .forEach((ch, i) => (next[i] = ch));
    setDigits(next);
    const lastIndex = Math.min(pasted.length, CODE_LENGTH) - 1;
    inputsRef.current[lastIndex]?.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      alert("Please enter the full 6-digit code");
      return;
    }

    // TODO: send { code, phoneNumber } to your API here to verify the OTP.
    // On success, e.g.: navigate("/login");
  }

  function handleResend() {
    if (secondsLeft > 0) return;
    setDigits(Array(CODE_LENGTH).fill(""));
    setSecondsLeft(RESEND_SECONDS);
    inputsRef.current[0]?.focus();
    // TODO: call your API here to resend the code.
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left — form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-6 md:px-20 lg:px-24">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Verify OTP
          </h1>
          <p className="text-lg text-neutral-600 mb-10">
            Enter the 6-digit code sent to
            <br />
            <span className="text-orange-500 font-medium">{phoneNumber}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div
              className="flex justify-center gap-3"
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${index + 1}`}
                  className="w-12 h-14 md:w-14 md:h-16 rounded-xl border border-orange-300
                             text-center text-xl font-semibold text-neutral-800
                             focus:outline-none focus:ring-2 focus:ring-orange-400
                             focus:border-orange-400"
                />
              ))}
            </div>

            <div className="text-center text-neutral-700">
              <p>
                Code expires in{" "}
                <span className="font-semibold">
                  {minutes}:{seconds}
                </span>
              </p>
              <p className="mt-1">
                Didn&apos;t receive code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={secondsLeft > 0}
                  className={`font-medium underline focus:outline-none ${
                    secondsLeft > 0
                      ? "text-neutral-400 cursor-not-allowed no-underline"
                      : "text-orange-500 hover:text-orange-600"
                  }`}
                >
                  Resend
                </button>
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-orange-500 hover:bg-orange-600
                         active:bg-orange-700 transition-colors text-white text-lg
                         font-semibold py-4 focus:outline-none focus-visible:ring-2
                         focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            >
              Verify and Continue
            </button>
          </form>
        </div>
      </div>

      {/* Right — hero image: inset rounded card with white margin, not full-bleed */}
      <div className="hidden md:flex md:w-1/2 items-stretch py-6 pr-6">
        <div className="w-full rounded-3xl overflow-hidden">
          <img
            src={heroImage}
            alt="Denari branch lobby"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}