import { CITIES, type CityKey } from "./cities";
import { haversineKm } from "./geo";

export interface Route {
  from: CityKey;
  to: CityKey;
  distanceKm: number;
  phase: 1 | 2 | 3 | 4 | 5;
  /** Primary cargo/trade justification for this route */
  tradeReason: string;
  /** Infrastructure type */
  infraType: "overland" | "elevated_coastal" | "undersea_sft" | "bridge_tunnel";
}

// ---------------------------------------------------------------------------
// Route pairs — trade-volume driven, phase sequenced
//
// Phase 1 — Asian Spine
//   The Shanghai–Singapore corridor is the world's most cargo-dense corridor.
//   $4T+ in goods move through the South China Sea annually. Every city on
//   this spine sits on or near the top 20 container ports list.
//
// Phase 2 — South & West Asia
//   Extends the spine westward across the Indian Ocean manufacturing belt.
//   India ($450B exports/yr), UAE ($400B re-exports/yr), Pakistan ($30B/yr).
//   All routes follow existing shipping lanes — proven demand.
//
// Phase 3 — Europe & Africa
//   Connects Europe's $3.1T export base to Africa's fastest-growing markets.
//   Cairo is the Suez gateway — 12% of global trade passes through here.
//   Sub-Saharan Africa link: $400B intra-African trade growing at 9%/yr.
//
// Phase 4 — Transatlantic via SFT
//   Submerged Floating Tube (not a drilled tunnel) anchored at mid-Atlantic
//   ridge via Azores waypoints. Norway has researched SFTs since the 1990s.
//   NY–London air cargo alone: ~$25B/yr. SA–Africa: agricultural + mineral.
//
// Phase 5 — Transpacific & Americas completion
//   LA–Tokyo closes the global loop. $200B/yr transpacific air cargo market.
//   Americas interior routes complete USMCA + Mercosur connectivity.
// ---------------------------------------------------------------------------

interface RawRoute {
  from: CityKey;
  to: CityKey;
  phase: 1 | 2 | 3 | 4 | 5;
  infraType: Route["infraType"];
  tradeReason: string;
}

const RAW_ROUTES: RawRoute[] = [

  // ── Phase 1: Asian Spine ─────────────────────────────────────────────────

  {
    from: "shanghai",
    to: "shenzhen",
    phase: 1,
    infraType: "elevated_coastal",
    tradeReason: "China's two largest manufacturing-export cities. Combined container throughput 60M+ TEU/yr.",
  },
  {
    from: "shenzhen",
    to: "ho_chi_minh",
    phase: 1,
    infraType: "elevated_coastal",
    tradeReason: "China-Vietnam electronics manufacturing corridor. Vietnam exports $100B+/yr to China and beyond.",
  },
  {
    from: "ho_chi_minh",
    to: "bangkok",
    phase: 1,
    infraType: "overland",
    tradeReason: "Mekong manufacturing belt. Thai-Vietnam bilateral trade $20B/yr and growing.",
  },
  {
    from: "bangkok",
    to: "kuala_lumpur",
    phase: 1,
    infraType: "overland",
    tradeReason: "ASEAN trade spine. Malaysia-Thailand: $30B/yr bilateral, rubber, auto, electronics.",
  },
  {
    from: "kuala_lumpur",
    to: "singapore",
    phase: 1,
    infraType: "overland",
    tradeReason: "World's most cargo-dense short corridor. KL–Singapore: $50B+/yr bilateral trade.",
  },
  {
    from: "singapore",
    to: "jakarta",
    phase: 1,
    infraType: "undersea_sft",
    tradeReason: "Indonesia is ASEAN's largest economy. Singapore handles 40% of Indonesian trade finance.",
  },
  {
    from: "shanghai",
    to: "beijing",
    phase: 1,
    infraType: "overland",
    tradeReason: "China's two largest cities. $800B+ internal trade corridor. Largest domestic freight market globally.",
  },
  {
    from: "beijing",
    to: "seoul",
    phase: 1,
    infraType: "undersea_sft",
    tradeReason: "China-Korea bilateral trade $360B/yr. Semiconductors, steel, auto parts.",
  },
  {
    from: "seoul",
    to: "tokyo",
    phase: 1,
    infraType: "undersea_sft",
    tradeReason: "Japan-Korea bilateral $90B/yr. Electronics, steel, chemicals under Korea Strait.",
  },
  {
    from: "shanghai",
    to: "tokyo",
    phase: 1,
    infraType: "undersea_sft",
    tradeReason: "China-Japan trade $350B/yr. World's 2nd and 3rd largest economies linked directly.",
  },

  // ── Phase 2: South & West Asia ───────────────────────────────────────────

  {
    from: "singapore",
    to: "colombo",
    phase: 2,
    infraType: "undersea_sft",
    tradeReason: "Indian Ocean SFT pilot. Sri Lanka handles transshipment for South Asian ports.",
  },
  {
    from: "colombo",
    to: "mumbai",
    phase: 2,
    infraType: "undersea_sft",
    tradeReason: "Sri Lanka–India trade growing. Mumbai is India's financial capital and largest port.",
  },
  {
    from: "mumbai",
    to: "karachi",
    phase: 2,
    infraType: "elevated_coastal",
    tradeReason: "India-Pakistan trade potential $37B/yr if normalized. Both on Arabian Sea coast.",
  },
  {
    from: "mumbai",
    to: "delhi",
    phase: 2,
    infraType: "overland",
    tradeReason: "India's internal goods corridor. Largest domestic freight market in South Asia.",
  },
  {
    from: "mumbai",
    to: "dubai",
    phase: 2,
    infraType: "undersea_sft",
    tradeReason: "India-UAE trade $85B/yr. Gold, diamonds, petrochemicals, food. Busiest air cargo pair in region.",
  },
  {
    from: "dubai",
    to: "riyadh",
    phase: 2,
    infraType: "overland",
    tradeReason: "GCC economic core. $100B+ bilateral trade. Saudi Vision 2030 industrial exports.",
  },
  {
    from: "delhi",
    to: "dubai",
    phase: 2,
    infraType: "overland",
    tradeReason: "North India to Gulf corridor. 3.5M Indian workers in UAE generate $20B remittance + trade flows.",
  },
  {
    from: "karachi",
    to: "dubai",
    phase: 2,
    infraType: "undersea_sft",
    tradeReason: "Pakistan-UAE trade $10B/yr. Textiles, food, energy imports.",
  },

  // ── Phase 3: Europe & Africa ─────────────────────────────────────────────

  {
    from: "dubai",
    to: "cairo",
    phase: 3,
    infraType: "overland",
    tradeReason: "UAE-Egypt trade $6B/yr. Cairo controls the Suez gateway — 12% of world trade.",
  },
  {
    from: "riyadh",
    to: "cairo",
    phase: 3,
    infraType: "overland",
    tradeReason: "Arab corridor. Saudi-Egypt trade $8B/yr. Aqaba rail link precedent exists.",
  },
  {
    from: "cairo",
    to: "istanbul",
    phase: 3,
    infraType: "overland",
    tradeReason: "Africa-Europe land bridge. Turkey-Egypt trade $5B/yr. Follows ancient trade route.",
  },
  {
    from: "cairo",
    to: "nairobi",
    phase: 3,
    infraType: "overland",
    tradeReason: "LAPSSET corridor alignment. East African growth market. $10B China-Africa infrastructure precedent.",
  },
  {
    from: "cairo",
    to: "casablanca",
    phase: 3,
    infraType: "overland",
    tradeReason: "Trans-Maghreb route. North Africa industrial belt. Morocco-Egypt trade growing 15%/yr.",
  },
  {
    from: "casablanca",
    to: "lagos",
    phase: 3,
    infraType: "elevated_coastal",
    tradeReason: "West Africa coastal spine. Morocco-Nigeria: phosphates for Nigerian agriculture.",
  },
  {
    from: "lagos",
    to: "nairobi",
    phase: 3,
    infraType: "overland",
    tradeReason: "Trans-African corridor. Nigeria-Kenya: $2B/yr and fastest growing intra-Africa pair.",
  },
  {
    from: "nairobi",
    to: "johannesburg",
    phase: 3,
    infraType: "overland",
    tradeReason: "East-Southern Africa trunk. SADC trade $50B/yr. Connects Africa's two biggest economies.",
  },
  {
    from: "istanbul",
    to: "frankfurt",
    phase: 3,
    infraType: "overland",
    tradeReason: "Turkey-EU trade $200B/yr. Largest bilateral trade relationship in European neighborhood.",
  },
  {
    from: "frankfurt",
    to: "london",
    phase: 3,
    infraType: "overland",
    tradeReason: "Europe's two largest financial centers. $200B/yr goods trade. Channel Tunnel precedent.",
  },
  {
    from: "frankfurt",
    to: "paris",
    phase: 3,
    infraType: "overland",
    tradeReason: "EU industrial core. Germany-France: $170B/yr bilateral, autos, machinery, pharma.",
  },
  {
    from: "paris",
    to: "barcelona",
    phase: 3,
    infraType: "overland",
    tradeReason: "Mediterranean corridor. France-Spain: $100B/yr bilateral, 2nd largest EU pair.",
  },
  {
    from: "barcelona",
    to: "casablanca",
    phase: 3,
    infraType: "undersea_sft",
    tradeReason: "Gibraltar crossing (14km). Spain-Morocco trade $20B/yr. Fixed link studied since 1980s.",
  },
  {
    from: "moscow",
    to: "istanbul",
    phase: 3,
    infraType: "overland",
    tradeReason: "Russia-Turkey trade $60B/yr, one of Moscow's largest partners. Energy and grain.",
  },
  {
    from: "moscow",
    to: "frankfurt",
    phase: 3,
    infraType: "overland",
    tradeReason: "Eurasian land bridge. Pre-sanctions Germany-Russia trade was $55B/yr. Long-term route.",
  },

  // ── Phase 4: Transatlantic via SFT ───────────────────────────────────────

  {
    from: "lisbon",
    to: "azores",
    phase: 4,
    infraType: "undersea_sft",
    tradeReason: "First SFT segment. 1,500km. Azores sits on mid-Atlantic ridge — shallowest transatlantic crossing.",
  },
  {
    from: "azores",
    to: "new_york",
    phase: 4,
    infraType: "undersea_sft",
    tradeReason: "Western SFT segment. 3,700km. NY is the western hemisphere's largest freight port.",
  },
  {
    from: "london",
    to: "lisbon",
    phase: 4,
    infraType: "overland",
    tradeReason: "UK-Portugal gateway to Azores corridor. Iberian Peninsula as Atlantic Europe terminus.",
  },
  {
    from: "new_york",
    to: "chicago",
    phase: 4,
    infraType: "overland",
    tradeReason: "US Northeast corridor. $300B/yr interregional trade. Replaces I-90 freight.",
  },
  {
    from: "new_york",
    to: "toronto",
    phase: 4,
    infraType: "overland",
    tradeReason: "US-Canada: largest bilateral trade relationship on Earth ($900B/yr). NY-Toronto anchor.",
  },
  {
    from: "sao_paulo",
    to: "lagos",
    phase: 4,
    infraType: "undersea_sft",
    tradeReason: "South Atlantic SFT. Brazil-Africa: $15B/yr bilateral. Shortest South Atlantic crossing.",
  },
  {
    from: "sao_paulo",
    to: "buenos_aires",
    phase: 4,
    infraType: "overland",
    tradeReason: "Mercosur core. Brazil-Argentina: $30B/yr, largest South American bilateral pair.",
  },

  // ── Phase 5: Transpacific & Americas ─────────────────────────────────────

  {
    from: "los_angeles",
    to: "tokyo",
    phase: 5,
    infraType: "undersea_sft",
    tradeReason: "Transpacific SFT via Aleutian arc waypoints. $200B/yr US-Japan trade. World's 3rd largest bilateral.",
  },
  {
    from: "tokyo",
    to: "sydney",
    phase: 5,
    infraType: "undersea_sft",
    tradeReason: "Japan-Australia trade $80B/yr. Coal, LNG, iron ore south; autos, electronics north.",
  },
  {
    from: "los_angeles",
    to: "chicago",
    phase: 5,
    infraType: "overland",
    tradeReason: "US transcontinental freight. Replaces I-40/I-80 trucking. $500B/yr interregional.",
  },
  {
    from: "los_angeles",
    to: "mexico_city",
    phase: 5,
    infraType: "overland",
    tradeReason: "USMCA manufacturing corridor. LA-Mexico City: autos, electronics, nearshored goods.",
  },
  {
    from: "chicago",
    to: "toronto",
    phase: 5,
    infraType: "overland",
    tradeReason: "Great Lakes industrial corridor. Auto manufacturing belt. $120B/yr trade.",
  },
  {
    from: "chicago",
    to: "new_york",
    phase: 5,
    infraType: "overland",
    tradeReason: "US Northeast-Midwest freight. Financial and industrial capitals linked.",
  },
  {
    from: "mexico_city",
    to: "buenos_aires",
    phase: 5,
    infraType: "overland",
    tradeReason: "Pan-American trunk route. Connects USMCA to Mercosur. $10B/yr and growing.",
  },
];

// Build validated routes with distances
function buildRoutes(): Route[] {
  const routes: Route[] = [];
  const seen = new Set<string>();

  for (const raw of RAW_ROUTES) {
    const key = [raw.from, raw.to].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);

    const a = CITIES[raw.from];
    const b = CITIES[raw.to];
    if (!a || !b) continue;

    const distanceKm = Math.round(haversineKm(a.lat, a.lng, b.lat, b.lng));

    routes.push({
      from: raw.from,
      to: raw.to,
      distanceKm,
      phase: raw.phase,
      infraType: raw.infraType,
      tradeReason: raw.tradeReason,
    });
  }

  return routes;
}

export const ROUTES: Route[] = buildRoutes();

/** Filter routes by maximum phase (e.g. show only phases 1 and 2) */
export function routesUpToPhase(maxPhase: 1 | 2 | 3 | 4 | 5): Route[] {
  return ROUTES.filter((r) => r.phase <= maxPhase);
}
