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

// ── Texture processing ────────────────────────────────────────────────────────
// One source texture; canvas-converted to white shades (dark mode) or
// black shades (light mode) for maximum land/water contrast against bg.
const BASE_TEXTURE =
  "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

const textureCache = new Map<string, string>();

async function buildGlobeTexture(lighten: boolean): Promise<string> {
  const key = lighten ? "white" : "black";
  if (textureCache.has(key)) return textureCache.get(key)!;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = BASE_TEXTURE;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    // White shades: map to [125, 255] — always in the bright half
    // Black shades: map to [0, 130]  — always in the dark half
    const v = lighten
      ? Math.round(125 + (lum / 255) * 130)
      : Math.round((lum / 255) * 130);
    px[i] = px[i + 1] = px[i + 2] = v;
  }
  ctx.putImageData(d, 0, 0);

  const url = canvas.toDataURL("image/jpeg", 0.88);
  textureCache.set(key, url);
  return url;
}

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
    const isDark = theme === "dark";
    buildGlobeTexture(isDark).then((url) => {
      if (!globeRef.current) return;
      globeRef.current.globeImageUrl(url);
      globeRef.current.atmosphereColor(isDark ? "#c8d8e8" : "#2a2a28");
      globeRef.current.backgroundColor(isDark ? "#0E0E0C" : "#FFFFFF");
    });
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
      const texUrl = await buildGlobeTexture(isDark);
      const globe = GlobeLib();

      globe(mountRef.current!)
        // ── Appearance ───────────────────────────────────────────────────
        .globeImageUrl(texUrl)
        .backgroundColor(isDark ? "#0E0E0C" : "#FFFFFF")
        .backgroundImageUrl(null)
        .showAtmosphere(true)
        .atmosphereColor(isDark ? "#c8d8e8" : "#2a2a28")
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
