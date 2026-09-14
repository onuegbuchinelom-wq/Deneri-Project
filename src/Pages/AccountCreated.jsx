import { useNavigate } from "react-router-dom";
import heroImage from "../assets/denari-hero.png";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}


export default function AccountCreated() {
  const navigate = useNavigate();

  const NEXT_STEPS = [
  "Track your expenses",
  "Create a budget",
  "Set savings goal",
  "Achieve Financial freedom",
 ];
 

  return (
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left — success message */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-6 md:px-20 lg:px-24">
        <div className="w-full max-w-lg">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-3 text-center">
            Welcome to DENARI
          </h1>
          <p className="text-lg text-neutral-600 mb-8 text-center">
            Your account has been created succesfully.
          </p>

          <div className="rounded-3xl bg-orange-50 px-8 py-8 mb-10">
            <h2 className="text-lg font-bold text-neutral-900 mb-6 text-center">
              What's next?
            </h2>

            <ul className="space-y-5">
              {NEXT_STEPS.map((step) => (
                <li key={step} className="flex items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600">
                    <CheckIcon />
                  </span>
                  <span className="text-base text-neutral-800">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="w-full rounded-full bg-orange-500 hover:bg-orange-600
                       active:bg-orange-700 transition-colors text-white text-lg
                       font-semibold py-4 focus:outline-none focus-visible:ring-2
                       focus-visible:ring-orange-400 focus-visible:ring-offset-2"
          >
            Go to Dashboard
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