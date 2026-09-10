import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import heroImage from "../assets/denari-hero.png";
import { Check } from "lucide-react";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";

function FlagNG() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" className="rounded-sm">
      <rect width="28" height="20" fill="#ffffff" />
      <rect width="9.33" height="20" fill="#008751" />
      <rect x="18.67" width="9.33" height="20" fill="#008751" />
    </svg>
  );
}

function FlagUS() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" className="rounded-sm">
      <rect width="28" height="20" fill="#B22234" />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} y={(i * 2 + 1) * (20 / 13)} width="28" height={20 / 13} fill="#ffffff" />
      ))}
      <rect width="12" height={20 * 7 / 13} fill="#3C3B6E" />
    </svg>
  );
}

function FlagEU() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" className="rounded-sm">
      <rect width="28" height="20" fill="#003399" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 2 * Math.PI;
        const cx = 14 + 6 * Math.sin(angle);
        const cy = 10 - 6 * Math.cos(angle);
        return <circle key={i} cx={cx} cy={cy} r="0.9" fill="#FFCC00" />;
      })}
    </svg>
  );
}

function FlagGB() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" className="rounded-sm">
      <rect width="28" height="20" fill="#00247D" />
      <path d="M0,0 L28,20 M28,0 L0,20" stroke="#ffffff" strokeWidth="4" />
      <path d="M0,0 L28,20 M28,0 L0,20" stroke="#CF142B" strokeWidth="1.5" />
      <path d="M14,0 V20 M0,10 H28" stroke="#ffffff" strokeWidth="6" />
      <path d="M14,0 V20 M0,10 H28" stroke="#CF142B" strokeWidth="2.5" />
    </svg>
  );
}

const CURRENCIES = [
  { code: "NGN", symbol: "N", name: "Nigerian Naira", Flag: FlagNG },
  { code: "USD", symbol: "$", name: "US Dollar", Flag: FlagUS },
  { code: "EUR", symbol: "€", name: "Euro", Flag: FlagEU },
  { code: "GBP", symbol: "£", name: "British Pounds", Flag: FlagGB },
];

export default function ChooseCurrency() {
  const [selected, setSelected] = useState("NGN");
  const navigate = useNavigate();
  const location = useLocation();
  const { fullName, email, phone } = location.state || {};

  function handleContinue() {
    navigate("/personal-info", {
      state: { fullName, email, phone, currency: selected },
    });
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left — currency selection */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-6 md:px-20 lg:px-24">
        <div className="w-full max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">
            Choose currency
          </h1>
          <p className="text-base text-neutral-500 mb-8">
            Select your preferred currency to get started
          </p>

          <div className="space-y-4">
            {CURRENCIES.map(({ code, symbol, name, Flag }) => {
              const isSelected = selected === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelected(code)}
                  className={`w-full flex items-center gap-4 rounded-2xl border px-5 py-4
                              text-left transition-colors focus:outline-none
                              focus-visible:ring-2 focus-visible:ring-orange-400 ${
                    isSelected
                      ? "border-orange-300 bg-orange-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <Flag />

                  <span className="flex-1">
                    <span className="block text-base font-semibold text-neutral-900">
                      {name}
                    </span>
                    <span className="block text-sm text-neutral-500">
                      {symbol} ({code})
                    </span>
                  </span>

                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full
                                border transition-colors ${
                      isSelected
                        ? "border-orange-500 bg-orange-500"
                        : "border-neutral-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <Check size={14} strokeWidth={3} className="text-white" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full mt-10 rounded-full bg-orange-500 hover:bg-orange-600
                       active:bg-orange-700 transition-colors text-white text-lg
                       font-semibold py-4 focus:outline-none focus-visible:ring-2
                       focus-visible:ring-orange-400 focus-visible:ring-offset-2"
          >
            Continue
          </button>
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