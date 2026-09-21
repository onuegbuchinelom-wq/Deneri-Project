import { createContext, useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "./SettingsProvider";

const ThemeContext = createContext(null);

function applyTheme(theme, isDashboard) {
  const isDark = isDashboard && theme === "dark";
  document.documentElement.classList.toggle("dashboard-dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const { settings, saveSettings } = useSettings();
  const theme = settings.theme;
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    applyTheme(theme, isDashboard);

    return undefined;
  }, [isDashboard, theme]);

  function setTheme(nextTheme) {
    void saveSettings({ theme: nextTheme });
  }

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
