import { CITIES, type CityKey } from "./cities";
import { haversineKm } from "./geo";

export interface Route {
  from: CityKey;
  to: CityKey;
  distanceKm: number;
}

// ---------------------------------------------------------------------------
// Routing rules
// ---------------------------------------------------------------------------
//
// Two cities can be connected if:
//   A) They share the same continent grouping, OR
//   B) They are on different continents but separated by ≤ 500 km
//      (e.g., London–Paris via Channel Tunnel corridor, Istanbul–Cairo)
//
// "middle_east" is treated as connectable with both "africa" and "asia"
// for geographic plausibility.
//
// Intentionally excluded cross-ocean pairs:
//   NY–London, LA–Tokyo, São Paulo–Lagos, etc.
// ---------------------------------------------------------------------------

const OCEAN_THRESHOLD_KM = 500;

// continent pairs that are considered "adjacent landmasses" beyond the 500 km rule
const ADJACENT_CONTINENTS = new Set<string>([
  "europe|africa",
  "africa|europe",
  "europe|middle_east",
  "middle_east|europe",
  "africa|middle_east",
  "middle_east|africa",
  "asia|middle_east",
  "middle_east|asia",
  "asia|oceania",
  "oceania|asia",
]);

function canConnect(fromKey: CityKey, toKey: CityKey): boolean {
  const a = CITIES[fromKey];
  const b = CITIES[toKey];
  if (a.continent === b.continent) return true;

  const pairKey = `${a.continent}|${b.continent}`;
  if (ADJACENT_CONTINENTS.has(pairKey)) {
    // Still require distance check for adjacent continent pairs
    const dist = haversineKm(a.lat, a.lng, b.lat, b.lng);
    return dist <= OCEAN_THRESHOLD_KM;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Route pairs — manually curated for visual density + plausibility
// ---------------------------------------------------------------------------

const RAW_PAIRS: [CityKey, CityKey][] = [
  // ── North America ──────────────────────────────────────────────────────
  ["new_york", "chicago"],
  ["new_york", "toronto"],
  ["chicago", "toronto"],
  ["chicago", "los_angeles"],
  ["new_york", "los_angeles"],
  ["los_angeles", "mexico_city"],
  ["new_york", "mexico_city"],
  ["chicago", "mexico_city"],
  ["toronto", "los_angeles"],

  // ── South America ──────────────────────────────────────────────────────
  ["sao_paulo", "buenos_aires"],

  // ── Europe ────────────────────────────────────────────────────────────
  ["london", "paris"],
  ["london", "madrid"],
  ["london", "berlin"],
  ["london", "istanbul"],
  ["paris", "madrid"],
  ["paris", "berlin"],
  ["paris", "rome"],
  ["madrid", "rome"],
  ["berlin", "rome"],
  ["berlin", "moscow"],
  ["berlin", "istanbul"],
  ["rome", "istanbul"],
  ["istanbul", "moscow"],
  ["moscow", "istanbul"],

  // ── Africa ────────────────────────────────────────────────────────────
  ["cairo", "nairobi"],
  ["cairo", "lagos"],
  ["nairobi", "johannesburg"],
  ["lagos", "nairobi"],
  ["lagos", "johannesburg"],

  // ── Middle East ───────────────────────────────────────────────────────
  ["dubai", "riyadh"],
  ["dubai", "mumbai"],
  ["riyadh", "cairo"],
  ["istanbul", "cairo"],   // ~1,200 km — allowed via adjacent continent check
  ["dubai", "delhi"],
  ["riyadh", "dubai"],

  // ── Asia ──────────────────────────────────────────────────────────────
  ["mumbai", "delhi"],
  ["delhi", "beijing"],
  ["delhi", "shanghai"],
  ["beijing", "shanghai"],
  ["beijing", "seoul"],
  ["beijing", "tokyo"],
  ["shanghai", "tokyo"],
  ["shanghai", "seoul"],
  ["tokyo", "seoul"],
  ["bangkok", "singapore"],
  ["bangkok", "kuala_lumpur"],
  ["singapore", "kuala_lumpur"],
  ["singapore", "sydney"],   // ~6,300 km — filtered by canConnect
  ["delhi", "bangkok"],
  ["mumbai", "singapore"],

  // ── Oceania ───────────────────────────────────────────────────────────
  // Sydney is geographically isolated; only short-hop to Singapore if within 500 km
  // (Singapore–Sydney ≈ 6,300 km — fails rule, so not added)
];

// Build validated routes with distances
function buildRoutes(): Route[] {
  const routes: Route[] = [];
  const seen = new Set<string>();

  for (const [fromKey, toKey] of RAW_PAIRS) {
    const key = [fromKey, toKey].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);

    if (!canConnect(fromKey, toKey)) {
      // Route blocked by geography rule — silently skip
      continue;
    }

    const a = CITIES[fromKey];
    const b = CITIES[toKey];
    const distanceKm = Math.round(haversineKm(a.lat, a.lng, b.lat, b.lng));

    routes.push({ from: fromKey, to: toKey, distanceKm });
  }

  return routes;
}

export const ROUTES: Route[] = buildRoutes();
