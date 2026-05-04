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

interface PointDatum extends City {
  connections: number;
}

interface StarSprite {
  sprite: THREE.Sprite;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  altitude: number;
  t: number;
  speed: number;
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

/** Interpolate longitude taking the short path across the antimeridian */
function lerpLng(a: number, b: number, t: number): number {
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return a + diff * t;
}

function createGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 1, half, half, half);
  grad.addColorStop(0.0, "rgba(255,255,255,1)");
  grad.addColorStop(0.15, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.35, "rgba(210,235,255,0.5)");
  grad.addColorStop(0.65, "rgba(200,220,255,0.15)");
  grad.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
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
  const hasInteractedRef = useRef(false);
  const themeRef = useRef(theme);
  const starsRef = useRef<StarSprite[]>([]);
  const rafRef = useRef<number>(0);
  const glowTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const rebuildStars = useCallback((routeList: Route[]) => {
    const globe = globeRef.current;
    if (!globe || !glowTextureRef.current) return;

    // Remove existing sprites from scene
    starsRef.current.forEach((s) => {
      globe.scene().remove(s.sprite);
      s.sprite.material.dispose();
    });

    starsRef.current = routeList.map((r) => {
      const a = CITIES[r.from];
      const b = CITIES[r.to];

      const mat = new THREE.SpriteMaterial({
        map: glowTextureRef.current!,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(3.5, 3.5, 1);
      globe.scene().add(sprite);

      return {
        sprite,
        startLat: a.lat,
        startLng: a.lng,
        endLat: b.lat,
        endLng: b.lng,
        altitude: arcAltitude(r.distanceKm),
        t: Math.random(),
        speed: 0.00022 + Math.random() * 0.00016,
      };
    });
  }, []);

  // Keep themeRef in sync
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Theme changes — bg and atmosphere only
  useEffect(() => {
    if (!globeRef.current) return;
    const isDark = theme === "dark";
    globeRef.current.atmosphereColor(isDark ? "#1a3a6e" : "#4a90d9");
    globeRef.current.backgroundColor(isDark ? "#0E0E0C" : "#FFFFFF");
  }, [theme]);

  // Reactive update when routes/cities change
  useEffect(() => {
    if (!globeRef.current) return;
    const newArcData = buildArcData(routes);
    const newPointData = buildPointData(routes, cities);
    arcDataRef.current = newArcData;
    globeRef.current.arcsData(newArcData);
    globeRef.current.pointsData(newPointData);
    globeRef.current.labelsData(cities);
    rebuildStars(routes);

    if (cities.length > 0) {
      let latSum = 0, lngSum = 0;
      cities.forEach((c) => { latSum += c.lat; lngSum += c.lng; });
      globeRef.current.pointOfView(
        { lat: latSum / cities.length, lng: lngSum / cities.length, altitude: 2.1 },
        1000
      );
    }
  }, [routes, cities, rebuildStars]);

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

      glowTextureRef.current = createGlowTexture();

      globe(mountRef.current!)
        // ── Appearance ───────────────────────────────────────────────────
        .globeImageUrl(TEXTURE)
        .backgroundColor(isDark ? "#0E0E0C" : "#FFFFFF")
        .backgroundImageUrl(null)
        .showAtmosphere(true)
        .atmosphereColor(isDark ? "#1a3a6e" : "#4a90d9")
        .atmosphereAltitude(0.15)

        // ── Arcs — clean solid white lines ──────────────────────────────
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
            : ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.9)"];
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
      controls.enableZoom = false;

      globe.pointOfView({ lat: 22, lng: 12, altitude: 2.1 }, 0);
      globeRef.current = globe;

      // Build initial star sprites
      rebuildStars(routes);

      // Animation loop — moves sprites along arc paths each frame
      function animate() {
        rafRef.current = requestAnimationFrame(animate);
        starsRef.current.forEach((s) => {
          s.t = (s.t + s.speed) % 1;
          const lat = s.startLat + (s.endLat - s.startLat) * s.t;
          const lng = lerpLng(s.startLng, s.endLng, s.t);
          const altitude = s.altitude * Math.sin(Math.PI * s.t);
          const coords = globe.getCoords(lat, lng, altitude);
          s.sprite.position.set(coords.x, coords.y, coords.z);
        });
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
      starsRef.current.forEach((s) => {
        globeRef.current?.scene().remove(s.sprite);
        s.sprite.material.dispose();
      });
      starsRef.current = [];
      glowTextureRef.current?.dispose();
      glowTextureRef.current = null;
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
