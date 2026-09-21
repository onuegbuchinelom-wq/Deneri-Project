import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import heroImage from "../assets/denari-hero.png";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (identifier.trim() === "") {
      alert("Please enter your email or phone number");
      return;
    }
    if (password === "") {
      alert("Please enter your password");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, identifier, password);
      sessionStorage.setItem("sessionVerified", "true");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:h-screen md:flex-row md:overflow-hidden">
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-8 py-6 md:px-20 lg:px-24">
        <div className="w-full max-w-lg">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">
            Log In
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Welcome back! Please log in to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="block text-base font-semibold text-neutral-900 mb-2"
              >
                Email or Phone number
              </label>
              <input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                type="text"
                placeholder="Enter Email or  phone number"
                disabled={isSubmitting}
                className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                           text-base text-neutral-800 placeholder:text-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-orange-400
                           disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-base font-semibold text-neutral-900 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
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

            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                disabled={isSubmitting}
                className="text-orange-500 font-medium hover:text-orange-600
                           focus:outline-none disabled:opacity-40"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-full bg-orange-500 hover:bg-orange-600
                         active:bg-orange-700 transition-colors text-white text-lg
                         font-semibold py-4 focus:outline-none focus-visible:ring-2
                         focus-visible:ring-orange-400 focus-visible:ring-offset-2
                         disabled:bg-orange-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Logging in…" : "Get Started"}
            </button>

            <p className="text-center text-neutral-700">
              don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                disabled={isSubmitting}
                className="text-orange-500 font-semibold hover:text-orange-600
                           focus:outline-none disabled:opacity-40"
              >
                Sign up
              </button>
            </p>
          </form>
        </div>
      </div>

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