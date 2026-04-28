export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  flag: string;
  continent: Continent;
  phase: 1 | 2 | 3 | 4 | 5;
  /** Primary cargo role at this node */
  cargoRole: string;
}

export type Continent =
  | "north_america"
  | "south_america"
  | "europe"
  | "africa"
  | "asia"
  | "oceania"
  | "middle_east";

// ---------------------------------------------------------------------------
// PHASE LOGIC
//
// Phase 1 — Asian Spine (2030–2040)
//   Shanghai → Shenzhen → Kuala Lumpur → Singapore
//   + spurs to Bangkok, Ho Chi Minh City, Jakarta
//   World's highest-volume manufacturing-to-port corridor.
//   China alone accounts for ~14% of global goods exports.
//
// Phase 2 — South & West Asia (2035–2045)
//   Singapore → Mumbai → Dubai
//   + Delhi, Karachi, Colombo
//   Connects the Indian Ocean manufacturing belt.
//   India's goods exports: $450B/yr. UAE re-export hub: $400B/yr.
//
// Phase 3 — Europe & Africa (2040–2050)
//   Dubai → Cairo → Lagos → Nairobi → Johannesburg
//   + Istanbul, Frankfurt, London, Barcelona, Casablanca
//   Opens Sub-Saharan Africa to global supply chains.
//   EU goods exports: $3.1T/yr. Africa's intra-trade growing at 9%/yr.
//
// Phase 4 — Transatlantic (2048–2060)
//   Submerged Floating Tube (SFT) via Azores waypoints
//   New York → London; São Paulo → Lagos
//   Air cargo on these routes: ~$40B/yr combined.
//   SFT (not drilled tunnel) — Norway-researched since 1990s.
//
// Phase 5 — Transpacific & Completion (2055–2070)
//   Los Angeles → Tokyo → Sydney
//   + final intra-continental links
//   Closes the loop: every major trade bloc connected.
// ---------------------------------------------------------------------------

export const CITIES: Record<string, City> = {

  // ── Phase 1: Asian Spine ──────────────────────────────────────────────────

  shanghai: {
    id: "shanghai",
    name: "Shanghai",
    lat: 31.2304,
    lng: 121.4737,
    country: "China",
    flag: "🇨🇳",
    continent: "asia",
    phase: 1,
    cargoRole: "World's largest container port. Phase 1 northern anchor.",
  },
  shenzhen: {
    id: "shenzhen",
    name: "Shenzhen",
    lat: 22.5431,
    lng: 114.0579,
    country: "China",
    flag: "🇨🇳",
    continent: "asia",
    phase: 1,
    cargoRole: "Electronics manufacturing hub. Port of Shenzhen handles 30M TEU/yr.",
  },
  kuala_lumpur: {
    id: "kuala_lumpur",
    name: "Kuala Lumpur",
    lat: 3.139,
    lng: 101.6869,
    country: "Malaysia",
    flag: "🇲🇾",
    continent: "asia",
    phase: 1,
    cargoRole: "Semiconductor and palm oil export node. Strait of Malacca gateway.",
  },
  singapore: {
    id: "singapore",
    name: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    country: "Singapore",
    flag: "🇸🇬",
    continent: "asia",
    phase: 1,
    cargoRole: "World's 2nd largest port. Phase 1 southern anchor and finance hub.",
  },
  bangkok: {
    id: "bangkok",
    name: "Bangkok",
    lat: 13.7563,
    lng: 100.5018,
    country: "Thailand",
    flag: "🇹🇭",
    continent: "asia",
    phase: 1,
    cargoRole: "Auto parts, electronics, food export. Regional Mekong hub.",
  },
  ho_chi_minh: {
    id: "ho_chi_minh",
    name: "Ho Chi Minh City",
    lat: 10.8231,
    lng: 106.6297,
    country: "Vietnam",
    flag: "🇻🇳",
    continent: "asia",
    phase: 1,
    cargoRole: "Vietnam's fastest-growing export corridor. $100B+ electronics/yr.",
  },
  jakarta: {
    id: "jakarta",
    name: "Jakarta",
    lat: -6.2088,
    lng: 106.8456,
    country: "Indonesia",
    flag: "🇮🇩",
    continent: "asia",
    phase: 1,
    cargoRole: "Indonesia's primary port. Coal, palm oil, nickel export gateway.",
  },
  beijing: {
    id: "beijing",
    name: "Beijing",
    lat: 39.9042,
    lng: 116.4074,
    country: "China",
    flag: "🇨🇳",
    continent: "asia",
    phase: 1,
    cargoRole: "Northern China logistics and government procurement node.",
  },
  tokyo: {
    id: "tokyo",
    name: "Tokyo",
    lat: 35.6762,
    lng: 139.6503,
    country: "Japan",
    flag: "🇯🇵",
    continent: "asia",
    phase: 1,
    cargoRole: "Japan's auto and semiconductor export hub. Port of Yokohama adjacent.",
  },
  seoul: {
    id: "seoul",
    name: "Seoul",
    lat: 37.5665,
    lng: 126.978,
    country: "South Korea",
    flag: "🇰🇷",
    continent: "asia",
    phase: 1,
    cargoRole: "Samsung / Hyundai export base. Incheon: world's 4th air cargo hub.",
  },

  // ── Phase 2: South & West Asia ────────────────────────────────────────────

  mumbai: {
    id: "mumbai",
    name: "Mumbai",
    lat: 19.076,
    lng: 72.8777,
    country: "India",
    flag: "🇮🇳",
    continent: "asia",
    phase: 2,
    cargoRole: "India's largest port. Pharma, textiles, refined petroleum exports.",
  },
  delhi: {
    id: "delhi",
    name: "Delhi",
    lat: 28.7041,
    lng: 77.1025,
    country: "India",
    flag: "🇮🇳",
    continent: "asia",
    phase: 2,
    cargoRole: "North India manufacturing + garment belt. Inland container depot.",
  },
  karachi: {
    id: "karachi",
    name: "Karachi",
    lat: 24.8607,
    lng: 67.0011,
    country: "Pakistan",
    flag: "🇵🇰",
    continent: "asia",
    phase: 2,
    cargoRole: "Pakistan's main seaport. Textiles, rice, leather exports.",
  },
  colombo: {
    id: "colombo",
    name: "Colombo",
    lat: 6.9271,
    lng: 79.8612,
    country: "Sri Lanka",
    flag: "🇱🇰",
    continent: "asia",
    phase: 2,
    cargoRole: "Indian Ocean transshipment hub. Garments, tea, spices.",
  },
  dubai: {
    id: "dubai",
    name: "Dubai",
    lat: 25.2048,
    lng: 55.2708,
    country: "UAE",
    flag: "🇦🇪",
    continent: "middle_east",
    phase: 2,
    cargoRole: "Jebel Ali: world's 9th largest port. $400B/yr re-export volume.",
  },
  riyadh: {
    id: "riyadh",
    name: "Riyadh",
    lat: 24.7136,
    lng: 46.6753,
    country: "Saudi Arabia",
    flag: "🇸🇦",
    continent: "middle_east",
    phase: 2,
    cargoRole: "Saudi Vision 2030 industrial corridor. Petrochemicals, plastics.",
  },

  // ── Phase 3: Europe & Africa ──────────────────────────────────────────────

  istanbul: {
    id: "istanbul",
    name: "Istanbul",
    lat: 41.0082,
    lng: 28.9784,
    country: "Turkey",
    flag: "🇹🇷",
    continent: "europe",
    phase: 3,
    cargoRole: "East-West freight bridge. Turkey exports $250B/yr. Bosphorus choke point.",
  },
  cairo: {
    id: "cairo",
    name: "Cairo",
    lat: 30.0444,
    lng: 31.2357,
    country: "Egypt",
    flag: "🇪🇬",
    continent: "africa",
    phase: 3,
    cargoRole: "Suez Canal gateway. 12% of world trade passes here annually.",
  },
  frankfurt: {
    id: "frankfurt",
    name: "Frankfurt",
    lat: 50.1109,
    lng: 8.6821,
    country: "Germany",
    flag: "🇩🇪",
    continent: "europe",
    phase: 3,
    cargoRole: "Europe's largest cargo airport. Chemical and auto parts hub.",
  },
  london: {
    id: "london",
    name: "London",
    lat: 51.5074,
    lng: -0.1278,
    country: "United Kingdom",
    flag: "🇬🇧",
    continent: "europe",
    phase: 3,
    cargoRole: "Financial clearing and pharma export node. Heathrow: Europe's busiest cargo.",
  },
  paris: {
    id: "paris",
    name: "Paris",
    lat: 48.8566,
    lng: 2.3522,
    country: "France",
    flag: "🇫🇷",
    continent: "europe",
    phase: 3,
    cargoRole: "Luxury goods, aerospace parts, agri-food exports.",
  },
  barcelona: {
    id: "barcelona",
    name: "Barcelona",
    lat: 41.3851,
    lng: 2.1734,
    country: "Spain",
    flag: "🇪🇸",
    continent: "europe",
    phase: 3,
    cargoRole: "Mediterranean port hub. Vehicle and chemical exports.",
  },
  casablanca: {
    id: "casablanca",
    name: "Casablanca",
    lat: 33.5731,
    lng: -7.5898,
    country: "Morocco",
    flag: "🇲🇦",
    continent: "africa",
    phase: 3,
    cargoRole: "North Africa industrial anchor. Phosphates, auto parts (Renault plant).",
  },
  lagos: {
    id: "lagos",
    name: "Lagos",
    lat: 6.5244,
    lng: 3.3792,
    country: "Nigeria",
    flag: "🇳🇬",
    continent: "africa",
    phase: 3,
    cargoRole: "West Africa's largest economy. Oil, LNG, agricultural commodities.",
  },
  nairobi: {
    id: "nairobi",
    name: "Nairobi",
    lat: -1.2921,
    lng: 36.8219,
    country: "Kenya",
    flag: "🇰🇪",
    continent: "africa",
    phase: 3,
    cargoRole: "East Africa logistics hub. Fresh produce, coffee, tech services export.",
  },
  johannesburg: {
    id: "johannesburg",
    name: "Johannesburg",
    lat: -26.2041,
    lng: 28.0473,
    country: "South Africa",
    flag: "🇿🇦",
    continent: "africa",
    phase: 3,
    cargoRole: "Southern Africa anchor. Gold, platinum, coal, manufactured goods.",
  },
  moscow: {
    id: "moscow",
    name: "Moscow",
    lat: 55.7558,
    lng: 37.6173,
    country: "Russia",
    flag: "🇷🇺",
    continent: "europe",
    phase: 3,
    cargoRole: "Eurasian land bridge node. Energy transit and industrial goods.",
  },

  // ── Phase 4: Transatlantic (SFT via Azores) ───────────────────────────────

  new_york: {
    id: "new_york",
    name: "New York",
    lat: 40.7128,
    lng: -74.006,
    country: "United States",
    flag: "🇺🇸",
    continent: "north_america",
    phase: 4,
    cargoRole: "East Coast freight anchor. Port of NY/NJ: 8M TEU/yr. Finance hub.",
  },
  sao_paulo: {
    id: "sao_paulo",
    name: "São Paulo",
    lat: -23.5505,
    lng: -46.6333,
    country: "Brazil",
    flag: "🇧🇷",
    continent: "south_america",
    phase: 4,
    cargoRole: "South America's largest economy. Soy, iron ore, aviation exports.",
  },
  azores: {
    id: "azores",
    name: "Azores",
    lat: 37.7412,
    lng: -25.6756,
    country: "Portugal",
    flag: "🇵🇹",
    continent: "europe",
    phase: 4,
    cargoRole: "SFT mid-Atlantic waypoint station. Lajes mid-ocean ridge anchor.",
  },
  lisbon: {
    id: "lisbon",
    name: "Lisbon",
    lat: 38.7169,
    lng: -9.1395,
    country: "Portugal",
    flag: "🇵🇹",
    continent: "europe",
    phase: 4,
    cargoRole: "Atlantic Europe gateway. Phase 4 European SFT landfall.",
  },
  buenos_aires: {
    id: "buenos_aires",
    name: "Buenos Aires",
    lat: -34.6037,
    lng: -58.3816,
    country: "Argentina",
    flag: "🇦🇷",
    continent: "south_america",
    phase: 4,
    cargoRole: "Soy, lithium, beef export base. Mercosur anchor.",
  },

  // ── Phase 5: Transpacific & Completion ────────────────────────────────────

  los_angeles: {
    id: "los_angeles",
    name: "Los Angeles",
    lat: 34.0522,
    lng: -118.2437,
    country: "United States",
    flag: "🇺🇸",
    continent: "north_america",
    phase: 5,
    cargoRole: "Port of LA/Long Beach: largest US container port. Asia-Pacific gateway.",
  },
  chicago: {
    id: "chicago",
    name: "Chicago",
    lat: 41.8781,
    lng: -87.6298,
    country: "United States",
    flag: "🇺🇸",
    continent: "north_america",
    phase: 5,
    cargoRole: "North American rail hub. Inland distribution center.",
  },
  toronto: {
    id: "toronto",
    name: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    country: "Canada",
    flag: "🇨🇦",
    continent: "north_america",
    phase: 5,
    cargoRole: "Canada's largest metro. Auto parts corridor with Detroit.",
  },
  mexico_city: {
    id: "mexico_city",
    name: "Mexico City",
    lat: 19.4326,
    lng: -99.1332,
    country: "Mexico",
    flag: "🇲🇽",
    continent: "north_america",
    phase: 5,
    cargoRole: "USMCA manufacturing hub. Auto and electronics exports.",
  },
  sydney: {
    id: "sydney",
    name: "Sydney",
    lat: -33.8688,
    lng: 151.2093,
    country: "Australia",
    flag: "🇦🇺",
    continent: "oceania",
    phase: 5,
    cargoRole: "Australia's trade gateway. Iron ore, LNG, agricultural exports.",
  },
};

export type CityKey = keyof typeof CITIES;
export const CITY_LIST = Object.values(CITIES);
