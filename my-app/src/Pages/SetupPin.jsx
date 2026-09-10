import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/denari-hero.png";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";


const PIN_LENGTH = 4;

export default function SetupPin() {
  const [digits, setDigits] = useState(Array(PIN_LENGTH).fill(""));
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  function handleChange(index, rawValue) {
    const value = rawValue.replace(/[^0-9]/g, "").slice(-1);

    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = Array(PIN_LENGTH).fill("");
    pasted
      .slice(0, PIN_LENGTH)
      .split("")
      .forEach((char, i) => (next[i] = char));
    setDigits(next);
    const lastFilled = Math.min(pasted.length, PIN_LENGTH) - 1;
    inputRefs.current[lastFilled]?.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();

    const pin = digits.join("");
    if (pin.length !== PIN_LENGTH) {
      alert("Please enter a 4-digit pin");
      return;
    }

    // TODO: send { pin } to your API here to secure the account.
    navigate("/home");
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left — form */}
      <div className="w-full md:w-1/2 flex items-start justify-center px-8 pt-20 pb-6 md:px-20 lg:px-24 md:pt-28">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-14">
            Set up pin
          </h1>
          <p className="text-lg text-black font-medium text-[24px] mb-14">
            Create a 4-digit pin to secure
            <br />
            your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div
              className="flex justify-center gap-4"
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  placeholder="•"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  aria-label={`Pin digit ${index + 1}`}
                  className="w-16 h-16  border border-neutral-400
                             text-center text-2xl text-neutral-800
                             placeholder:text-orange-400
                             focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full mt-40 rounded-full bg-orange-500 hover:bg-orange-600
                         active:bg-orange-700 transition-colors text-white text-lg
                         font-semibold py-4 focus:outline-none focus-visible:ring-2
                         focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            >
              Continue
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