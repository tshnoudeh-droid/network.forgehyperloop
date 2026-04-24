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

// ── Globe texture — solid #C3A984 on both modes ───────────────────────────────
let solidTexCache: string | null = null;

function solidGlobeTexture(): string {
  if (solidTexCache) return solidTexCache;
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#C3A984";
  ctx.fillRect(0, 0, 4, 4);
  solidTexCache = canvas.toDataURL();
  return solidTexCache;
}

// ── Arc colours — crisp white, dominant; hover inverts to #C3A984 ────────────
const ARC_COLORS = [
  "rgba(255,255,255,0)",
  "rgba(255,255,255,0.92)",
  "rgba(255,255,255,1)",
  "rgba(255,255,255,0.92)",
  "rgba(255,255,255,0)",
];
const ARC_COLORS_HOVER = [
  "rgba(195,169,132,0)",
  "rgba(195,169,132,0.95)",
  "#C3A984",
  "rgba(195,169,132,0.95)",
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

  // Update bg / atmosphere when theme changes (globe texture is constant)
  useEffect(() => {
    if (!globeRef.current) return;
    const isDark = theme === "dark";
    globeRef.current.atmosphereColor(isDark ? "#D4BF9E" : "#A08060");
    globeRef.current.backgroundColor(isDark ? "#0E0E0C" : "#FFFFFF");
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
        .globeImageUrl(solidGlobeTexture())
        .backgroundColor(isDark ? "#0E0E0C" : "#FFFFFF")
        .backgroundImageUrl(null)
        .showAtmosphere(true)
        .atmosphereColor(isDark ? "#D4BF9E" : "#A08060")
        .atmosphereAltitude(0.15)

        // ── Arcs — crisp white, high stroke, premium feel ─────────────────
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
          return isHovered ? ARC_COLORS_HOVER : ARC_COLORS;
        })
        .arcStroke(2.2)
        .arcDashLength(0.35)
        .arcDashGap(0.03)
        .arcDashAnimateTime(1400)
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
        .pointColor(() => "rgba(255,255,255,1)")
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
