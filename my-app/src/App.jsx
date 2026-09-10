import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./Pages/Splash";
import Welcome from "./Pages/Welcome";
import SignUp from "./Pages/SignUp";
import Signup2 from "./Pages/Signup2";
import Login from "./Pages/Login";
import Verify from "./Pages/Verify";
import ForgotPassword from "./Pages/ForgotPassword";
import SetupPin from "./Pages/SetupPin";
import EnterPin from "./Pages/EnterPin";
import ChooseCurrency from "./Pages/ChooseCurrency";
import PersonalInfo from "./Pages/PersonalInfo";
import AccountCreated from "./Pages/AccountCreated";
import Dashboard from "./Pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup2" element={<Signup2 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/setup-pin" element={<SetupPin />} />
        <Route path="/enter-pin" element={<EnterPin />} />
        <Route path="/choose-currency" element={<ChooseCurrency />} />
        <Route path="/personal-info" element={<PersonalInfo />} />
        <Route path="/account-created" element={<AccountCreated />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* More routes go here as we build them */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;