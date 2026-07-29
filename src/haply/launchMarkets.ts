/**
 * Launch metros.
 *
 * A dating product is only useful where it is dense. Spread across 123 metros,
 * a few thousand members is nobody anywhere; concentrated in three, the same
 * few thousand is a real community with real meetups. So signup is deliberately
 * limited to these markets and everyone else joins a waitlist — which also tells
 * us where the fourth metro should be, instead of guessing.
 *
 * Pick these for where the founding network actually is, not for city size.
 * Adding one is a single entry here.
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

export const LAUNCH_METROS: LaunchMetro[] = [
  { slug: 'seattle', label: 'Seattle–Tacoma, WA', short: 'Seattle', lat: 47.61, lng: -122.33, zipPrefixes: ['980', '981', '982', '983', '984', '985'] },
  { slug: 'denver', label: 'Denver–Boulder, CO', short: 'Denver', lat: 39.74, lng: -104.99, zipPrefixes: ['800', '801', '802', '803', '804'] },
  { slug: 'austin', label: 'Austin, TX', short: 'Austin', lat: 30.27, lng: -97.74, zipPrefixes: ['786', '787'] }
];

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

/** "Seattle, Denver and Austin" — for copy that lists where we've opened. */
export function metroListSentence(): string {
  const names = LAUNCH_METROS.map((m) => m.short);
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
