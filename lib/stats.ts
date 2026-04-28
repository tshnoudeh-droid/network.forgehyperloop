/**
 * stats.ts — All stat formulas with locked source constants.
 *
 * Passenger sources:
 *   - HYPERLOOP_SPEED_KMH: 1000 km/h design spec target
 *     (CASIC T-Flight record: 623 km/h; system design spec: 1000 km/h)
 *   - PLANE_SPEED_KMH: 900 km/h average commercial cruise (range 880–926 km/h)
 *   - PLANE_OVERHEAD_H: 3 h standard airport overhead estimate
 *   - ENERGY_WH_PER_PKM: 40 Wh/passenger-km
 *     (Tandfonline, 2020 — peer-reviewed hyperloop energy study)
 *   - TICKET_USD_PER_KM: $0.10/km proxy
 *     (based on ~$20–25 Helsinki–Stockholm ~250 km feasibility study)
 *   - AVIATION_CO2_KG_PKM: 0.255 kg CO₂/passenger-km (ICAO standard)
 *   - HYPERLOOP_CO2_KG_PKM: 0.015 kg CO₂/passenger-km
 *     (Springer, 2023 — renewables assumption, ~40% more efficient than aircraft)
 *   - AVG_SEATS: 28 passengers per hyperloop pod (design capacity estimate)
 *
 * Cargo sources:
 *   - CARGO_POD_PAYLOAD_TONNES: 10t standard dry pod (Exhibit A design spec)
 *   - AIR_CARGO_CO2_KG_PER_TONNE_KM: 0.602 kg (ICAO 2022 cargo emissions factor)
 *   - OCEAN_CO2_KG_PER_TONNE_KM: 0.008 kg (IMO 2020 baseline)
 *   - CARGO_TOLL_USD_PER_TONNE_KM: $0.05 — throughput toll model
 *     (port toll precedent: Singapore charges $0.03–0.07/tonne)
 *   - AIR_CARGO_TRANSIT_DAYS: 1–3 days including customs (IATA 2023)
 *   - OCEAN_TRANSIT_DAYS_PER_1000KM: 2.5 days per 1,000 km (avg 16 knots)
 */

// ── Constants ──────────────────────────────────────────────────────────────

export const CONSTANTS = {
  // Passenger
  HYPERLOOP_SPEED_KMH: 1000,
  PLANE_SPEED_KMH: 900,
  PLANE_OVERHEAD_H: 3,
  ENERGY_WH_PER_PKM: 40,
  TICKET_USD_PER_KM: 0.10,
  AVIATION_CO2_KG_PKM: 0.255,
  HYPERLOOP_CO2_KG_PKM: 0.015,
  AVG_SEATS: 28,
  // Cargo
  CARGO_POD_PAYLOAD_TONNES: 10,
  AIR_CARGO_CO2_KG_PER_TONNE_KM: 0.602,
  OCEAN_CO2_KG_PER_TONNE_KM: 0.008,
  CARGO_TOLL_USD_PER_TONNE_KM: 0.05,
  OCEAN_TRANSIT_DAYS_PER_1000KM: 2.5,
} as const;

// ── Per-route stats ────────────────────────────────────────────────────────

/** Hyperloop travel time in decimal hours. */
export function hyperloopTimeH(distanceKm: number): number {
  return distanceKm / CONSTANTS.HYPERLOOP_SPEED_KMH;
}

/** Commercial aviation travel time in decimal hours (including airport overhead). */
export function planeTimeH(distanceKm: number): number {
  return distanceKm / CONSTANTS.PLANE_SPEED_KMH + CONSTANTS.PLANE_OVERHEAD_H;
}

/** Time saved vs flying, in decimal hours. */
export function timeSavedH(distanceKm: number): number {
  return planeTimeH(distanceKm) - hyperloopTimeH(distanceKm);
}

/** Energy consumed per seat in kWh. */
export function energyPerSeatKwh(distanceKm: number): number {
  return (distanceKm * CONSTANTS.ENERGY_WH_PER_PKM) / 1000;
}

/** Estimated one-way ticket price in USD. */
export function ticketPriceUsd(distanceKm: number): number {
  return distanceKm * CONSTANTS.TICKET_USD_PER_KM;
}

/** CO₂ avoided vs flying for a single passenger (kg). */
export function co2AvoidedKgPerPassenger(distanceKm: number): number {
  return (
    distanceKm *
    (CONSTANTS.AVIATION_CO2_KG_PKM - CONSTANTS.HYPERLOOP_CO2_KG_PKM)
  );
}

// ── Cargo functions ────────────────────────────────────────────────────────

/** Ocean transit time in days for a given distance. */
export function oceanTransitDays(distanceKm: number): number {
  return (distanceKm / 1000) * CONSTANTS.OCEAN_TRANSIT_DAYS_PER_1000KM;
}

/** Throughput toll revenue per pod trip (USD). */
export function cargoTollPerPod(distanceKm: number): number {
  return distanceKm * CONSTANTS.CARGO_POD_PAYLOAD_TONNES * CONSTANTS.CARGO_TOLL_USD_PER_TONNE_KM;
}

/** CO₂ avoided vs air freight per pod trip (kg). */
export function cargoCo2AvoidedVsAir(distanceKm: number): number {
  return distanceKm * CONSTANTS.CARGO_POD_PAYLOAD_TONNES * CONSTANTS.AIR_CARGO_CO2_KG_PER_TONNE_KM;
}

/** CO₂ compared to ocean shipping per pod trip (kg). Ocean is lower — shows hyperloop is between air and ocean. */
export function cargoCo2VsOcean(distanceKm: number): number {
  return distanceKm * CONSTANTS.CARGO_POD_PAYLOAD_TONNES * CONSTANTS.OCEAN_CO2_KG_PER_TONNE_KM;
}

// ── Network totals ─────────────────────────────────────────────────────────

export interface NetworkTotals {
  totalRoutes: number;
  citiesConnected: number;
  totalNetworkKm: number;
  co2AvoidedTonnes: number;
}

import type { Route } from "./routes";
import { CITIES } from "./cities";

export function computeNetworkTotals(routes: Route[]): NetworkTotals {
  const connectedCities = new Set<string>();
  let totalKm = 0;

  for (const route of routes) {
    connectedCities.add(route.from);
    connectedCities.add(route.to);
    totalKm += route.distanceKm;
  }

  // CO₂ avoided: total km × avg seats per pod × CO₂ delta per passenger-km
  // Assumes each route is operated once (daily service baseline)
  const co2AvoidedKg =
    totalKm *
    CONSTANTS.AVG_SEATS *
    (CONSTANTS.AVIATION_CO2_KG_PKM - CONSTANTS.HYPERLOOP_CO2_KG_PKM);

  return {
    totalRoutes: routes.length,
    citiesConnected: connectedCities.size,
    totalNetworkKm: Math.round(totalKm),
    co2AvoidedTonnes: Math.round(co2AvoidedKg / 1000),
  };
}

// ── Formatting helpers ─────────────────────────────────────────────────────

/** Format decimal hours as "Xh Ym" */
export function formatHours(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/** Format km with comma separator */
export function formatKm(km: number): string {
  return `${Math.round(km).toLocaleString("en-US")} km`;
}

/** Format USD */
export function formatUsd(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(usd);
}

/** Format kWh */
export function formatKwh(kwh: number): string {
  return `${kwh.toFixed(1)} kWh`;
}

/** Format kg CO₂ */
export function formatCo2Kg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t CO₂`;
  return `${Math.round(kg)} kg CO₂`;
}

/** Human-readable CO₂ comparator for network totals (tonnes input) */
export function co2NetworkComparator(tonnes: number): string {
  // 250 kg CO₂ per transatlantic economy passenger (ICAO-based)
  const seats = Math.round((tonnes * 1000) / 250);
  return `≈ ${seats.toLocaleString("en-US")} transatlantic passenger seats offset`;
}
