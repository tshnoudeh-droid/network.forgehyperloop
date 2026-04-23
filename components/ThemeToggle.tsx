"use client";

type Theme = "dark" | "light";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";
  return (
    <button
      id="theme-toggle"
      onClick={onToggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 1000,
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`,
        background: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        transition: "all 0.3s ease",
        boxShadow: isDark
          ? "0 2px 12px rgba(0,0,0,0.5)"
          : "0 2px 12px rgba(0,0,0,0.1)",
      }}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}
