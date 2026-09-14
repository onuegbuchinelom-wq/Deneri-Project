import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import heroImage from "../assets/denari-hero.png";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // will hold E.164 format, e.g. +2348133901794
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    if (fullName.trim() === "") {
      alert("Please enter your full name");
      return;
    }
    if (email === "") {
      alert("Please enter your email");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!phone) {
      alert("Please enter your phone number");
      return;
    }

    // TODO: send { fullName, email, phone } to your API here.
    navigate("/signup2", { state: { fullName, email, phone } });
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
                htmlFor="fullName"
                className="block text-base font-semibold text-neutral-900 mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                           text-base text-neutral-800 placeholder:text-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-base font-semibold text-neutral-900 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your Email address"
                className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                           text-base text-neutral-800 placeholder:text-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-base font-semibold text-neutral-900 mb-2"
              >
                Phone number
              </label>
              <PhoneInput
                id="phone"
                international
                defaultCountry="NG"
                value={phone}
                onChange={setPhone}
                placeholder="Enter your phone number"
                className="denari-phone-input w-full rounded-full border border-neutral-300 px-6 py-3.5
                           text-base text-neutral-800
                           focus-within:ring-2 focus-within:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 rounded-full bg-orange-500 hover:bg-orange-600
                         active:bg-orange-700 transition-colors text-white text-lg
                         font-semibold py-4 focus:outline-none focus-visible:ring-2
                         focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            >
              Next
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