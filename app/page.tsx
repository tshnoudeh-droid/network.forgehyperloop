"use client";

import { useState, useMemo, useEffect } from "react";
import Globe from "@/components/Globe";
import Hero from "@/components/Hero";
import InfoSection from "@/components/InfoSection";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import TopBar from "@/components/TopBar";
import { ROUTES, type Route } from "@/lib/routes";
import type { City } from "@/lib/cities";
import { computeNetworkTotals } from "@/lib/stats";

type Theme = "dark" | "light";

export default function Page() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [, setHoveredCity] = useState<City | null>(null);

  const totals = useMemo(() => computeNetworkTotals(ROUTES), []);

  // Sync theme to <html data-theme>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <>
      {/* Fixed theme toggle — always on top */}
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {/* ── Section 1: Hero ── */}
      <Hero theme={theme} />

      {/* ── Section 2: Globe ── */}
      <section
        id="globe-section"
        style={{
          height: "100vh",
          position: "relative",
          overflow: "hidden",
          background: theme === "dark" ? "#0E0E0C" : "#FFFFFF",
          transition: "background 0.4s ease",
        }}
      >
        {/* Branding overlay */}
        <TopBar totals={totals} />

        {/* Globe fills full section */}
        <Globe
          routes={ROUTES}
          theme={theme}
          onArcSelect={setSelectedRoute}
          onCityHover={setHoveredCity}
        />

        {/* Scroll-down cue at bottom of globe */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: "0.55rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: theme === "dark" ? "rgba(203,201,196,0.3)" : "rgba(14,14,12,0.3)",
            }}
          >
            Scroll for network data
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.25 }}>
            <path
              d="M8 3v10M3 9l5 5 5-5"
              stroke={theme === "dark" ? "#fff" : "#000"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Selected route pill */}
        {selectedRoute && (
          <div
            style={{
              position: "absolute",
              top: 60,
              left: "50%",
              transform: "translateX(-50%)",
              background: theme === "dark" ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${theme === "dark" ? "rgba(195,169,132,0.3)" : "rgba(195,169,132,0.25)"}`,
              borderRadius: 24,
              padding: "8px 20px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: "0.72rem",
              color: theme === "dark" ? "#fff" : "#0E0E0C",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              zIndex: 20,
              cursor: "pointer",
            }}
            onClick={() => setSelectedRoute(null)}
          >
            <span style={{ color: theme === "dark" ? "rgba(195,169,132,0.8)" : "rgba(195,169,132,0.9)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Route selected</span>
            <span>↓ Scroll to see stats</span>
            <span style={{ opacity: 0.4, fontSize: "0.65rem" }}>✕</span>
          </div>
        )}
      </section>

      {/* ── Section 3: Information ── */}
      <InfoSection
        selectedRoute={selectedRoute}
        totals={totals}
        theme={theme}
      />

      {/* ── Section 4: Footer ── */}
      <Footer theme={theme} />
    </>
  );
}
