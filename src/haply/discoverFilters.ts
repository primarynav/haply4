import { PROFILES, type Profile } from './data';

/** Discover's search criteria, in the spirit of a classic dating-site filter panel. */
export interface DiscoverFilters {
  gender: 'women' | 'men' | 'anyone';
  minAge: number;
  maxAge: number;
  /** Miles from `originLat`/`originLng`. `0` means "anywhere". */
  radius: number;
  originLat?: number;
  originLng?: number;
  originLabel?: string;
  /** Profile must share at least one of these. Empty means no interest constraint. */
  interests: string[];
  kids: 'any' | 'has' | 'none';
  smoking: 'any' | 'no';
  drinking: 'any' | 'never' | 'not-regularly';
  /** Minimum education tier; see EDU_TIERS. */
  education: 'any' | 'college' | 'grad';
}

export const AGE_FLOOR = 21;
export const AGE_CEIL = 70;
export const RADIUS_STEPS = [0, 25, 50, 100, 250, 500];

export const emptyFilters = (): DiscoverFilters => ({
  gender: 'anyone',
  minAge: AGE_FLOOR,
  maxAge: AGE_CEIL,
  radius: 0,
  interests: [],
  kids: 'any',
  smoking: 'any',
  drinking: 'any',
  education: 'any'
});

/** Interest labels present in the pool, most common first. */
export function interestOptions(limit = 20): string[] {
  const counts = new Map<string, number>();
  for (const p of PROFILES) for (const i of p.interests) counts.set(i, (counts.get(i) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label]) => label);
}

/** Great-circle miles between two points. */
export function distanceMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const GRAD = /master|mba|phd|jd|mfa|doctor/i;
const COLLEGE = /bachelor|associate|nursing \(rn\)|mba|master|phd|jd|mfa/i;

function passesEducation(p: Profile, want: DiscoverFilters['education']): boolean {
  if (want === 'any') return true;
  const e = p.education ?? '';
  return want === 'grad' ? GRAD.test(e) : COLLEGE.test(e);
}

function passesDrinking(p: Profile, want: DiscoverFilters['drinking']): boolean {
  if (want === 'any') return true;
  const d = (p.drinking ?? '').toLowerCase();
  if (want === 'never') return d === 'never';
  return d !== 'regularly';
}

export interface Scored {
  profile: Profile;
  miles?: number;
}

/**
 * Applies every filter, then orders by distance when a radius is set so the
 * nearest matches lead. Profiles missing a field are only excluded when a filter
 * actually constrains that field — unknown is not treated as disqualifying.
 */
export function applyFilters(f: DiscoverFilters, hidden: number[] = []): Scored[] {
  const hide = new Set(hidden);
  const out: Scored[] = [];

  for (const p of PROFILES) {
    if (hide.has(p.id)) continue;
    if (f.gender === 'women' && p.gender !== 'woman') continue;
    if (f.gender === 'men' && p.gender !== 'man') continue;
    if (p.age < f.minAge || p.age > f.maxAge) continue;

    const isParent = !!p.children && p.children !== 'None' && !/^no\b/i.test(p.children);
    if (f.kids === 'has' && !isParent) continue;
    if (f.kids === 'none' && isParent) continue;

    if (f.smoking === 'no' && !/^no/i.test(p.smoking ?? 'No')) continue;
    if (!passesDrinking(p, f.drinking)) continue;
    if (!passesEducation(p, f.education)) continue;

    if (f.interests.length) {
      const has = p.interests.some((i) => f.interests.some((w) => i.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(i.toLowerCase())));
      if (!has) continue;
    }

    let miles: number | undefined;
    if (f.originLat !== undefined && f.originLng !== undefined && p.lat !== undefined && p.lng !== undefined) {
      miles = distanceMiles(f.originLat, f.originLng, p.lat, p.lng);
      if (f.radius > 0 && miles > f.radius) continue;
    } else if (f.radius > 0) {
      // A radius was requested but one side has no coordinates — can't honour it.
      continue;
    }

    out.push({ profile: p, miles });
  }

  if (f.radius > 0 || f.originLat !== undefined) out.sort((a, b) => (a.miles ?? 1e9) - (b.miles ?? 1e9));
  return out;
}

/**
 * Translates what the matchmaker learned into grid filters, so the AI side sheet
 * and the manual filter bar drive the same result set.
 */
export function filtersFromProfile(
  p: { seeking?: string; minAge?: number; maxAge?: number; city?: string; interests: string[]; prefKidsOk?: boolean },
  prev: DiscoverFilters
): DiscoverFilters {
  const next: DiscoverFilters = { ...prev };
  if (p.seeking === 'women' || p.seeking === 'men' || p.seeking === 'anyone') next.gender = p.seeking;
  if (typeof p.minAge === 'number') next.minAge = Math.max(AGE_FLOOR, p.minAge);
  if (typeof p.maxAge === 'number') next.maxAge = Math.min(AGE_CEIL, p.maxAge);
  if (p.interests.length) next.interests = p.interests.slice(0, 4);

  if (p.city) {
    const want = p.city.split(',')[0].trim().toLowerCase();
    const hit = PROFILES.find((x) => x.location.toLowerCase().startsWith(want) && x.lat !== undefined);
    if (hit) {
      next.originLabel = hit.location;
      next.originLat = hit.lat;
      next.originLng = hit.lng;
      if (next.radius === 0) next.radius = 100;
    }
  }
  return next;
}

const RELAX_LABELS: Record<string, string> = {
  gender: 'who you want to meet',
  age: 'the age range',
  radius: 'the distance',
  interests: 'the interests',
  kids: 'the kids filter',
  smoking: 'the smoking filter',
  drinking: 'the drinking filter',
  education: 'the education filter'
};

/**
 * When nothing matches, work out which single filter is doing the excluding, so
 * the empty state can name it instead of just saying "no results".
 */
export function suggestRelax(f: DiscoverFilters, hidden: number[] = []): { label: string; count: number } | null {
  const d = emptyFilters();
  const variants: [string, DiscoverFilters][] = [];
  if (f.gender !== d.gender) variants.push(['gender', { ...f, gender: d.gender }]);
  if (f.minAge !== d.minAge || f.maxAge !== d.maxAge) variants.push(['age', { ...f, minAge: d.minAge, maxAge: d.maxAge }]);
  if (f.radius !== d.radius) variants.push(['radius', { ...f, radius: d.radius }]);
  if (f.interests.length) variants.push(['interests', { ...f, interests: [] }]);
  if (f.kids !== d.kids) variants.push(['kids', { ...f, kids: d.kids }]);
  if (f.smoking !== d.smoking) variants.push(['smoking', { ...f, smoking: d.smoking }]);
  if (f.drinking !== d.drinking) variants.push(['drinking', { ...f, drinking: d.drinking }]);
  if (f.education !== d.education) variants.push(['education', { ...f, education: d.education }]);

  let best: { label: string; count: number } | null = null;
  for (const [key, variant] of variants) {
    const n = applyFilters(variant, hidden).length;
    if (n > 0 && (!best || n > best.count)) best = { label: RELAX_LABELS[key], count: n };
  }
  return best;
}

/** Count of filters differing from the default, for the "N active" badge. */
export function activeFilterCount(f: DiscoverFilters): number {
  const d = emptyFilters();
  let n = 0;
  if (f.gender !== d.gender) n++;
  if (f.minAge !== d.minAge || f.maxAge !== d.maxAge) n++;
  if (f.radius !== d.radius) n++;
  if (f.interests.length) n++;
  if (f.kids !== d.kids) n++;
  if (f.smoking !== d.smoking) n++;
  if (f.drinking !== d.drinking) n++;
  if (f.education !== d.education) n++;
  return n;
}
