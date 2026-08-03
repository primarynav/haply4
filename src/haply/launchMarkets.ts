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
 * One city, deliberately. Thirteen metros divided a member base of almost
 * nobody into thirteen empty rooms; one city is the only way the first hundred
 * members can actually meet each other. Chicago because that is where the
 * founder is and can show up in person — the first hundred members of anything
 * are recruited by hand, not acquired.
 *
 * Everywhere else still gets a full account: the community is national and
 * works at ten members. Only dating waits, and the waitlist is what says where
 * the second city should be. Adding one is a single entry here.
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
  { slug: 'chicago', label: 'Chicago, IL', short: 'Chicago', lat: 41.88, lng: -87.63, zipPrefixes: ['600', '601', '602', '603', '604', '605', '606', '607', '608'] }
];

// A repeated prefix silently sends people to whichever city is listed first, and
// the list is long enough now that adding one by hand can collide unnoticed.
if (import.meta.env.DEV) {
  const seen = new Set<string>();
  const dupes = LAUNCH_METROS.flatMap((m) => m.zipPrefixes).filter((p) => (seen.has(p) ? true : (seen.add(p), false)));
  if (dupes.length) console.error(`launchMarkets: duplicate ZIP prefixes ${[...new Set(dupes)].join(', ')}`);
}

/**
 * Stored as a member's metro once their postal code has been checked and found
 * outside every launch metro.
 *
 * Null means we never asked — an older account, or one created before the
 * question existed — and unknown must not be treated as "outside", or those
 * members lose dating for a blank field. This sentinel is the difference
 * between the two, and it deliberately matches no slug.
 */
export const METRO_OUTSIDE = 'outside';

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
