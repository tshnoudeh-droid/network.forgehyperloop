"use client";

type Theme = "dark" | "light";
interface FooterProps { theme: Theme }

export default function Footer({ theme }: FooterProps) {
  const isDark = theme === "dark";

  const linkStyle = {
    color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
    textDecoration: "none" as const,
    fontSize: "0.7rem",
    letterSpacing: "0.06em",
    transition: "color 0.2s ease",
  };

  return (
    <footer
      id="footer"
      style={{
        background: isDark ? "#0A0A0A" : "#E8E8E3",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
        padding: "60px 5vw",
        display: "flex",
        flexDirection: "column",
        gap: 32,
        transition: "background 0.4s ease",
      }}
    >
      {/* Top row: wordmark + tagline */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
              marginBottom: 6,
            }}
          >
            Forge Hyperloop
          </div>
          <div
            style={{
              fontSize: "0.55rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isDark ? "rgba(255,215,0,0.45)" : "rgba(184,135,10,0.6)",
            }}
          >
            Network Simulation
          </div>
        </div>

        {/* Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          <a href="https://forgehyperloop.com" target="_blank" rel="noreferrer" style={linkStyle}>
            forgehyperloop.com
          </a>
          <a href="https://tawficshnoudeh.com" target="_blank" rel="noreferrer" style={linkStyle}>
            tawficshnoudeh.com
          </a>
          <a href="https://linkedin.com/in/tawficshnoudeh" target="_blank" rel="noreferrer" style={linkStyle}>
            linkedin.com/in/tawficshnoudeh
          </a>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
        }}
      />

      {/* Credit */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.08em",
            color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)",
          }}
        >
          Built by Tawfic Alexander Shnoudeh
        </span>
        <span
          style={{
            fontSize: "0.55rem",
            letterSpacing: "0.06em",
            color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)",
          }}
        >
          © {new Date().getFullYear()} Forge Hyperloop
        </span>
      </div>
    </footer>
  );
}
