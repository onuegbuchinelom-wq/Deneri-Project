import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../Config/firebase";

const DEFAULT_SETTINGS = {
  language: "en",
  currency: "NGN",
  dateFormat: "DD/MM/YYYY",
  firstDayOfWeek: "Monday",
  theme: "light",
  notifications: {
    master: true,
    expenseAdded: true,
    savingsAdded: true,
    goalReminders: true,
    monthlySummary: true,
    securityAlerts: true,
  },
  privacy: {
    showBalance: true,
    showSavings: true,
    saveHistory: true,
    analytics: true,
  },
  security: {
    biometric: false,
    requirePinOnOpen: false,
  },
};

const SettingsContext = createContext(null);

function getCachedSettings() {
  try {
    const cached = localStorage.getItem("denari-settings");
    return cached ? mergeSettings(JSON.parse(cached)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function mergeSettings(saved = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(saved.notifications || {}) },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...(saved.privacy || {}) },
    security: { ...DEFAULT_SETTINGS.security, ...(saved.security || {}) },
  };
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(getCachedSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let unsubscribeUser;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeUser?.();
      if (!user) {
        setSettings(getCachedSettings());
        setSettingsLoaded(true);
        return;
      }
      unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        const next = mergeSettings(snapshot.exists() ? snapshot.data().settings : {});
        localStorage.setItem("denari-settings", JSON.stringify(next));
        setSettings(next);
        setSettingsLoaded(true);
      }, (error) => {
        console.error("Failed to load settings:", error.message);
        setSettingsLoaded(true);
      });
    });
    return () => {
      unsubscribeUser?.();
      unsubscribeAuth();
    };
  }, []);

  async function saveSettings(changes) {
    const user = auth.currentUser;
    const next = mergeSettings({ ...settings, ...changes });
    localStorage.setItem("denari-settings", JSON.stringify(next));
    setSettings(next);
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), { settings: next });
      } catch (error) {
        console.error("Failed to save settings to Firestore:", error.message);
      }
    }
  }

  function formatCurrency(amount, options = {}) {
    const currency = settings.currency || "NGN";
    const locale = currency === "NGN" ? "en-NG" : currency === "GBP" ? "en-GB" : currency === "EUR" ? "de-DE" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: options.maximumFractionDigits ?? 0,
      ...options,
    }).format(Number(amount || 0));
  }

  const value = useMemo(() => ({
    settings,
    settingsLoaded,
    saveSettings,
    formatCurrency,
  }), [settings, settingsLoaded]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside SettingsProvider");
  return context;
}
