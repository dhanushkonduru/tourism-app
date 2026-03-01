import { Destination } from '../models/destination.model';
import { CITY_IMAGE_URL_MAP } from './city-image-url.map';

type Region = 'europe' | 'asia' | 'north-america' | 'south-america' | 'africa' | 'oceania';

interface PlaceSeed {
  city: string;
  country: string;
  code: string;
  region: Region;
  highlight: string;
}

const REGION_PRICE_BANDS: Record<Region, { min: number; max: number }> = {
  europe: { min: 1100, max: 4600 },
  asia: { min: 700, max: 3900 },
  'north-america': { min: 1200, max: 4900 },
  'south-america': { min: 650, max: 3200 },
  africa: { min: 800, max: 3600 },
  oceania: { min: 1300, max: 5200 }
};

const NAME_SUFFIXES = [
  'Signature Escape',
  'Grand Voyage',
  'Luxe Discovery',
  'Heritage Trail',
  'Scenic Retreat',
  'Elite Journey',
  'Horizon Collection',
  'Curated Sojourn',
  'Prestige Getaway'
];

const TAG_SETS: string[][] = [
  ['Luxury', 'Honeymoon', 'Cultural'],
  ['Adventure', 'Nature', 'Family'],
  ['Luxury', 'Family', 'Cultural'],
  ['Adventure', 'Cultural', 'Nature'],
  ['Luxury', 'Adventure', 'Honeymoon'],
  ['Family', 'Cultural', 'Nature'],
  ['Luxury', 'Nature', 'Family'],
  ['Adventure', 'Luxury', 'Cultural'],
  ['Honeymoon', 'Luxury', 'Nature'],
  ['Family', 'Adventure', 'Cultural'],
  ['Luxury', 'Cultural', 'Nature'],
  ['Adventure', 'Honeymoon', 'Nature']
];

const PLACE_SEEDS: PlaceSeed[] = [
  { city: 'Paris', country: 'France', code: 'FR', region: 'europe', highlight: 'iconic boulevards and world-class museums' },
  { city: 'Rome', country: 'Italy', code: 'IT', region: 'europe', highlight: 'ancient landmarks and vibrant piazzas' },
  { city: 'Barcelona', country: 'Spain', code: 'ES', region: 'europe', highlight: 'coastal architecture and gourmet tapas scenes' },
  { city: 'Santorini', country: 'Greece', code: 'GR', region: 'europe', highlight: 'caldera sunsets and cliffside suites' },
  { city: 'Vienna', country: 'Austria', code: 'AT', region: 'europe', highlight: 'imperial palaces and classical culture' },
  { city: 'Prague', country: 'Czechia', code: 'CZ', region: 'europe', highlight: 'storybook squares and riverside charm' },
  { city: 'Amsterdam', country: 'Netherlands', code: 'NL', region: 'europe', highlight: 'canal-side luxury and boutique design' },
  { city: 'Dubrovnik', country: 'Croatia', code: 'HR', region: 'europe', highlight: 'adriatic walls and yachting lifestyle' },
  { city: 'Lisbon', country: 'Portugal', code: 'PT', region: 'europe', highlight: 'historic tramways and ocean viewpoints' },
  { city: 'Interlaken', country: 'Switzerland', code: 'CH', region: 'europe', highlight: 'alpine panoramas and premium chalets' },
  { city: 'Edinburgh', country: 'United Kingdom', code: 'GB', region: 'europe', highlight: 'castle heritage and refined city stays' },
  { city: 'Reykjavik', country: 'Iceland', code: 'IS', region: 'europe', highlight: 'nordic spas and dramatic landscapes' },
  { city: 'Venice', country: 'Italy', code: 'IT', region: 'europe', highlight: 'private canals and timeless romance' },
  { city: 'Zurich', country: 'Switzerland', code: 'CH', region: 'europe', highlight: 'lakefront elegance and mountain day trips' },
  { city: 'Copenhagen', country: 'Denmark', code: 'DK', region: 'europe', highlight: 'scandinavian style and harbor dining' },
  { city: 'Budapest', country: 'Hungary', code: 'HU', region: 'europe', highlight: 'thermal baths and riverfront nights' },
  { city: 'Florence', country: 'Italy', code: 'IT', region: 'europe', highlight: 'renaissance art and luxury villas' },
  { city: 'Hallstatt', country: 'Austria', code: 'AT', region: 'europe', highlight: 'lake villages and serene alpine escapes' },

  { city: 'Bali', country: 'Indonesia', code: 'ID', region: 'asia', highlight: 'temple coastlines and wellness sanctuaries' },
  { city: 'Tokyo', country: 'Japan', code: 'JP', region: 'asia', highlight: 'neon districts and refined omakase culture' },
  { city: 'Kyoto', country: 'Japan', code: 'JP', region: 'asia', highlight: 'zen gardens and heritage districts' },
  { city: 'Bangkok', country: 'Thailand', code: 'TH', region: 'asia', highlight: 'riverfront luxury and rooftop scenes' },
  { city: 'Singapore', country: 'Singapore', code: 'SG', region: 'asia', highlight: 'urban gardens and premium shopping' },
  { city: 'Seoul', country: 'South Korea', code: 'KR', region: 'asia', highlight: 'palace culture and contemporary design' },
  { city: 'Phuket', country: 'Thailand', code: 'TH', region: 'asia', highlight: 'beach resorts and island adventures' },
  { city: 'Hanoi', country: 'Vietnam', code: 'VN', region: 'asia', highlight: 'old quarter charm and culinary trails' },
  { city: 'Hoi An', country: 'Vietnam', code: 'VN', region: 'asia', highlight: 'lantern-lit streets and coastal escapes' },
  { city: 'Siem Reap', country: 'Cambodia', code: 'KH', region: 'asia', highlight: 'temple wonders and curated heritage tours' },
  { city: 'Colombo', country: 'Sri Lanka', code: 'LK', region: 'asia', highlight: 'colonial architecture and tea country routes' },
  { city: 'Abu Dhabi', country: 'United Arab Emirates', code: 'AE', region: 'asia', highlight: 'modern landmarks and desert luxury' },
  { city: 'Doha', country: 'Qatar', code: 'QA', region: 'asia', highlight: 'waterfront skylines and cultural museums' },
  { city: 'Jaipur', country: 'India', code: 'IN', region: 'asia', highlight: 'palace heritage and artisan markets' },
  { city: 'Goa', country: 'India', code: 'IN', region: 'asia', highlight: 'beach clubs and lusophone history' },
  { city: 'Kathmandu', country: 'Nepal', code: 'NP', region: 'asia', highlight: 'himalayan gateways and sacred temples' },
  { city: 'Baku', country: 'Azerbaijan', code: 'AZ', region: 'asia', highlight: 'caspian boulevards and old city alleys' },
  { city: 'Langkawi', country: 'Malaysia', code: 'MY', region: 'asia', highlight: 'rainforest islands and private beaches' },

  { city: 'New York', country: 'United States', code: 'US', region: 'north-america', highlight: 'iconic skyline stays and curated city nights' },
  { city: 'Banff', country: 'Canada', code: 'CA', region: 'north-america', highlight: 'glacial lakes and mountain lodges' },
  { city: 'Vancouver', country: 'Canada', code: 'CA', region: 'north-america', highlight: 'coastal luxury and forest escapes' },
  { city: 'Maui', country: 'United States', code: 'US', region: 'north-america', highlight: 'volcanic beaches and oceanfront retreats' },
  { city: 'Cancun', country: 'Mexico', code: 'MX', region: 'north-america', highlight: 'turquoise coastlines and resort experiences' },
  { city: 'Tulum', country: 'Mexico', code: 'MX', region: 'north-america', highlight: 'eco-luxe stays and cenote adventures' },
  { city: 'Quebec City', country: 'Canada', code: 'CA', region: 'north-america', highlight: 'european charm and winter festivals' },
  { city: 'San Francisco', country: 'United States', code: 'US', region: 'north-america', highlight: 'bay views and gourmet neighborhoods' },
  { city: 'Miami', country: 'United States', code: 'US', region: 'north-america', highlight: 'art deco glamour and beach clubs' },
  { city: 'Los Cabos', country: 'Mexico', code: 'MX', region: 'north-america', highlight: 'desert-sea landscapes and private resorts' },
  { city: 'Montreal', country: 'Canada', code: 'CA', region: 'north-america', highlight: 'old port culture and food scenes' },
  { city: 'Anchorage', country: 'United States', code: 'US', region: 'north-america', highlight: 'northern wilderness and scenic rail routes' },
  { city: 'Toronto', country: 'Canada', code: 'CA', region: 'north-america', highlight: 'urban waterfront and curated city breaks' },
  { city: 'Sedona', country: 'United States', code: 'US', region: 'north-america', highlight: 'red-rock hikes and luxury spas' },
  { city: 'Whistler', country: 'Canada', code: 'CA', region: 'north-america', highlight: 'premium slopes and alpine villages' },
  { city: 'New Orleans', country: 'United States', code: 'US', region: 'north-america', highlight: 'jazz heritage and culinary classics' },
  { city: 'Honolulu', country: 'United States', code: 'US', region: 'north-america', highlight: 'pacific beaches and island culture' },
  { city: 'Yellowstone', country: 'United States', code: 'US', region: 'north-america', highlight: 'geothermal wonders and nature lodges' },

  { city: 'Rio de Janeiro', country: 'Brazil', code: 'BR', region: 'south-america', highlight: 'coastal icons and samba nightlife' },
  { city: 'Buenos Aires', country: 'Argentina', code: 'AR', region: 'south-america', highlight: 'elegant boulevards and tango culture' },
  { city: 'Cusco', country: 'Peru', code: 'PE', region: 'south-america', highlight: 'andes heritage and sacred valley routes' },
  { city: 'Cartagena', country: 'Colombia', code: 'CO', region: 'south-america', highlight: 'colonial walls and caribbean breezes' },
  { city: 'Santiago', country: 'Chile', code: 'CL', region: 'south-america', highlight: 'urban vineyards and mountain panoramas' },
  { city: 'Patagonia', country: 'Argentina', code: 'AR', region: 'south-america', highlight: 'epic trails and glacier frontiers' },
  { city: 'Galápagos', country: 'Ecuador', code: 'EC', region: 'south-america', highlight: 'wildlife cruises and volcanic islands' },
  { city: 'Atacama', country: 'Chile', code: 'CL', region: 'south-america', highlight: 'stargazing deserts and surreal salt flats' },
  { city: 'Medellín', country: 'Colombia', code: 'CO', region: 'south-america', highlight: 'innovative districts and hillside views' },
  { city: 'Lima', country: 'Peru', code: 'PE', region: 'south-america', highlight: 'coastal gastronomy and heritage plazas' },
  { city: 'Ushuaia', country: 'Argentina', code: 'AR', region: 'south-america', highlight: 'southern fjords and expedition gateways' },
  { city: 'Salvador', country: 'Brazil', code: 'BR', region: 'south-america', highlight: 'afro-brazilian culture and colorful quarters' },
  { city: 'La Paz', country: 'Bolivia', code: 'BO', region: 'south-america', highlight: 'altitude cityscapes and dramatic valleys' },
  { city: 'Iguazú', country: 'Argentina', code: 'AR', region: 'south-america', highlight: 'legendary waterfalls and rainforest walks' },
  { city: 'Montevideo', country: 'Uruguay', code: 'UY', region: 'south-america', highlight: 'coastal rambla and boutique stays' },
  { city: 'Quito', country: 'Ecuador', code: 'EC', region: 'south-america', highlight: 'highland heritage and volcano backdrops' },
  { city: 'Florianópolis', country: 'Brazil', code: 'BR', region: 'south-america', highlight: 'island beaches and upscale surfing culture' },
  { city: 'Valparaíso', country: 'Chile', code: 'CL', region: 'south-america', highlight: 'hillside arts and pacific port character' },

  { city: 'Cape Town', country: 'South Africa', code: 'ZA', region: 'africa', highlight: 'table mountain views and wine routes' },
  { city: 'Marrakech', country: 'Morocco', code: 'MA', region: 'africa', highlight: 'riads, souks, and desert escapes' },
  { city: 'Zanzibar', country: 'Tanzania', code: 'TZ', region: 'africa', highlight: 'spice island beaches and heritage streets' },
  { city: 'Serengeti', country: 'Tanzania', code: 'TZ', region: 'africa', highlight: 'safari drives and wildlife spectacles' },
  { city: 'Victoria Falls', country: 'Zimbabwe', code: 'ZW', region: 'africa', highlight: 'thundering cascades and river adventures' },
  { city: 'Cairo', country: 'Egypt', code: 'EG', region: 'africa', highlight: 'pharaonic history and nile evenings' },
  { city: 'Luxor', country: 'Egypt', code: 'EG', region: 'africa', highlight: 'temple avenues and timeless antiquity' },
  { city: 'Seychelles', country: 'Seychelles', code: 'SC', region: 'africa', highlight: 'granite beaches and ultra-luxe resorts' },
  { city: 'Nairobi', country: 'Kenya', code: 'KE', region: 'africa', highlight: 'city-safari contrasts and modern culture' },
  { city: 'Mauritius', country: 'Mauritius', code: 'MU', region: 'africa', highlight: 'lagoon villas and tropical golf retreats' },
  { city: 'Windhoek', country: 'Namibia', code: 'NA', region: 'africa', highlight: 'desert routes and wildlife reserves' },
  { city: 'Essaouira', country: 'Morocco', code: 'MA', region: 'africa', highlight: 'atlantic ramparts and artistic medina life' },
  { city: 'Kruger', country: 'South Africa', code: 'ZA', region: 'africa', highlight: 'private game lodges and big-five safaris' },
  { city: 'Kigali', country: 'Rwanda', code: 'RW', region: 'africa', highlight: 'green city stays and highland journeys' },
  { city: 'Tunis', country: 'Tunisia', code: 'TN', region: 'africa', highlight: 'mediterranean heritage and old medina lanes' },
  { city: 'Okavango', country: 'Botswana', code: 'BW', region: 'africa', highlight: 'delta safaris and intimate camp luxury' },
  { city: 'Addis Ababa', country: 'Ethiopia', code: 'ET', region: 'africa', highlight: 'highland culture and historic routes' },
  { city: 'Dakar', country: 'Senegal', code: 'SN', region: 'africa', highlight: 'atlantic rhythm and vibrant arts districts' },

  { city: 'Sydney', country: 'Australia', code: 'AU', region: 'oceania', highlight: 'harbor icons and coastal luxury' },
  { city: 'Melbourne', country: 'Australia', code: 'AU', region: 'oceania', highlight: 'laneway culture and premium dining scenes' },
  { city: 'Queenstown', country: 'New Zealand', code: 'NZ', region: 'oceania', highlight: 'alpine lakes and adventure prestige' },
  { city: 'Nadi', country: 'Fiji', code: 'FJ', region: 'oceania', highlight: 'island resorts and coral lagoons' },
  { city: 'Bora Bora', country: 'French Polynesia', code: 'PF', region: 'oceania', highlight: 'overwater villas and turquoise reefs' },
  { city: 'Auckland', country: 'New Zealand', code: 'NZ', region: 'oceania', highlight: 'harbor escapes and volcanic landscapes' },
  { city: 'Gold Coast', country: 'Australia', code: 'AU', region: 'oceania', highlight: 'beachfront towers and surfing glamour' },
  { city: 'Cairns', country: 'Australia', code: 'AU', region: 'oceania', highlight: 'reef expeditions and tropical rainforests' },
  { city: 'Hobart', country: 'Australia', code: 'AU', region: 'oceania', highlight: 'tasmanian wilderness and harbor dining' },
  { city: 'Apia', country: 'Samoa', code: 'WS', region: 'oceania', highlight: 'polynesian culture and serene coastlines' },
  { city: 'Port Vila', country: 'Vanuatu', code: 'VU', region: 'oceania', highlight: 'lagoon views and island adventures' },
  { city: 'Rarotonga', country: 'Cook Islands', code: 'CK', region: 'oceania', highlight: 'reef rings and intimate island stays' },
  { city: 'Wellington', country: 'New Zealand', code: 'NZ', region: 'oceania', highlight: 'harbor hills and cultural institutions' },
  { city: 'Perth', country: 'Australia', code: 'AU', region: 'oceania', highlight: 'sunset beaches and wine regions' },
  { city: 'Rotorua', country: 'New Zealand', code: 'NZ', region: 'oceania', highlight: 'geothermal parks and māori heritage' },
  { city: 'Moorea', country: 'French Polynesia', code: 'PF', region: 'oceania', highlight: 'lagoon adventures and mountain peaks' },
  { city: 'Brisbane', country: 'Australia', code: 'AU', region: 'oceania', highlight: 'river city escapes and nearby islands' },
  { city: 'Adelaide', country: 'Australia', code: 'AU', region: 'oceania', highlight: 'vineyard luxury and coastal gateways' }
];

function flagFromCode(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

function seededNumber(seed: number, min: number, max: number): number {
  const value = Math.abs(Math.sin(seed * 12.9898) * 43758.5453);
  const normalized = value - Math.floor(value);
  return Math.round(min + normalized * (max - min));
}

function toHundreds(value: number): number {
  return Math.round(value / 100) * 100;
}

function buildDestination(seed: PlaceSeed, index: number): Destination {
  const id = index + 1;
  const priceBand = REGION_PRICE_BANDS[seed.region];

  const fromRaw = seededNumber(id + 3, priceBand.min, Math.max(priceBand.min + 300, priceBand.max - 900));
  const priceFrom = toHundreds(fromRaw);
  const extraNightsSpread = seededNumber(id + 17, 400, 1600);
  const priceTo = toHundreds(Math.min(priceFrom + extraNightsSpread, priceBand.max));

  const ratingStep = seededNumber(id + 29, 0, 8);
  const rating = Number((4.2 + ratingStep * 0.1).toFixed(1));

  const popularity = seededNumber(id + 41, 72, 99);
  const tags = TAG_SETS[(id * 7 + seed.region.length) % TAG_SETS.length];
  const suffix = NAME_SUFFIXES[(id * 5 + seed.city.length) % NAME_SUFFIXES.length];
  const imageQuery = `${seed.city} ${seed.country} landmark landscape`;
  const cityCountryKey = `${seed.city}, ${seed.country}`;
  const imageUrl =
    CITY_IMAGE_URL_MAP[cityCountryKey] ??
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&h=900&q=80';

  return {
    id,
    city: seed.city,
    name: `${seed.city} ${suffix}`,
    country: seed.country,
    flag: flagFromCode(seed.code),
    region: seed.region,
    imageQuery,
    imageUrl,
    image: imageUrl,
    rating,
    priceFrom,
    priceTo,
    popularity,
    tags,
    description: `${seed.city} offers ${seed.highlight}, curated for premium international travelers.`
  };
}

export const INTERNATIONAL_DESTINATIONS: Destination[] = PLACE_SEEDS.map((seed, index) => buildDestination(seed, index));
