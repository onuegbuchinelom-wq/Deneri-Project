import { useState } from "react";
import { NavLink } from "react-router-dom";
import heroImage from "../assets/denari-hero.png";

/**
 * Denari — Sign Up page
 *
 * Route this at /signup in App.jsx:
 *   import SignUp from "./Pages/SignUp";
 *   <Route path="/signup" element={<SignUp />} />
 *   <Route path="/verify" element={<Verify />} /> — the Next button links here.
 *
 * The hero image is imported from src/assets/denari-hero.png — the plain,
 * full-brightness lobby photo (no fade or wave overlay), matching the
 * actual Sign Up mockup. If you'd rather keep it in the public folder
 * instead, drop the import above and use a plain string path like
 * "/assets/denari-hero.png".
 */

export default function SignUp() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (!/^[\d+()\-\s]{7,}$/.test(form.phone)) next.phone = "Enter a valid phone number";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // NavLink still navigates like a normal link, but we block it here
  // (preventDefault) until the fields pass validation.
  const handleNextClick = (e) => {
    if (!validate()) {
      e.preventDefault();
      return;
    }
    // TODO: send `form` to your API / auth flow here before moving on.
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row">
      {/* Left — form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12 md:px-20 lg:px-24">
        <div className="w-full max-w-lg">
          <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-14">
            Sign up
          </h1>

          <div className="space-y-8">
            <Field
              label="Full Name"
              name="fullName"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={update("fullName")}
              error={errors.fullName}
              autoComplete="name"
            />

            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your Email address"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
              autoComplete="email"
            />

            <Field
              label="Phone number"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={update("phone")}
              error={errors.phone}
              autoComplete="tel"
            />

            <NavLink
              to="/verify"
              state={form}
              onClick={handleNextClick}
              className="block w-full mt-6 rounded-full bg-orange-500 hover:bg-orange-600
                         active:bg-orange-700 transition-colors text-white text-xl
                         font-semibold py-5 text-center focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-orange-400
                         focus-visible:ring-offset-2"
            >
              Next
            </NavLink>
          </div>
        </div>
      </div>

      {/* Right — hero image: inset rounded card with white margin, not full-bleed */}
      <div className="hidden md:flex md:w-1/2 items-stretch py-8 pr-8">
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

function Field({ label, error, ...inputProps }) {
  return (
    <label className="block">
      <span className="block text-lg font-semibold text-neutral-900 mb-3">
        {label}
      </span>
      <input
        {...inputProps}
        className={`w-full rounded-full border px-6 py-4 text-lg text-neutral-800
                    placeholder:text-neutral-400 focus:outline-none
                    focus:ring-2 focus:ring-orange-400
                    ${error ? "border-red-400" : "border-neutral-300"}`}
      />
      {error && <span className="mt-1 block text-sm text-red-500">{error}</span>}
    </label>
  );
}