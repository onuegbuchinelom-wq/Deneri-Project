import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./Pages/Splash";
import Welcome from "./Pages/Welcome";
import SignUp from "./Pages/SignUp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/signup" element={<SignUp />} />
        {/* More routes go here as we build them: /login, /verify, etc. */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;