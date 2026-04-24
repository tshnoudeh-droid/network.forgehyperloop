"use client";

import { useFadeIn } from "@/lib/useFadeIn";
import type { Route } from "@/lib/routes";
import type { NetworkTotals } from "@/lib/stats";
import { CITIES } from "@/lib/cities";
import {
  hyperloopTimeH,
  planeTimeH,
  timeSavedH,
  energyPerSeatKwh,
  ticketPriceUsd,
  co2AvoidedKgPerPassenger,
  co2NetworkComparator,
  formatHours,
  formatKm,
  formatUsd,
  formatKwh,
  formatCo2Kg,
} from "@/lib/stats";
import { TiltCard } from "@/components/TiltCard";

type Theme = "dark" | "light";

interface InfoSectionProps {
  selectedRoute: Route | null;
  totals: NetworkTotals;
  theme: Theme;
}

/* ── Stat tile (big number) ── */
function StatTile({
  label,
  value,
  sub,
  delay,
  theme,
}: {
  label: string;
  value: string;
  sub?: string;
  delay: number;
  theme: Theme;
}) {
  const isDark = theme === "dark";
  return (
    <TiltCard
      tiltLimit={8}
      scale={1.04}
      className={`glass-card fade-in delay-${delay}`}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
        }}
      >
        <span
          style={{
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: isDark ? "rgba(195,169,132,0.8)" : "rgba(195,169,132,0.9)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: '"SF Mono", "JetBrains Mono", ui-monospace, monospace',
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: 300,
            letterSpacing: "-0.03em",
            color: isDark ? "#ffffff" : "#0E0E0C",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {sub && (
          <span
            style={{
              fontSize: "0.58rem",
              color: isDark ? "rgba(203,201,196,0.38)" : "rgba(14,14,12,0.32)",
              letterSpacing: "0.04em",
              lineHeight: 1.5,
            }}
          >
            {sub}
          </span>
        )}
      </div>
    </TiltCard>
  );
}

/* ── Stat row (label / value pair) ── */
function StatRow({
  label,
  value,
  source,
  highlight,
  theme,
}: {
  label: string;
  value: string;
  source?: string;
  highlight?: boolean;
  theme: Theme;
}) {
  const isDark = theme === "dark";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: `1px solid ${isDark ? "rgba(203,201,196,0.08)" : "rgba(14,14,12,0.07)"}`,
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontSize: "0.7rem",
            color: isDark ? "rgba(203,201,196,0.6)" : "rgba(14,14,12,0.5)",
          }}
        >
          {label}
        </span>
        {source && (
          <span
            style={{
              fontSize: "0.55rem",
              color: isDark ? "rgba(203,201,196,0.28)" : "rgba(14,14,12,0.28)",
              letterSpacing: "0.04em",
            }}
          >
            {source}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: '"SF Mono", "JetBrains Mono", ui-monospace, monospace',
          fontSize: "0.88rem",
          fontWeight: 500,
          color: highlight
            ? "#C3A984"
            : isDark ? "#ffffff" : "#0E0E0C",
          flexShrink: 0,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function InfoSection({ selectedRoute, totals, theme }: InfoSectionProps) {
  const isDark = theme === "dark";
  const totalsRef = useFadeIn(0.1);
  const routeRef = useFadeIn(0.1);

  const sectionBg = isDark ? "#0E0E0C" : "#FFFFFF";
  const headingColor = isDark ? "#fff" : "#0E0E0C";

  return (
    <section
      id="info"
      style={{
        background: sectionBg,
        padding: "120px 5vw",
        minHeight: "100vh",
        transition: "background 0.4s ease",
      }}
    >
      {/* Section header */}
      <div ref={totalsRef}>
        <div className="fade-in" style={{ marginBottom: 64 }}>
          <p
            style={{
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: isDark ? "rgba(195,169,132,0.75)" : "rgba(195,169,132,0.85)",
              marginBottom: 12,
            }}
          >
            Network Data
          </p>
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: headingColor,
              lineHeight: 1.1,
            }}
          >
            {totals.totalRoutes} routes.<br />
            {totals.citiesConnected} cities.
          </h2>
        </div>

        {/* Network totals grid */}
        <div
          className="stat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 80,
          }}
        >
          <StatTile label="Total Routes" value={String(totals.totalRoutes)} delay={1} theme={theme} />
          <StatTile label="Cities Connected" value={String(totals.citiesConnected)} delay={2} theme={theme} />
          <StatTile
            label="Network Length"
            value={`${totals.totalNetworkKm.toLocaleString("en-US")} km`}
            delay={3}
            theme={theme}
          />
          <StatTile
            label="CO₂ Avoided Daily"
            value={`${totals.co2AvoidedTonnes.toLocaleString("en-US")} t`}
            sub={co2NetworkComparator(totals.co2AvoidedTonnes)}
            delay={4}
            theme={theme}
          />
        </div>
      </div>

      {/* Route analysis + Design constants */}
      <div
        ref={routeRef}
        className="route-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 80,
        }}
      >
        {/* Route Analysis */}
        <TiltCard
          tiltLimit={5}
          scale={1.02}
          className="glass-card fade-in delay-1"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div style={{ padding: "32px 28px", flex: 1 }}>
            <p
              style={{
                fontSize: "0.58rem",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: isDark ? "rgba(195,169,132,0.8)" : "rgba(195,169,132,0.9)",
                marginBottom: 20,
              }}
            >
              Route Analysis
            </p>
            {selectedRoute ? (
              <>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: "1.2rem" }}>{CITIES[selectedRoute.from].flag}</span>
                    <span style={{ fontSize: "1rem", fontWeight: 600, color: headingColor }}>
                      {CITIES[selectedRoute.from].name}
                    </span>
                  </div>
                  <div style={{ width: 24, height: 1, background: "rgba(195,169,132,0.5)", margin: "6px 0 6px 4px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.2rem" }}>{CITIES[selectedRoute.to].flag}</span>
                    <span style={{ fontSize: "1rem", fontWeight: 600, color: headingColor }}>
                      {CITIES[selectedRoute.to].name}
                    </span>
                  </div>
                </div>
                <StatRow label="Hyperloop Time" value={formatHours(hyperloopTimeH(selectedRoute.distanceKm))} source="@ 1,000 km/h design spec" highlight theme={theme} />
                <StatRow label="Aviation Time" value={formatHours(planeTimeH(selectedRoute.distanceKm))} source="@ 900 km/h + 3h overhead" theme={theme} />
                <StatRow label="Time Saved" value={formatHours(timeSavedH(selectedRoute.distanceKm))} highlight theme={theme} />
                <StatRow label="Est. Ticket" value={formatUsd(ticketPriceUsd(selectedRoute.distanceKm))} source="$0.10/km proxy" theme={theme} />
                <StatRow label="Energy / Seat" value={formatKwh(energyPerSeatKwh(selectedRoute.distanceKm))} source="40 Wh/pax-km (Tandfonline 2020)" theme={theme} />
                <StatRow label="CO₂ Avoided" value={formatCo2Kg(co2AvoidedKgPerPassenger(selectedRoute.distanceKm))} source="vs ICAO 0.255 kg/pax-km" highlight theme={theme} />
                <StatRow label="Distance" value={formatKm(selectedRoute.distanceKm)} theme={theme} />
              </>
            ) : (
              <div
                style={{
                  padding: "40px 0",
                  color: isDark ? "rgba(203,201,196,0.3)" : "rgba(14,14,12,0.28)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.06em",
                }}
              >
                Click any arc on the globe above to analyse a specific route.
              </div>
            )}
          </div>
        </TiltCard>

        {/* Design constants */}
        <TiltCard
          tiltLimit={5}
          scale={1.02}
          className="glass-card fade-in delay-2"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div style={{ padding: "32px 28px", flex: 1 }}>
            <p
              style={{
                fontSize: "0.58rem",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: isDark ? "rgba(195,169,132,0.8)" : "rgba(195,169,132,0.9)",
                marginBottom: 20,
              }}
            >
              Design Constants
            </p>
            <StatRow label="Pod Speed" value="1,000 km/h" source="system design spec / CASIC T-Flight benchmark" theme={theme} />
            <StatRow label="Aviation Speed" value="900 km/h" source="avg commercial cruise (880–926 km/h)" theme={theme} />
            <StatRow label="Airport Overhead" value="3 hours" source="standard boarding / security estimate" theme={theme} />
            <StatRow label="Pod Capacity" value="28 seats" source="design capacity estimate" theme={theme} />
            <StatRow label="Energy" value="40 Wh/pax-km" source="Tandfonline (2020)" theme={theme} />
            <StatRow label="Aviation CO₂" value="0.255 kg/pax-km" source="ICAO standard" theme={theme} />
            <StatRow label="Hyperloop CO₂" value="0.015 kg/pax-km" source="Springer (2023), renewables assumption" theme={theme} />
            <StatRow label="Ticket Proxy" value="$0.10 / km" source="Helsinki–Stockholm feasibility study" theme={theme} />
          </div>
        </TiltCard>
      </div>
    </section>
  );
}
