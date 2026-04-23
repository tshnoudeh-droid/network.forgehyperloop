"use client";

/**
 * TopBar.tsx — Top-left branding + bottom-left network summary strip.
 */

import type { NetworkTotals } from "@/lib/stats";

interface TopBarProps {
  totals: NetworkTotals;
}

export default function TopBar({ totals }: TopBarProps) {
  return (
    <>
      {/* ── Top-left branding ─────────────────────────────────────────── */}
      <div
        id="topbar-brand"
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          zIndex: 10,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1,
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          }}
        >
          Forge Hyperloop
        </div>
        <div
          style={{
            fontSize: "0.55rem",
            fontWeight: 400,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,215,0,0.55)",
            marginTop: 5,
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          }}
        >
          Network Simulation
        </div>
      </div>

      {/* ── Bottom-left network summary ────────────────────────────────── */}
      <div
        id="bottombar-summary"
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 20,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <SummaryItem
          value={String(totals.totalRoutes)}
          label="Routes"
        />
        <Dot />
        <SummaryItem
          value={String(totals.citiesConnected)}
          label="Cities"
        />
        <Dot />
        <SummaryItem
          value={`${totals.totalNetworkKm.toLocaleString("en-US")}`}
          label="km"
        />
      </div>
    </>
  );
}

function SummaryItem({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 5,
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
      }}
    >
      <span
        style={{
          fontSize: "1.15rem",
          fontWeight: 300,
          color: "#ffffff",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "0.55rem",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Dot() {
  return (
    <span
      style={{
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: "rgba(255,215,0,0.3)",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}
