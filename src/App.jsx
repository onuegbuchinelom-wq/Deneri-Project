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
import ProtectedRoute from "./Routes/ProtectedRoute";
import Home from "./Pages/Home";
import AddExpense from "./Pages/AddExpense";
import Budget from "./Pages/Budget";
import BudgetSetup from "./Pages/BudgetSetup";
import Analytics from "./Pages/Analytics";
import TransactionHistory from "./Pages/TransactionHistory";
import SavingsGoals from "./Pages/SavingsGoals";
import Profile from "./Pages/Profile";
import Settings from "./Pages/Settings";
import PersonalInfoDetail from "./Pages/PersonalInfoDetail";
import BankAccounts from "./Pages/BankAccounts";
import LinkedDevices from "./Pages/LinkedDevices";
import Security from "./Pages/Security";
import HelpSupport from "./Pages/HelpSupport";
import InviteFriends from "./Pages/InviteFriends";
import GeneralSettings from "./Pages/GeneralSettings";
import NotificationSettings from "./Pages/NotificationSettings";
import PrivacySettings from "./Pages/PrivacySettings";
import AboutDenari from "./Pages/AboutDenari";
import { ThemeProvider } from "./Components/ThemeProvider";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
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

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="add-expense" element={<AddExpense />} />
            <Route path="budget" element={<Budget />} />
            <Route path="budget-setup" element={<BudgetSetup />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="transactions" element={<TransactionHistory />} />
            <Route path="savings" element={<SavingsGoals />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile/personal-info" element={<PersonalInfoDetail />} />
            <Route path="profile/bank-accounts" element={<BankAccounts />} />
            <Route path="profile/linked-devices" element={<LinkedDevices />} />
            <Route path="profile/help" element={<HelpSupport />} />
            <Route path="profile/invite" element={<InviteFriends />} />
            <Route path="settings/general" element={<GeneralSettings />} />
            <Route path="settings/notifications" element={<NotificationSettings />} />
            <Route path="settings/privacy" element={<PrivacySettings />} />
            <Route path="settings/security" element={<Security />} />
            <Route path="settings/about" element={<AboutDenari />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <div className="h-screen w-full bg-white flex flex-col items-center justify-center px-8 text-center">
              <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
              <p className="text-xl font-semibold text-neutral-900 mb-2">Page not found</p>
              <p className="text-neutral-500">The page you&apos;re looking for doesn&apos;t exist.</p>
            </div>
          }
        />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;