import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../Config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import heroImage from "../assets/denari-hero.png";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";

export default function Signup2() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { fullName, email, phone } = location.state || {};

  async function handleSubmit(e) {
    e.preventDefault();

    if (password === "") {
      alert("Please create a password");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (confirmPassword === "") {
      alert("Please confirm your password");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Account created with email/password. Phone still needs to be
      // verified next — that happens on the Verify OTP screen using
      // linkWithPhoneNumber, since the user is now signed in.
      navigate("/verify", { state: { fullName, email, phone } });
    } catch (err) {
      alert(err.message); // e.g. "email already in use", "weak password"
      setIsSubmitting(false);
    }
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left — form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-6 md:px-20 lg:px-24">
        <div className="w-full max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-8">
            Sign up
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-base font-semibold text-neutral-900 mb-2"
              >
                password
              </label>
              <div className="relative">
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  disabled={isSubmitting}
                  className="w-full rounded-full border border-neutral-300 px-6 py-3.5 pr-14
                             text-base text-neutral-800 placeholder:text-neutral-400
                             focus:outline-none focus:ring-2 focus:ring-orange-400
                             disabled:bg-neutral-50 disabled:text-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500
                             hover:text-neutral-700 focus:outline-none disabled:opacity-40"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-base font-semibold text-neutral-900 mb-2"
              >
                confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  disabled={isSubmitting}
                  className="w-full rounded-full border border-neutral-300 px-6 py-3.5 pr-14
                             text-base text-neutral-800 placeholder:text-neutral-400
                             focus:outline-none focus:ring-2 focus:ring-orange-400
                             disabled:bg-neutral-50 disabled:text-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  disabled={isSubmitting}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500
                             hover:text-neutral-700 focus:outline-none disabled:opacity-40"
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 rounded-full bg-orange-500 hover:bg-orange-600
                         active:bg-orange-700 transition-colors text-white text-lg
                         font-semibold py-4 focus:outline-none focus-visible:ring-2
                         focus-visible:ring-orange-400 focus-visible:ring-offset-2
                         disabled:bg-orange-300 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Getting started…" : "Get Started"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              disabled={isSubmitting}
              className="w-full rounded-full border border-orange-300 text-lg
                         font-semibold py-4 text-neutral-900 hover:bg-orange-50
                         transition-colors focus:outline-none focus-visible:ring-2
                         focus-visible:ring-orange-400 focus-visible:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Already have an account?{" "}
              <span className="text-orange-500">Log in</span>
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

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M6.6 6.7C4.5 8.1 3 10 2 12c1.7 3.9 5.5 7 10 7 1.6 0 3.1-.4 4.4-1.1M9.9 4.2A10.4 10.4 0 0112 4c4.5 0 8.3 3.1 10 7-.5 1.2-1.2 2.3-2.1 3.3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12c1.7-3.9 5.5-7 10-7s8.3 3.1 10 7c-1.7 3.9-5.5 7-10 7s-8.3-3.1-10-7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}