import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../Config/firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import heroImage from "../assets/denari-hero.png";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";

function UserIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7v1H4v-1z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export default function PersonalInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    fullName: incomingFullName,
    email,
    phone,
    currency,
  } = location.state || {};

  const [fullName, setFullName] = useState(incomingFullName || "");
  const [dob, setDob] = useState("");
  const [occupation, setOccupation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (fullName.trim() === "") {
      alert("Please enter your full name");
      return;
    }
    if (dob === "") {
      alert("Please select your date of birth");
      return;
    }
    if (occupation.trim() === "") {
      alert("Please enter your occupation");
      return;
    }

    setIsSubmitting(true);
    try {
      await setDoc(
        doc(getFirestore(), "users", auth.currentUser.uid),
        { fullName, email, phone, currency, dob, occupation },
        { merge: true }
      );
      navigate("/account-created", {
        state: { fullName, email, phone, currency, dob, occupation },
      });
    } catch (err) {
      alert(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left — form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-6 md:px-20 lg:px-24">
        <div className="w-full max-w-lg">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-3 whitespace-nowrap">
                Tell us about you
              </h1>
              <p className="text-lg text-neutral-500">
                This helps us personalize your experience
              </p>
            </div>

            <button
              type="button"
              aria-label="Upload profile photo"
              className="relative flex h-16 w-16 shrink-0 items-center justify-center
                         rounded-full bg-orange-500 focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-orange-400
                         focus-visible:ring-offset-2"
            >
              <UserIcon />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center
                                justify-center rounded-full bg-white text-orange-500 shadow">
                <CameraIcon />
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-lg font-bold text-neutral-900 mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder="Enter your full name"
                disabled={isSubmitting}
                className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                           text-base text-neutral-800 placeholder:text-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-orange-400
                           disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            <div>
              <label
                htmlFor="dob"
                className="block text-lg font-bold text-neutral-900 mb-2"
              >
                Date of Birth
              </label>
              <input
                id="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                type="date"
                placeholder="Select your date of birth"
                disabled={isSubmitting}
                className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                           text-base text-neutral-800 placeholder:text-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-orange-400
                           disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            <div>
              <label
                htmlFor="occupation"
                className="block text-lg font-bold text-neutral-900 mb-2"
              >
                Occupation
              </label>
              <input
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                type="text"
                placeholder="Enter your occupation"
                disabled={isSubmitting}
                className="w-full rounded-full border border-neutral-300 px-6 py-3.5
                           text-base text-neutral-800 placeholder:text-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-orange-400
                           disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 rounded-full bg-orange-500 hover:bg-orange-600
                         active:bg-orange-700 transition-colors text-white text-lg
                         font-semibold py-4 focus:outline-none focus-visible:ring-2
                         focus-visible:ring-orange-400 focus-visible:ring-offset-2
                         disabled:bg-orange-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving…" : "Continue"}
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