"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Route } from "@/lib/routes";
import type { City, CityKey } from "@/lib/cities";
import { CITIES, CITY_LIST } from "@/lib/cities";
import { arcAltitude } from "@/lib/geo";

type Theme = "dark" | "light";

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

// ── Textures ─────────────────────────────────────────────────────────────────
// Dark: NASA night-lights — city glow on dark ocean, perfect for hyperloop
// Light: Blue marble — clear land/ocean contrast
const TEXTURE_DARK =
  "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const TEXTURE_LIGHT =
  "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

// ── Arc gradient — warm sand-gold, rich light-trail feel ────────────────────
const ARC_COLORS_DARK = [
  "rgba(195,169,132,0)",
  "rgba(195,169,132,0.25)",
  "rgba(195,169,132,1)",
  "rgba(195,169,132,0.25)",
  "rgba(195,169,132,0)",
];
const ARC_COLORS_LIGHT = [
  "rgba(195,169,132,0)",
  "rgba(195,169,132,0.3)",
  "rgba(195,169,132,0.95)",
  "rgba(195,169,132,0.3)",
  "rgba(195,169,132,0)",
];
const ARC_COLORS_HOVER_DARK = [
  "rgba(195,169,132,0)",
  "rgba(195,169,132,0.5)",
  "#E8D4B8",
  "rgba(195,169,132,0.5)",
  "rgba(195,169,132,0)",
];
const ARC_COLORS_HOVER_LIGHT = [
  "rgba(195,169,132,0)",
  "rgba(195,169,132,0.6)",
  "#8B6F47",
  "rgba(195,169,132,0.6)",
  "rgba(195,169,132,0)",
];

interface GlobeInnerProps {
  routes: Route[];
  theme: Theme;
  onArcSelect: (route: Route | null) => void;
  onCityHover: (city: City | null) => void;
}

export default function GlobeInner({ routes, theme, onArcSelect, onCityHover }: GlobeInnerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const hoveredArcRef = useRef<ArcDatum | null>(null);
  const hasInteractedRef = useRef(false);
  const themeRef = useRef(theme);

  // Keep themeRef in sync
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Update globe texture when theme changes
  useEffect(() => {
    if (!globeRef.current) return;
    const tex = theme === "dark" ? TEXTURE_DARK : TEXTURE_LIGHT;
    globeRef.current.globeImageUrl(tex);
    globeRef.current.atmosphereColor(
      theme === "dark" ? "#1a1a18" : "#d4c9bb"
    );
    globeRef.current.backgroundColor(
      theme === "dark" ? "#0E0E0C" : "#FFFFFF"
    );
  }, [theme]);

  // Build arc + point data
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

    (async () => {
      const GlobeLib = (await import("globe.gl")).default;
      const isDark = themeRef.current === "dark";
      const globe = GlobeLib();

      globe(mountRef.current!)
        // ── Appearance ───────────────────────────────────────────────────
        .globeImageUrl(isDark ? TEXTURE_DARK : TEXTURE_LIGHT)
        .backgroundColor(isDark ? "#0E0E0C" : "#FFFFFF")
        .backgroundImageUrl(null)
        .showAtmosphere(true)
        .atmosphereColor(isDark ? "#1a1a18" : "#d4c9bb")
        .atmosphereAltitude(0.15)

        // ── Arcs (premium light-trail style) ─────────────────────────────
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
          const dark = themeRef.current === "dark";
          if (isHovered) return dark ? ARC_COLORS_HOVER_DARK : ARC_COLORS_HOVER_LIGHT;
          return dark ? ARC_COLORS_DARK : ARC_COLORS_LIGHT;
        })
        .arcStroke(1.1)
        .arcDashLength(0.22)
        .arcDashGap(0.06)
        .arcDashAnimateTime(1800)
        .arcDashInitialGap((d) => ((d as ArcDatum).distanceKm % 10) / 10)
        .arcLabel((d) => {
          const arc = d as ArcDatum;
          const a = CITIES[arc.from];
          const b = CITIES[arc.to];
          return `<div class="globe-tooltip"><strong>${a.flag} ${a.name} → ${b.flag} ${b.name}</strong><br/>${arc.distanceKm.toLocaleString("en-US")} km</div>`;
        })
        .onArcHover((arc) => {
          hoveredArcRef.current = arc as ArcDatum | null;
          globe.arcsData([...arcData]);
        })
        .onArcClick((arc) => {
          const a = arc as ArcDatum;
          onArcSelect(routes.find((r) => r.from === a.from && r.to === a.to) ?? null);
        })

        // ── City points ──────────────────────────────────────────────────
        .pointsData(pointData)
        .pointLat((d) => (d as PointDatum).lat)
        .pointLng((d) => (d as PointDatum).lng)
        .pointColor(() => (themeRef.current === "dark" ? "rgba(195,169,132,0.95)" : "rgba(195,169,132,0.9)"))
        .pointAltitude(0.008)
        .pointRadius((d) => 0.18 + ((d as PointDatum).connections / 12) * 0.22)
        .pointLabel((d) => {
          const p = d as PointDatum;
          return `<div class="globe-tooltip"><strong>${p.flag} ${p.name}</strong><br/>${p.country} · ${p.connections} routes</div>`;
        })
        .onPointHover((p) => onCityHover(p as City | null))
        .onPointClick(() => onArcSelect(null));

      // ── Controls ─────────────────────────────────────────────────────────
      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;
      // Zoom disabled so page scroll works naturally
      controls.enableZoom = false;

      globe.pointOfView({ lat: 22, lng: 12, altitude: 2.1 }, 0);

      globeRef.current = globe;
    })();

    const el = mountRef.current;
    el?.addEventListener("pointerdown", stopAutoRotate, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      if (globeRef.current && mountRef.current) {
        globeRef.current
          .width(mountRef.current.offsetWidth)
          .height(mountRef.current.offsetHeight);
      }
    });
    if (el) resizeObserver.observe(el);

    return () => {
      el?.removeEventListener("pointerdown", stopAutoRotate);
      resizeObserver.disconnect();
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
