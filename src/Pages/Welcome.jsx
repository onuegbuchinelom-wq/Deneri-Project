import { NavLink } from "react-router-dom";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";

function Welcome() {
  return (
    <div className="flex h-screen items-center justify-center bg-white px-6">
      <div className="w-[563px] max-w-full flex flex-col items-center">
        <h1 className="font-semibold text-5xl text-center leading-normal text-black">
          Welcome to <br />
          <span className="font-bold text-[#FF8D28]">DENARI</span>
        </h1>

        <p className="mt-8 max-w-full text-2xl text-center font-normal leading-normal text-black">
          Your personal finance <br />
          companion
        </p>

        <NavLink
          to="/signup"
          className="mt-20 flex h-16 w-[420px] max-w-full items-center justify-center rounded-xl bg-[#E95E08] px-8 text-xl font-semibold text-white"
        >
          Get Started
        </NavLink>

        <div className="mt-4 flex h-16 w-[420px] max-w-full items-center justify-center gap-1 rounded-xl border border-[#FF8D28] px-8 text-center text-base text-black">
          Already have an account?
          <NavLink to="/login" className="font-semibold text-[#FF8D28]">
            Log In
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Welcome;