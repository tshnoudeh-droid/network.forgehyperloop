"use client";

type Theme = "dark" | "light";

interface HeroProps {
  theme: Theme;
  citiesConnected: number;
}

export default function Hero({ theme, citiesConnected }: HeroProps) {
  const isDark = theme === "dark";

  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: isDark ? "#0E0E0C" : "#FFFFFF",
        overflow: "hidden",
        padding: "0 24px",
      }}
    >
      {/* Radial glow behind text */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: isDark
            ? "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(195,169,132,0.07) 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(195,169,132,0.09) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top rule */}
      <div
        style={{
          width: 1,
          height: 80,
          background: `linear-gradient(to bottom, transparent, ${isDark ? "rgba(195,169,132,0.4)" : "rgba(195,169,132,0.4)"})`,
          marginBottom: 48,
        }}
      />

      {/* Label above */}
      <p
        style={{
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: isDark ? "rgba(195,169,132,0.75)" : "rgba(195,169,132,0.85)",
          marginBottom: 20,
        }}
      >
        Forge Hyperloop
      </p>

      {/* Giant NETWORK heading */}
      <h1
        style={{
          fontSize: "clamp(4rem, 14vw, 14rem)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          lineHeight: 0.9,
          color: isDark ? "#ffffff" : "#0E0E0C",
          textAlign: "center",
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          userSelect: "none",
        }}
      >
        NETWORK
      </h1>

      {/* Thin divider */}
      <div
        style={{
          width: "clamp(120px, 30vw, 320px)",
          height: 1,
          background: isDark
            ? "linear-gradient(to right, transparent, rgba(195,169,132,0.5), transparent)"
            : "linear-gradient(to right, transparent, rgba(195,169,132,0.4), transparent)",
          margin: "32px 0",
        }}
      />

      {/* Subtitle */}
      <p
        style={{
          fontSize: "clamp(0.65rem, 1.5vw, 0.85rem)",
          fontWeight: 400,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: isDark ? "rgba(203,201,196,0.55)" : "rgba(14,14,12,0.5)",
          textAlign: "center",
          maxWidth: 420,
          lineHeight: 1.8,
        }}
      >
        A global infrastructure simulation
        <br />
        connecting {citiesConnected} cities across 6 continents
      </p>

      {/* Bottom scroll cue */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          animation: "fadeUp 2s ease infinite alternate",
        }}
      >
        <span
          style={{
            fontSize: "0.55rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: isDark ? "rgba(203,201,196,0.35)" : "rgba(14,14,12,0.3)",
          }}
        >
          Scroll to explore
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ opacity: 0.35 }}
        >
          <path
            d="M8 3v10M3 9l5 5 5-5"
            stroke={isDark ? "#fff" : "#000"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
