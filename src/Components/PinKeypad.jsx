import { Delete } from "lucide-react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function PinKeypad({ value, onChange, disabled = false }) {
  function addDigit(digit) {
    if (disabled || value.length >= 4) return;
    onChange(`${value}${digit}`);
  }

  function removeDigit() {
    if (disabled) return;
    onChange(value.slice(0, -1));
  }

  function handleKeyDown(event) {
    if (/^[0-9]$/.test(event.key)) addDigit(event.key);
    if (event.key === "Backspace") removeDigit();
  }

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown} className="w-full outline-none">
      <div className="mb-6 flex justify-center gap-4" aria-label={`${value.length} of 4 digits entered`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className={`h-4 w-4 rounded-full border-2 border-orange-500 ${index < value.length ? "bg-orange-500" : "bg-transparent"}`} />
        ))}
      </div>
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-3 sm:gap-4">
        {KEYS.map((key) => (
          <button key={key} type="button" onClick={() => addDigit(key)} disabled={disabled} className="flex h-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-xl font-semibold text-neutral-900 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 active:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50 sm:h-16" aria-label={`Digit ${key}`}>
            {key}
          </button>
        ))}
        <span aria-hidden="true" />
        <button type="button" onClick={() => addDigit("0")} disabled={disabled} className="flex h-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-xl font-semibold text-neutral-900 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 active:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50 sm:h-16" aria-label="Digit 0">0</button>
        <button type="button" onClick={removeDigit} disabled={disabled || value.length === 0} className="flex h-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 active:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50 sm:h-16" aria-label="Delete last digit"><Delete size={22} /></button>
      </div>
    </div>
  );
}
