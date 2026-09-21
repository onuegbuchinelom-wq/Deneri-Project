import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../Config/firebase";
import { RecaptchaVerifier, linkWithPhoneNumber } from "firebase/auth";
import heroImage from "../assets/denari-hero.png";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 90;

export default function Verify() {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const inputsRef = useRef([]);
  const recaptchaRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { fullName, email, phone } = location.state || {};

  // Send the OTP automatically once, when the page loads
  useEffect(() => {
    if (!phone) {
      setError("No phone number found. Please go back and sign up again.");
      return;
    }
    sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  async function sendCode() {
    setError("");
    setIsSending(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }
      const result = await linkWithPhoneNumber(
        auth.currentUser,
        phone,
        recaptchaRef.current
      );
      setConfirmationResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

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

  async function handleSubmit(e) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      alert("Please enter the full 6-digit code");
      return;
    }
    if (!confirmationResult) {
      setError("Code hasn't been sent yet. Please wait or tap resend.");
      return;
    }

    setError("");
    setIsVerifying(true);
    try {
      await confirmationResult.confirm(code);
      navigate("/setup-pin", { state: { fullName, email, phone } });
    } catch (err) {
      setError(err.message); // e.g. "invalid verification code"
      setIsVerifying(false);
    }
  }

  function handleResend() {
    if (secondsLeft > 0) return;
    setDigits(Array(CODE_LENGTH).fill(""));
    setSecondsLeft(RESEND_SECONDS);
    inputsRef.current[0]?.focus();
    sendCode();
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:h-screen md:flex-row md:overflow-hidden">
      {/* Left — form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-8 py-6 md:px-20 lg:px-24">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Verify OTP
          </h1>
          <p className="text-lg text-neutral-600 mb-10">
            Enter the 6-digit code sent to
            <br />
            <span className="text-orange-500 font-medium">
              {phone || "your phone"}
            </span>
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div
              className="flex justify-center gap-2 sm:gap-3"
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
                  disabled={isVerifying}
                  aria-label={`Digit ${index + 1}`}
                  className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 rounded-xl border border-orange-300
                             text-center text-xl font-semibold text-neutral-800
                             focus:outline-none focus:ring-2 focus:ring-orange-400
                             focus:border-orange-400 disabled:bg-neutral-50"
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
                  disabled={secondsLeft > 0 || isSending}
                  className={`font-medium underline focus:outline-none ${
                    secondsLeft > 0 || isSending
                      ? "text-neutral-400 cursor-not-allowed no-underline"
                      : "text-orange-500 hover:text-orange-600"
                  }`}
                >
                  {isSending ? "Sending…" : "Resend"}
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full rounded-full bg-orange-500 hover:bg-orange-600
                         active:bg-orange-700 transition-colors text-white text-lg
                         font-semibold py-4 focus:outline-none focus-visible:ring-2
                         focus-visible:ring-orange-400 focus-visible:ring-offset-2
                         disabled:bg-orange-300 disabled:cursor-not-allowed"
            >
              {isVerifying ? "Verifying…" : "Verify and Continue"}
            </button>
          </form>

          {/* Required invisible container for RecaptchaVerifier */}
          <div id="recaptcha-container" />
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