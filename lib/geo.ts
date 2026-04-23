/**
 * geo.ts — Haversine distance formula and derived calculations.
 *
 * Haversine reference: https://en.wikipedia.org/wiki/Haversine_formula
 */

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Returns the great-circle distance in km between two lat/lng points.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Arc altitude for globe.gl — longer routes get a higher arc.
 * Capped at ~0.5 for the longest trans-continental routes.
 *
 * Formula: distance_km / 20000
 * e.g. 1000 km → 0.05  |  10000 km → 0.50
 */
export function arcAltitude(distanceKm: number): number {
  return Math.min(distanceKm / 20000, 0.5);
}
