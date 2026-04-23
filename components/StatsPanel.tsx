"use client";

/**
 * StatsPanel.tsx — Right-side stats panel.
 *
 * Default state: network totals.
 * Selected route: per-route calculations.
 */

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
  formatHours,
  formatKm,
  formatUsd,
  formatKwh,
  formatCo2Kg,
} from "@/lib/stats";

// ── Sub-components ────────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  highlight,
  sub,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  sub?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span
        style={{
          fontSize: "0.6rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily:
            '"SF Mono", "JetBrains Mono", "Fira Code", ui-monospace, monospace',
          fontSize: "0.95rem",
          fontWeight: 500,
          color: highlight ? "#FFD700" : "#ffffff",
          lineHeight: 1.3,
        }}
      >
        {value}
      </span>
      {sub && (
        <span
          style={{
            fontSize: "0.58rem",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.04em",
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: "16px 0 4px",
      }}
    >
      <span
        style={{
          fontSize: "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,215,0,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: "rgba(255,215,0,0.12)",
        }}
      />
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface StatsPanelProps {
  selectedRoute: Route | null;
  totals: NetworkTotals;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StatsPanel({ selectedRoute, totals }: StatsPanelProps) {
  return (
    <aside
      id="stats-panel"
      style={{
        width: 280,
        minWidth: 280,
        height: "100%",
        background: "#0A0A0A",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: "20px 20px 0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,215,0,0.6)",
            marginBottom: 6,
          }}
        >
          {selectedRoute ? "Route Analysis" : "Network Overview"}
        </div>
        {selectedRoute ? (
          <RouteHeader route={selectedRoute} />
        ) : (
          <NetworkHeader totals={totals} />
        )}
      </div>

      {/* Stats body */}
      <div style={{ padding: "0 20px 24px", flex: 1 }}>
        {selectedRoute ? (
          <RouteStats route={selectedRoute} />
        ) : (
          <NetworkStats totals={totals} />
        )}
      </div>

      {/* Footer note */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontSize: "0.55rem",
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.04em",
          lineHeight: 1.6,
        }}
      >
        {selectedRoute
          ? "Click any arc to analyse a route. All stats computed from design constants."
          : "Click any arc on the globe to analyse a specific route."}
      </div>
    </aside>
  );
}

// ── Route header ─────────────────────────────────────────────────────────────

function RouteHeader({ route }: { route: Route }) {
  const a = CITIES[route.from];
  const b = CITIES[route.to];
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>{a.flag}</span>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#ffffff",
          }}
        >
          {a.name}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: 16,
            height: 1,
            background: "rgba(255,215,0,0.5)",
            marginLeft: 2,
          }}
        />
        <span
          style={{
            fontSize: "0.58rem",
            color: "rgba(255,215,0,0.6)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {route.distanceKm.toLocaleString("en-US")} km
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>{b.flag}</span>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#ffffff",
          }}
        >
          {b.name}
        </span>
      </div>
    </div>
  );
}

// ── Route stats ───────────────────────────────────────────────────────────────

function RouteStats({ route }: { route: Route }) {
  const d = route.distanceKm;
  return (
    <>
      <Divider label="Travel Time" />
      <StatRow
        label="Hyperloop"
        value={formatHours(hyperloopTimeH(d))}
        highlight
        sub="@ 1,000 km/h design spec"
      />
      <StatRow
        label="Commercial Aviation"
        value={formatHours(planeTimeH(d))}
        sub="@ 900 km/h + 3h airport overhead"
      />
      <StatRow
        label="Time Saved"
        value={formatHours(timeSavedH(d))}
        highlight
      />

      <Divider label="Economics" />
      <StatRow
        label="Est. Ticket Price"
        value={formatUsd(ticketPriceUsd(d))}
        sub="$0.10/km — Helsinki–Stockholm proxy"
      />
      <StatRow
        label="Energy Per Seat"
        value={formatKwh(energyPerSeatKwh(d))}
        sub="40 Wh/passenger-km (Tandfonline 2020)"
      />

      <Divider label="Sustainability" />
      <StatRow
        label="CO₂ Avoided vs Flying"
        value={formatCo2Kg(co2AvoidedKgPerPassenger(d))}
        highlight
        sub="per passenger vs ICAO 0.255 kg/km"
      />
      <StatRow
        label="Route Distance"
        value={formatKm(d)}
      />
    </>
  );
}

// ── Network header ────────────────────────────────────────────────────────────

function NetworkHeader({ totals }: { totals: NetworkTotals }) {
  return (
    <div
      style={{
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "#ffffff",
        letterSpacing: "-0.01em",
      }}
    >
      Global Network
      <div
        style={{
          fontSize: "0.65rem",
          fontWeight: 400,
          color: "rgba(255,255,255,0.4)",
          marginTop: 2,
          letterSpacing: "0.02em",
        }}
      >
        {totals.citiesConnected} cities · {totals.totalRoutes} routes
      </div>
    </div>
  );
}

// ── Network stats ─────────────────────────────────────────────────────────────

function NetworkStats({ totals }: { totals: NetworkTotals }) {
  return (
    <>
      <Divider label="Coverage" />
      <StatRow
        label="Total Routes"
        value={String(totals.totalRoutes)}
        highlight
      />
      <StatRow label="Cities Connected" value={String(totals.citiesConnected)} />
      <StatRow
        label="Network Length"
        value={`${totals.totalNetworkKm.toLocaleString("en-US")} km`}
      />

      <Divider label="Daily Impact (est.)" />
      <StatRow
        label="CO₂ Avoided vs All-Fly"
        value={`${totals.co2AvoidedTonnes.toLocaleString("en-US")} t CO₂`}
        highlight
        sub="per full pod cycle across network"
      />

      <Divider label="Design Constants" />
      <StatRow label="Pod Speed" value="1,000 km/h" sub="system design spec" />
      <StatRow label="Pod Capacity" value="28 seats" sub="design estimate" />
      <StatRow
        label="Energy"
        value="40 Wh/pax-km"
        sub="Tandfonline 2020"
      />
      <StatRow
        label="Hyperloop CO₂"
        value="0.015 kg/pax-km"
        sub="Springer 2023, renewables"
      />
    </>
  );
}
