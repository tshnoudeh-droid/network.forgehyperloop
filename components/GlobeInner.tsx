"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Route } from "@/lib/routes";
import type { City, CityKey } from "@/lib/cities";
import { CITIES } from "@/lib/cities";
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
  phase: 1 | 2 | 3 | 4 | 5;
  isLight?: boolean;
}

interface PointDatum extends City {
  connections: number;
}

const TEXTURE =
  "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

const ARC_COLORS_HOVER = ["rgba(255,255,255,0.95)", "rgba(255,255,255,0.95)"];

function buildArcData(routes: Route[]): ArcDatum[] {
  const data: ArcDatum[] = [];
  routes.forEach((r) => {
    const a = CITIES[r.from];
    const b = CITIES[r.to];
    const base = {
      from: r.from,
      to: r.to,
      startLat: a.lat,
      startLng: a.lng,
      endLat: b.lat,
      endLng: b.lng,
      altitude: arcAltitude(r.distanceKm),
      distanceKm: r.distanceKm,
      phase: r.phase,
    };
    data.push({ ...base, isLight: false });
    data.push({ ...base, isLight: true });
  });
  return data;
}

function buildPointData(routes: Route[], cities: City[]): PointDatum[] {
  const connectionCount: Record<string, number> = {};
  for (const r of routes) {
    connectionCount[r.from] = (connectionCount[r.from] ?? 0) + 1;
    connectionCount[r.to] = (connectionCount[r.to] ?? 0) + 1;
  }
  return cities.map((c) => ({
    ...c,
    connections: connectionCount[c.id] ?? 0,
  }));
}

interface GlobeInnerProps {
  routes: Route[];
  cities: City[];
  theme: Theme;
  onArcSelect: (route: Route | null) => void;
  onCityHover: (city: City | null) => void;
}

export default function GlobeInner({ routes, cities, theme, onArcSelect, onCityHover }: GlobeInnerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const hoveredArcRef = useRef<ArcDatum | null>(null);
  const arcDataRef = useRef<ArcDatum[]>([]);
  const hasInteractedRef = useRef(false);
  const themeRef = useRef(theme);

  // Keep themeRef in sync
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Theme changes — only bg and atmosphere need updating
  useEffect(() => {
    if (!globeRef.current) return;
    const isDark = theme === "dark";
    globeRef.current.atmosphereColor(isDark ? "#1a3a6e" : "#4a90d9");
    globeRef.current.backgroundColor(isDark ? "#0E0E0C" : "#FFFFFF");
  }, [theme]);

  // Reactive update — re-apply arc + point + label data when routes or cities change
  useEffect(() => {
    if (!globeRef.current) return;
    const newArcData = buildArcData(routes);
    const newPointData = buildPointData(routes, cities);
    arcDataRef.current = newArcData;
    globeRef.current.arcsData(newArcData);
    globeRef.current.pointsData(newPointData);
    globeRef.current.labelsData(cities);

    if (cities.length > 0) {
      let latSum = 0;
      let lngSum = 0;
      cities.forEach(c => { latSum += c.lat; lngSum += c.lng; });
      const avgLat = latSum / cities.length;
      const avgLng = lngSum / cities.length;
      globeRef.current.pointOfView({ lat: avgLat, lng: avgLng, altitude: 2.1 }, 1000);
    }
  }, [routes, cities]);

  const stopAutoRotate = useCallback(() => {
    if (!hasInteractedRef.current && globeRef.current) {
      hasInteractedRef.current = true;
      globeRef.current.controls().autoRotate = false;
    }
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const initialArcData = buildArcData(routes);
    const initialPointData = buildPointData(routes, cities);
    arcDataRef.current = initialArcData;

    (async () => {
      const GlobeLib = (await import("globe.gl")).default;
      const isDark = themeRef.current === "dark";
      const globe = GlobeLib();

      globe(mountRef.current!)
        // ── Appearance ───────────────────────────────────────────────────
        .globeImageUrl(TEXTURE)
        .backgroundColor(isDark ? "#0E0E0C" : "#FFFFFF")
        .backgroundImageUrl(null)
        .showAtmosphere(true)
        .atmosphereColor(isDark ? "#1a3a6e" : "#4a90d9")
        .atmosphereAltitude(0.15)

        // ── Arcs — premium white light-trail ───────────────────────────
        .arcsData(arcDataRef.current)
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

          if (arc.isLight) return ["rgba(255,255,255,1)", "rgba(255,255,255,1)"];
          if (isHovered) return ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.9)"];
          return ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.3)"];
        })
        .arcStroke((d) => ((d as ArcDatum).isLight ? 4.5 : 0.7))
        .arcDashLength((d) => ((d as ArcDatum).isLight ? 0.018 : 1))
        .arcDashGap((d) => ((d as ArcDatum).isLight ? 0.982 : 0))
        .arcDashAnimateTime((d) => ((d as ArcDatum).isLight ? 3500 : 0))
        .arcDashInitialGap((d) => ((d as ArcDatum).distanceKm % 10) / 10)
        .arcLabel((d) => {
          const arc = d as ArcDatum;
          const a = CITIES[arc.from];
          const b = CITIES[arc.to];
          return `<div class="globe-tooltip"><strong>${a.flag} ${a.name} → ${b.flag} ${b.name}</strong><br/>${arc.distanceKm.toLocaleString("en-US")} km</div>`;
        })
        .onArcHover((arc) => {
          hoveredArcRef.current = arc as ArcDatum | null;
          globe.arcsData([...arcDataRef.current]);
        })
        .onArcClick((arc) => {
          const a = arc as ArcDatum;
          onArcSelect(routes.find((r) => r.from === a.from && r.to === a.to) ?? null);
        })

        // ── City points ──────────────────────────────────────────────────
        .pointsData(initialPointData)
        .pointLat((d) => (d as PointDatum).lat)
        .pointLng((d) => (d as PointDatum).lng)
        .pointColor(() => "rgba(195,169,132,0.95)")
        .pointAltitude(0.008)
        .pointRadius((d) => 0.18 + ((d as PointDatum).connections / 12) * 0.22)
        .pointLabel((d) => {
          const p = d as PointDatum;
          return `<div class="globe-tooltip"><strong>${p.flag} ${p.name}</strong><br/>${p.country} · ${p.connections} routes</div>`;
        })
        .onPointHover((p) => onCityHover(p as City | null))
        .onPointClick(() => onArcSelect(null))

        // ── City labels ──────────────────────────────────────────────────
        .labelsData(cities)
        .labelLat((d) => (d as City).lat)
        .labelLng((d) => (d as City).lng)
        .labelText((d) => (d as City).name)
        .labelColor(() => "rgba(255,255,255,0.92)")
        .labelSize(0.55)
        .labelDotRadius(0)
        .labelAltitude(0.022)
        .labelResolution(3);

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
