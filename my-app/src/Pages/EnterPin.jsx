import { useNavigate } from "react-router-dom";
import logo from "../assets/denari-logo.png.png";
import "@fontsource/plus-jakarta-sans/600.css";

const PIN_LENGTH = 4;

function EnterPin() {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-screen flex-col items-center justify-between overflow-hidden bg-[#FF8D28] px-8 py-16">
      {/* Logo */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <img src={logo} alt="Denari" className="h-24 w-auto" />
      </div>

      {/* PIN prompt */}
      <div className="flex flex-col items-center gap-6">
        <p className="text-lg font-semibold text-white">
          Enter your 4-digit PIN
        </p>

        <div className="flex justify-center gap-4">
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <span
              key={index}
              className="h-4 w-4 rounded-full border-2 border-white"
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm pt-16">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="w-full rounded-full bg-white py-4 text-lg font-semibold
                     text-orange-500 transition-colors hover:bg-orange-50
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                     focus-visible:ring-offset-2 focus-visible:ring-offset-[#FF8D28]"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default EnterPin;