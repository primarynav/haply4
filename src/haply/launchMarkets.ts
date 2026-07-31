/**
 * Metros where dating is open.
 *
 * A dating product is only useful where it is dense: spread thin, a few thousand
 * members is nobody anywhere, while the same few thousand concentrated is a real
 * community with real meetups. That is the whole reason this list exists, and it
 * is the reason to be careful about growing it — every metro added divides the
 * same member base into more places, and a city that opens empty stays empty.
 * Members outside these metros still get a full account; only dating waits, and
 * their postal code goes on the waitlist, which is how demand rather than a
 * hunch picks the next one.
 *
 * The first ten are the largest US cities by population, followed by the three
 * the founding network actually started in. Adding one is a single entry here.
 */

export interface LaunchMetro {
  slug: string;
  label: string;
  short: string;
  lat: number;
  lng: number;
  /** Leading three digits of US ZIPs that belong to this metro. */
  zipPrefixes: string[];
}

/**
 * `zipPrefixes` are ZIP3 ranges, which approximate a metro rather than trace it.
 * A ZIP3 covers a wide area, so the edges are rough by construction: someone an
 * hour out may be counted in, and a neighbourhood on a boundary may be counted
 * out. That is the trade for having no geocoding dependency, and it is why the
 * postal check gates dating only — never account creation.
 *
 * Prefixes must not repeat across entries: `metroForPostal` returns the first
 * match, so a duplicate would silently assign people to the wrong city.
 */
export const LAUNCH_METROS: LaunchMetro[] = [
  { slug: 'new-york', label: 'New York, NY', short: 'New York', lat: 40.71, lng: -74.01, zipPrefixes: ['100', '101', '102', '103', '104', '110', '111', '112', '113', '114', '116'] },
  { slug: 'los-angeles', label: 'Los Angeles, CA', short: 'Los Angeles', lat: 34.05, lng: -118.24, zipPrefixes: ['900', '901', '902', '903', '904', '905', '906', '907', '908', '910', '911', '912', '913', '914', '915', '916', '917', '918'] },
  { slug: 'chicago', label: 'Chicago, IL', short: 'Chicago', lat: 41.88, lng: -87.63, zipPrefixes: ['600', '601', '602', '603', '604', '605', '606', '607', '608'] },
  { slug: 'houston', label: 'Houston, TX', short: 'Houston', lat: 29.76, lng: -95.37, zipPrefixes: ['770', '771', '772', '773', '774', '775'] },
  { slug: 'phoenix', label: 'Phoenix, AZ', short: 'Phoenix', lat: 33.45, lng: -112.07, zipPrefixes: ['850', '851', '852', '853'] },
  { slug: 'philadelphia', label: 'Philadelphia, PA', short: 'Philadelphia', lat: 39.95, lng: -75.17, zipPrefixes: ['190', '191', '194'] },
  { slug: 'san-antonio', label: 'San Antonio, TX', short: 'San Antonio', lat: 29.42, lng: -98.49, zipPrefixes: ['780', '781', '782'] },
  { slug: 'san-diego', label: 'San Diego, CA', short: 'San Diego', lat: 32.72, lng: -117.16, zipPrefixes: ['919', '920', '921'] },
  { slug: 'dallas', label: 'Dallas–Fort Worth, TX', short: 'Dallas', lat: 32.78, lng: -96.8, zipPrefixes: ['750', '751', '752', '753', '760', '761'] },
  { slug: 'jacksonville', label: 'Jacksonville, FL', short: 'Jacksonville', lat: 30.33, lng: -81.66, zipPrefixes: ['320', '322'] },
  { slug: 'seattle', label: 'Seattle–Tacoma, WA', short: 'Seattle', lat: 47.61, lng: -122.33, zipPrefixes: ['980', '981', '982', '983', '984', '985'] },
  { slug: 'denver', label: 'Denver–Boulder, CO', short: 'Denver', lat: 39.74, lng: -104.99, zipPrefixes: ['800', '801', '802', '803', '804'] },
  { slug: 'austin', label: 'Austin, TX', short: 'Austin', lat: 30.27, lng: -97.74, zipPrefixes: ['786', '787'] }
];

// A repeated prefix silently sends people to whichever city is listed first, and
// the list is long enough now that adding one by hand can collide unnoticed.
if (import.meta.env.DEV) {
  const seen = new Set<string>();
  const dupes = LAUNCH_METROS.flatMap((m) => m.zipPrefixes).filter((p) => (seen.has(p) ? true : (seen.add(p), false)));
  if (dupes.length) console.error(`launchMarkets: duplicate ZIP prefixes ${[...new Set(dupes)].join(', ')}`);
}

export const metroBySlug = (slug: string | null | undefined): LaunchMetro | undefined => LAUNCH_METROS.find((m) => m.slug === slug);

/** US ZIPs only, 5 digits, optional +4 which we ignore. */
export function normalizePostal(raw: string): string | null {
  const digits = (raw || '').trim().replace(/\s|-/g, '');
  return /^\d{5}(\d{4})?$/.test(digits) ? digits.slice(0, 5) : null;
}

/** The launch metro a postal code falls in, or null if it is outside all of them. */
export function metroForPostal(raw: string): LaunchMetro | null {
  const zip = normalizePostal(raw);
  if (!zip) return null;
  const prefix = zip.slice(0, 3);
  return LAUNCH_METROS.find((m) => m.zipPrefixes.includes(prefix)) ?? null;
}

export const isValidPostal = (raw: string): boolean => normalizePostal(raw) !== null;

/**
 * "New York, Los Angeles, Chicago, Houston, Phoenix and 8 more" — for copy that
 * lists where we've opened.
 *
 * Naming every city stopped being readable past a handful of them, so the list
 * is capped. The postal field is what actually answers "is my city in?", and it
 * answers precisely; this is only ever the gist.
 */
export function metroListSentence(cap = 5): string {
  const names = LAUNCH_METROS.map((m) => m.short);
  if (names.length <= 1) return names[0] ?? '';
  if (names.length > cap) return `${names.slice(0, cap).join(', ')} and ${names.length - cap} more`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * "New York, Los Angeles and Chicago" — a few names to make a count concrete,
 * with no "and N more" tail, so it reads naturally after one.
 */
export function metroExamples(n = 3): string {
  const names = LAUNCH_METROS.slice(0, n).map((m) => m.short);
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** "13 US cities" — for badges and tight spots where no list fits. */
export function metroCountSentence(): string {
  const n = LAUNCH_METROS.length;
  return `${n} US ${n === 1 ? 'city' : 'cities'}`;
}
