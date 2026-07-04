import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function DarkModeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      data-testid="dark-mode-toggle"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-9 h-9 flex items-center justify-center text-white/70 hover:text-[#C8A96A] transition-colors ${className}`}
    >
      {theme === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
    </button>
  );
}
