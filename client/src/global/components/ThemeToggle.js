import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = ({ className = "" }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`btn btn-circle btn-sm btn-ghost hover:bg-base-content/10 transition-transform duration-200 hover:scale-110 active:scale-95 ${className}`}
    >
      {isDark ? (
        <FaSun className="text-amber-400 text-base animate-pulse-slow" />
      ) : (
        <FaMoon className="text-indigo-600 text-base" />
      )}
    </button>
  );
};

export default ThemeToggle;
