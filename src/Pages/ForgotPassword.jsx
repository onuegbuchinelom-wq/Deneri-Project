import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import heroImage from "../assets/denari-hero.png";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (identifier.trim() === "") {
      alert("Please enter your email address");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(identifier)) {
      alert("Password reset only works with an email address, not a phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, identifier);
      setSent(true);
    } catch (err) {
      // Firebase gives specific error codes here (e.g. auth/user-not-found)
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:h-screen md:flex-row md:overflow-hidden">
      {/* Left — form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-8 py-6 md:px-20 lg:px-24">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Forgot Password
          </h1>
          <p className="text-lg text-neutral-600 mb-10">
            No worries! Enter your email or phone number
            <br />
            and we&apos;ll send you a reset link
          </p>

          {sent ? (
            <div className="space-y-8">
              <div className="flex justify-center">
                <EnvelopeIcon />
              </div>
              <p className="text-neutral-700">
                If an account exists for <strong>{identifier}</strong>, a
                reset link has been sent. Check your inbox.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full rounded-full bg-orange-500 hover:bg-orange-600
                           active:bg-orange-700 transition-colors text-white text-lg
                           font-semibold py-4 focus:outline-none focus-visible:ring-2
                           focus-visible:ring-orange-400 focus-visible:ring-offset-2"
              >
                Back to Log in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 text-left">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-base font-semibold text-neutral-900 mb-2"
                >
                  Email
                </label>
                <input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                             text-base text-neutral-800 placeholder:text-neutral-400
                             focus:outline-none focus:ring-2 focus:ring-orange-400
                             disabled:bg-neutral-50 disabled:text-neutral-400"
                />
              </div>

              <div className="flex justify-center">
                <EnvelopeIcon />
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-orange-500 hover:bg-orange-600
                             active:bg-orange-700 transition-colors text-white text-lg
                             font-semibold py-4 focus:outline-none focus-visible:ring-2
                             focus-visible:ring-orange-400 focus-visible:ring-offset-2
                             disabled:bg-orange-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending…" : "Send Reset Link"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    disabled={isSubmitting}
                    className="text-orange-500 font-medium underline hover:text-orange-600
                               focus:outline-none disabled:opacity-40"
                  >
                    Back to Log in
                  </button>
                </div>
              </div>
            </form>
          )}
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

function EnvelopeIcon() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
      {/* envelope back flap */}
      <path d="M12 32L48 8L84 32V34L48 12L12 34V32Z" fill="#E8536A" />
      {/* envelope body */}
      <rect x="12" y="30" width="72" height="46" rx="4" fill="#F0637A" />
      {/* letter poking out */}
      <rect
        x="26"
        y="14"
        width="44"
        height="52"
        rx="3"
        fill="white"
        stroke="#E2E8F0"
        strokeWidth="1.5"
      />
      <rect x="34" y="24" width="24" height="4" rx="2" fill="#3B3F8C" />
      <rect x="34" y="34" width="28" height="2.5" rx="1.25" fill="#CBD5E1" />
      <rect x="34" y="41" width="28" height="2.5" rx="1.25" fill="#CBD5E1" />
      <rect x="34" y="48" width="20" height="2.5" rx="1.25" fill="#CBD5E1" />
      {/* front flap (open, forming the "V") */}
      <path
        d="M12 32L48 58L84 32V72C84 74.2 82.2 76 80 76H16C13.8 76 12 74.2 12 72V32Z"
        fill="#E8536A"
      />
      <path
        d="M12 32L48 58L84 32"
        stroke="#D63B54"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}