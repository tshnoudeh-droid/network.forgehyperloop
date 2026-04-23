"use client";

import { useState, useMemo } from "react";
import Globe from "@/components/Globe";
import StatsPanel from "@/components/StatsPanel";
import TopBar from "@/components/TopBar";
import { ROUTES, type Route } from "@/lib/routes";
import type { City } from "@/lib/cities";
import { computeNetworkTotals } from "@/lib/stats";

export default function Page() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  // hoveredCity is available for future tooltip use; kept in state for extensibility
  const [, setHoveredCity] = useState<City | null>(null);

  const totals = useMemo(() => computeNetworkTotals(ROUTES), []);

  return (
    <main
      id="main"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#000000",
      }}
    >
      {/* ── Globe area (fills remaining width) ── */}
      <div
        id="globe-area"
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Overlaid branding + summary */}
        <TopBar totals={totals} />

        {/* Globe canvas */}
        <Globe
          routes={ROUTES}
          onArcSelect={setSelectedRoute}
          onCityHover={setHoveredCity}
        />
      </div>

      {/* ── Right stats panel ── */}
      <StatsPanel selectedRoute={selectedRoute} totals={totals} />
    </main>
  );
}
