import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/denari-logo.png.png";
import "@fontsource/plus-jakarta-sans/600.css";

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/Welcome");
    }, 2800); // one full loop of the breathing animation

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-[#FF8D28] ">
      <div className="absolute  flex flex-col items-center justify-center">
        <div className="relative aspect-[3/2] w-[372px] max-w-full overflow-hidden">
        <img
          src={logo}
          alt="Denari"
          className="absolute inset-0 h-full w-full animate-[logo-breathe_2.8s_ease-out_infinite]"
        />
      </div>
      <p className="relative left-[68.50px] h-[60px] w-[312px] max-w-full text-left text-[24px] font-semibold
       leading-normal text-[#FFF6F6] animate-[tagline-breathe_2.8s_ease-out_infinite]">
        Take control of your money <br />build your tomorrow
      </p>

      </div>
      
    </div>
  );
}

export default Splash;