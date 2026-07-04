/**
 * ThemeContext — light / dark-luxury mode. Persists to localStorage.
 * Also sets `data-theme` on <html> so CSS can key off it.
 */
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("aayat_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("aayat_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle: () => setTheme(t => t === "dark" ? "light" : "dark") }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
