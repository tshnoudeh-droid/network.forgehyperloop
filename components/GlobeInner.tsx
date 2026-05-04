"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
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
}

interface SphereData {
  id: string;
  lat: number;
  lng: number;
  altitude: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  maxAlt: number;
  t: number;
  speed: number;
}

interface PointDatum extends City {
  connections: number;
}

const TEXTURE =
  "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

function buildArcData(routes: Route[]): ArcDatum[] {
  return routes.map((r) => {
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
      phase: r.phase,
    };
  });
}

function buildPointData(routes: Route[], cities: City[]): PointDatum[] {
  const connectionCount: Record<string, number> = {};
  for (const r of routes) {
    connectionCount[r.from] = (connectionCount[r.from] ?? 0) + 1;
    connectionCount[r.to] = (connectionCount[r.to] ?? 0) + 1;
  }
  return cities.map((c) => ({ ...c, connections: connectionCount[c.id] ?? 0 }));
}

function lerpLng(a: number, b: number, t: number): number {
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return a + diff * t;
}

function buildSphereData(routes: Route[]): SphereData[] {
  return routes.map((r) => {
    const a = CITIES[r.from];
    const b = CITIES[r.to];
    const t0 = Math.random();
    const maxAlt = arcAltitude(r.distanceKm);
    return {
      id: `${r.from}-${r.to}`,
      lat: a.lat + (b.lat - a.lat) * t0,
      lng: lerpLng(a.lng, b.lng, t0),
      altitude: maxAlt * Math.sin(Math.PI * t0),
      startLat: a.lat,
      startLng: a.lng,
      endLat: b.lat,
      endLng: b.lng,
      maxAlt,
      t: t0,
      speed: 0.00022 + Math.random() * 0.00016,
    };
  });
}

interface GlobeInnerProps {
  routes: Route[];
  cities: City[];
  theme: Theme;
  onArcSelect: (route: Route | null) => void;
  onCityHover: (city: City | null) => void;
}

export default function GlobeInner({
  routes,
  cities,
  theme,
  onArcSelect,
  onCityHover,
}: GlobeInnerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const hoveredArcRef = useRef<ArcDatum | null>(null);
  const arcDataRef = useRef<ArcDatum[]>([]);
  const sphereDataRef = useRef<SphereData[]>([]);
  const hasInteractedRef = useRef(false);
  const themeRef = useRef(theme);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (!globeRef.current) return;
    const isDark = theme === "dark";
    globeRef.current.atmosphereColor(isDark ? "#1a3a6e" : "#4a90d9");
    globeRef.current.backgroundColor(isDark ? "#0E0E0C" : "#FFFFFF");
  }, [theme]);

  useEffect(() => {
    if (!globeRef.current) return;
    const newArcData = buildArcData(routes);
    const newPointData = buildPointData(routes, cities);
    const newSphereData = buildSphereData(routes);
    arcDataRef.current = newArcData;
    sphereDataRef.current = newSphereData;
    globeRef.current.arcsData(newArcData);
    globeRef.current.pointsData(newPointData);
    globeRef.current.labelsData(cities);
    globeRef.current.customLayerData(newSphereData);

    if (cities.length > 0) {
      let latSum = 0, lngSum = 0;
      cities.forEach((c) => { latSum += c.lat; lngSum += c.lng; });
      globeRef.current.pointOfView(
        { lat: latSum / cities.length, lng: lngSum / cities.length, altitude: 2.1 },
        1000
      );
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
    const initialSphereData = buildSphereData(routes);
    arcDataRef.current = initialArcData;
    sphereDataRef.current = initialSphereData;

    (async () => {
      const GlobeLib = (await import("globe.gl")).default;
      const isDark = themeRef.current === "dark";
      const globe = GlobeLib();

      // Shared sphere geometry + material (reused across all instances)
      const sphereGeo = new THREE.SphereGeometry(1.5, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      globe(mountRef.current!)
        // ── Appearance ───────────────────────────────────────────────────
        .globeImageUrl(TEXTURE)
        .backgroundColor(isDark ? "#0E0E0C" : "#FFFFFF")
        .backgroundImageUrl(null)
        .showAtmosphere(true)
        .atmosphereColor(isDark ? "#1a3a6e" : "#4a90d9")
        .atmosphereAltitude(0.15)

        // ── Arcs — solid white base lines ────────────────────────────────
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
          return isHovered
            ? ["rgba(255,255,255,1)", "rgba(255,255,255,1)"]
            : ["rgba(255,255,255,0.7)", "rgba(255,255,255,0.7)"];
        })
        .arcStroke(1.5)
        .arcDashLength(1)
        .arcDashGap(0)
        .arcDashAnimateTime(0)
        .arcDashInitialGap(0)
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
          onArcSelect(
            routes.find((r) => r.from === a.from && r.to === a.to) ?? null
          );
        })

        // ── Traveling spheres ────────────────────────────────────────────
        .customLayerData(sphereDataRef.current)
        .customThreeObject(() => new THREE.Mesh(sphereGeo, sphereMat))
        .customThreeObjectUpdate((obj, d) => {
          const s = d as SphereData;
          const { x, y, z } = globe.getCoords(s.lat, s.lng, s.altitude);
          (obj as THREE.Object3D).position.set(x, y, z);
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

      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;
      controls.enableZoom = false;

      globe.pointOfView({ lat: 22, lng: 12, altitude: 2.1 }, 0);
      globeRef.current = globe;

      // Animate sphere positions by updating customLayerData each frame.
      // globe.gl re-calls customThreeObjectUpdate which uses globe.getCoords
      // — same coordinate system as arcs, guaranteed on-line positioning.
      function animate() {
        rafRef.current = requestAnimationFrame(animate);
        sphereDataRef.current.forEach((s) => {
          s.t = (s.t + s.speed) % 1;
          s.lat = s.startLat + (s.endLat - s.startLat) * s.t;
          s.lng = lerpLng(s.startLng, s.endLng, s.t);
          s.altitude = s.maxAlt * Math.sin(Math.PI * s.t);
        });
        globe.customLayerData([...sphereDataRef.current]);
      }
      animate();
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
      cancelAnimationFrame(rafRef.current);
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
