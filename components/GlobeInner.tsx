"use client";

/**
 * GlobeInner.tsx
 *
 * Actual globe.gl imperative rendering. Loaded only client-side via Globe.tsx.
 * Uses useRef + useEffect to mount globe.gl into a <div>.
 */

import { useEffect, useRef, useCallback } from "react";
import type { Route } from "@/lib/routes";
import type { City, CityKey } from "@/lib/cities";
import { CITIES, CITY_LIST } from "@/lib/cities";
import { arcAltitude } from "@/lib/geo";

// ── Types ────────────────────────────────────────────────────────────────────

interface ArcDatum {
  from: CityKey;
  to: CityKey;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  altitude: number;
  distanceKm: number;
}

interface PointDatum extends City {
  connections: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const GLOBE_TEXTURE =
  "https://unpkg.com/three-globe/example/img/earth-dark.jpg";
const ARC_COLOR = "#FFD700";
const ARC_COLOR_HOVER = "#FFFFFF";
const POINT_COLOR = "#FFD700";
const POINT_COLOR_HOVER = "#FFFFFF";

// ── Props ────────────────────────────────────────────────────────────────────

interface GlobeInnerProps {
  routes: Route[];
  onArcSelect: (route: Route | null) => void;
  onCityHover: (city: City | null) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function GlobeInner({
  routes,
  onArcSelect,
  onCityHover,
}: GlobeInnerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const hoveredArcRef = useRef<ArcDatum | null>(null);
  const hasInteractedRef = useRef(false);

  // Build arc data
  const arcData: ArcDatum[] = routes.map((r) => {
    const a = CITIES[r.from];
    const b = CITIES[r.to];
    return {
      from: r.from,
      to: r.to,
      startLat: a.lat,
      startLng: a.lng,
      endLat: b.lat,
      endLng: b.lng,
      altitude: arcAltitude(r.distanceKm),
      distanceKm: r.distanceKm,
    };
  });

  // Build point data with connection counts
  const connectionCount: Record<string, number> = {};
  for (const r of routes) {
    connectionCount[r.from] = (connectionCount[r.from] ?? 0) + 1;
    connectionCount[r.to] = (connectionCount[r.to] ?? 0) + 1;
  }
  const pointData: PointDatum[] = CITY_LIST.map((c) => ({
    ...c,
    connections: connectionCount[c.id] ?? 0,
  }));

  const stopAutoRotate = useCallback(() => {
    if (!hasInteractedRef.current && globeRef.current) {
      hasInteractedRef.current = true;
      globeRef.current.controls().autoRotate = false;
    }
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    let globe: ReturnType<typeof import("globe.gl")>;

    (async () => {
      const GlobeLib = (await import("globe.gl")).default;
      globe = GlobeLib();

      globe(mountRef.current!)
        // ── Globe appearance ──────────────────────────────────────────────
        .globeImageUrl(GLOBE_TEXTURE)
        .backgroundColor("#000000")
        .backgroundImageUrl(null)
        .showAtmosphere(true)
        .atmosphereColor("#1a3a6e")
        .atmosphereAltitude(0.15)

        // ── Arcs ──────────────────────────────────────────────────────────
        .arcsData(arcData)
        .arcStartLat((d) => (d as ArcDatum).startLat)
        .arcStartLng((d) => (d as ArcDatum).startLng)
        .arcEndLat((d) => (d as ArcDatum).endLat)
        .arcEndLng((d) => (d as ArcDatum).endLng)
        .arcAltitude((d) => (d as ArcDatum).altitude)
        .arcColor((d) => {
          const arc = d as ArcDatum;
          const isHovered =
            hoveredArcRef.current?.from === arc.from &&
            hoveredArcRef.current?.to === arc.to;
          return isHovered ? ARC_COLOR_HOVER : ARC_COLOR;
        })
        .arcStroke(0.4)
        .arcDashLength(0.3)
        .arcDashGap(0.15)
        .arcDashAnimateTime(2200)
        .arcDashInitialGap((d) =>
          // stagger initial gap so pods don't all start at same position
          ((d as ArcDatum).distanceKm % 10) / 10
        )
        .arcLabel((d) => {
          const arc = d as ArcDatum;
          const a = CITIES[arc.from];
          const b = CITIES[arc.to];
          return `
            <div class="globe-tooltip">
              <strong>${a.flag} ${a.name} → ${b.flag} ${b.name}</strong><br/>
              ${arc.distanceKm.toLocaleString("en-US")} km
            </div>
          `;
        })
        .onArcHover((arc) => {
          hoveredArcRef.current = arc as ArcDatum | null;
          // Re-render arcs to update color
          globe.arcsData([...arcData]);
        })
        .onArcClick((arc) => {
          const a = arc as ArcDatum;
          onArcSelect(
            routes.find((r) => r.from === a.from && r.to === a.to) ?? null
          );
        })

        // ── City points ───────────────────────────────────────────────────
        .pointsData(pointData)
        .pointLat((d) => (d as PointDatum).lat)
        .pointLng((d) => (d as PointDatum).lng)
        .pointColor((d) =>
          (d as PointDatum).id === hoveredArcRef.current?.from ||
          (d as PointDatum).id === hoveredArcRef.current?.to
            ? POINT_COLOR_HOVER
            : POINT_COLOR
        )
        .pointAltitude(0.01)
        .pointRadius((d) => 0.15 + ((d as PointDatum).connections / 12) * 0.25)
        .pointLabel((d) => {
          const p = d as PointDatum;
          return `
            <div class="globe-tooltip">
              <strong>${p.flag} ${p.name}</strong><br/>
              ${p.country} · ${p.connections} routes
            </div>
          `;
        })
        .onPointHover((point) => {
          onCityHover(point as City | null);
        })
        .onPointClick((point) => {
          // Clicking a city clears the selected route
          void point;
          onArcSelect(null);
        });

      // ── Controls ─────────────────────────────────────────────────────────
      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableZoom = true;

      // Initial camera position — slight tilt to see Europe/Americas well
      globe.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 0);

      globeRef.current = globe;
    })();

    // Stop auto-rotate on any user interaction
    const el = mountRef.current;
    el.addEventListener("pointerdown", stopAutoRotate, { passive: true });
    el.addEventListener("wheel", stopAutoRotate, { passive: true });

    // Resize observer to keep globe filling its container
    const resizeObserver = new ResizeObserver(() => {
      if (globeRef.current && mountRef.current) {
        globeRef.current
          .width(mountRef.current.offsetWidth)
          .height(mountRef.current.offsetHeight);
      }
    });
    if (el) resizeObserver.observe(el);

    return () => {
      el.removeEventListener("pointerdown", stopAutoRotate);
      el.removeEventListener("wheel", stopAutoRotate);
      resizeObserver.disconnect();
      // globe.gl doesn't expose a destroy method; clearing the ref is enough
      globeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mountRef}
      id="globe-mount"
      style={{ width: "100%", height: "100%", cursor: "grab" }}
    />
  );
}
