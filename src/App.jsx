import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./Pages/Splash";
import Welcome from "./Pages/Welcome";
import SignUp from "./Pages/Signup";
import Signup2 from "./Pages/Signup2";
import Login from "./Pages/Login";
import Verify from "./Pages/Verify";
import ForgotPassword from "./Pages/ForgotPassword";
import SetupPin from "./Pages/SetupPin";
import EnterPin from "./Pages/EnterPin";
import ChooseCurrency from "./Pages/ChooseCurrency";
import PersonalInfo from "./Pages/PersonalInfo";
import AccountCreated from "./Pages/AccountCreated";
import DashboardLayout from "./Components/DashboardLayout";
import Home from "./Pages/Home";
import AddExpense from "./Pages/AddExpense";

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

        {/* Everything inside here shares the sidebar */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="add-expense" element={<AddExpense />} />

          {/* more dashboard pages get added here as you send them:
              <Route path="budget" element={<Budget />} />
              <Route path="add-expense" element={<AddExpense />} />
              <Route path="savings" element={<SavingsGoals />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
          */}
        </Route>

        {/* More routes go here as we build them */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;