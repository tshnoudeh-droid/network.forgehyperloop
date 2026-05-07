"use client";

import { useState, useMemo, useEffect } from "react";
import Globe from "@/components/Globe";
import Hero from "@/components/Hero";
import InfoSection from "@/components/InfoSection";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import TopBar from "@/components/TopBar";
import { ROUTES, routesUpToPhase, type Route } from "@/lib/routes";
import { CITIES, CITY_LIST } from "@/lib/cities";
import type { City } from "@/lib/cities";
import { computeNetworkTotals } from "@/lib/stats";
import PhaseToggle, { type PhaseFilter } from "@/components/PhaseToggle";

type Theme = "dark" | "light";

const PHASE_DETAILS: Record<number, { title: string; timeline: string; description: string; keyFact: string }> = {
  1: {
    title: "Asian Spine",
    timeline: "2030 – 2040",
    description: "Shanghai to Singapore via Tokyo, Seoul, Hong Kong, and Bangkok — the world's highest-volume manufacturing corridor. Links East Asia's three largest economies with Southeast Asia, eliminating the region's most congested air and sea lanes. No undersea tunnels longer than 200 km required in this phase.",
    keyFact: "~40% of global manufactured goods flow through this corridor",
  },
  2: {
    title: "South & West Asia",
    timeline: "2035 – 2045",
    description: "Extends west from Singapore through Mumbai into Dubai, bridging the Indian Ocean manufacturing belt. India's industrial growth corridor from Chennai to Mumbai becomes a hyperloop export artery. The Palk Strait crossing is the first major undersea SFT segment, validating the technology for longer ocean crossings ahead.",
    keyFact: "First undersea SFT segment — Palk Strait as proof of concept",
  },
  3: {
    title: "Europe & Africa",
    timeline: "2040 – 2050",
    description: "Branches north from Dubai through Cairo, then spans Sub-Saharan Africa via Lagos to Johannesburg. The network's most transformative phase — connecting a continent with no existing intercontinental fixed-link infrastructure. A 4,200 km Sahara overland segment routes through established oil infrastructure corridors.",
    keyFact: "Unlocks $2T+ in previously landlocked African resource exports",
  },
  4: {
    title: "Transatlantic",
    timeline: "2048 – 2060",
    description: "First fixed crossing of the Atlantic via a submerged floating tunnel anchored to the Azores seamount chain. The Azores waypoint splits the span into two manageable 2,800 km sections, each proven by earlier phases. New York to London in under 4 hours — the two largest financial centres connected by zero-carbon freight.",
    keyFact: "New York → London in under 4 hours",
  },
  5: {
    title: "Transpacific & Completion",
    timeline: "2055 – 2070",
    description: "Los Angeles to Tokyo via deep-ocean SFT, then onward to Sydney — closing the global loop back into Phase 1's Asian network. The Transpacific span crosses the deepest oceanic trench system on Earth. Loop closure enables full network redundancy: any city can reach any other via two independent paths.",
    keyFact: "Global loop complete — full network redundancy achieved",
  },
};

export default function Page() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [, setHoveredCity] = useState<City | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<PhaseFilter>("all");

  const totals = useMemo(() => computeNetworkTotals(ROUTES), []);

  const filteredRoutes = useMemo(
    () => selectedPhase === "all" ? ROUTES : routesUpToPhase(selectedPhase),
    [selectedPhase]
  );

  const filteredCities = useMemo(
    () => selectedPhase === "all"
      ? CITY_LIST
      : CITY_LIST.filter((c) => c.phase <= selectedPhase),
    [selectedPhase]
  );

  // Sync theme to <html data-theme>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handlePhaseSelect = (p: PhaseFilter) => {
    setSelectedPhase(p);
    if (p !== "all" && selectedRoute && selectedRoute.phase > p) {
      setSelectedRoute(null);
    }
  };

  return (
    <>
      {/* Fixed theme toggle — always on top */}
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {/* ── Section 1: Hero ── */}
      <Hero theme={theme} citiesConnected={totals.citiesConnected} />

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

        {/* Phase filter toggle — top-center */}
        <PhaseToggle selected={selectedPhase} onSelect={handlePhaseSelect} theme={theme} />

        {/* Left-side phase description panel */}
        {selectedPhase !== "all" && (() => {
          const detail = PHASE_DETAILS[selectedPhase as number];
          return detail ? (
            <div
              style={{
                position: "absolute",
                left: 24,
                top: "50%",
                transform: "translateY(-50%)",
                background: theme === "dark" ? "rgba(14,14,12,0.80)" : "rgba(255,255,255,0.88)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(195,169,132,0.25)",
                borderRadius: 12,
                padding: "24px 28px",
                width: 280,
                zIndex: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Phase label */}
              <span
                style={{
                  fontSize: "0.52rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(195,169,132,0.8)",
                  fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                }}
              >
                Phase {selectedPhase}
              </span>

              {/* Title */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    color: theme === "dark" ? "#ffffff" : "#0E0E0C",
                    lineHeight: 1.2,
                    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                  }}
                >
                  {detail.title}
                </span>
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontFamily: '"SF Mono", "JetBrains Mono", ui-monospace, monospace',
                    color: "rgba(195,169,132,0.75)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {detail.timeline}
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(195,169,132,0.15)" }} />

              {/* Long description */}
              <p
                style={{
                  fontSize: "0.75rem",
                  color: theme === "dark" ? "rgba(203,201,196,0.78)" : "rgba(14,14,12,0.72)",
                  lineHeight: 1.7,
                  margin: 0,
                  fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                }}
              >
                {detail.description}
              </p>

              {/* Key fact */}
              <div
                style={{
                  background: "rgba(195,169,132,0.08)",
                  border: "1px solid rgba(195,169,132,0.2)",
                  borderRadius: 6,
                  padding: "10px 14px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#C3A984",
                    lineHeight: 1.5,
                    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                  }}
                >
                  {detail.keyFact}
                </span>
              </div>
            </div>
          ) : null;
        })()}

        {/* Globe fills full section */}
        <Globe
          routes={filteredRoutes}
          cities={filteredCities}
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

        {/* Right-side route indicator */}
        {selectedRoute && (
          <div
            style={{
              position: "absolute",
              right: 24,
              top: "50%",
              transform: "translateY(-50%)",
              background: theme === "dark" ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.88)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(195,169,132,0.25)",
              borderRadius: 12,
              padding: "20px 24px",
              minWidth: 180,
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: "0.52rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(195,169,132,0.8)",
              }}
            >
              Route selected
            </span>
            <div
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: theme === "dark" ? "#fff" : "#0E0E0C",
                lineHeight: 1.6,
              }}
            >
              {CITIES[selectedRoute.from].flag} {CITIES[selectedRoute.from].name}
              <br />
              <span style={{ opacity: 0.35, fontSize: "0.65rem" }}>↓</span>
              <br />
              {CITIES[selectedRoute.to].flag} {CITIES[selectedRoute.to].name}
            </div>
            <button
              onClick={() => document.getElementById("info")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                background: "rgba(195,169,132,0.12)",
                border: "1px solid rgba(195,169,132,0.3)",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.58rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(195,169,132,0.9)",
                padding: "6px 12px",
                width: "100%",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(195,169,132,0.22)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(195,169,132,0.12)")}
            >
              ↓ View details
            </button>
            <button
              onClick={() => setSelectedRoute(null)}
              style={{
                position: "absolute",
                top: 10,
                right: 12,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.65rem",
                color: theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
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
