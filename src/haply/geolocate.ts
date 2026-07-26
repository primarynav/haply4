import { supabase } from './supabaseClient';
import { PROFILES } from './data';
import { distanceMiles } from './discoverFilters';

export interface DetectedLocation {
  /** A city from the member pool, so it can drive the distance filter directly. */
  label: string;
  lat: number;
  lng: number;
  /** How it was determined — worth surfacing, since accuracy differs a lot. */
  source: 'gps' | 'ip';
  /** Miles between the raw fix and the city we snapped to. */
  offBy: number;
}

/** Cities that actually have members, with coordinates. Built once. */
let cityCache: { location: string; lat: number; lng: number }[] | null = null;
function cities() {
  if (!cityCache) {
    const seen = new Map<string, { location: string; lat: number; lng: number }>();
    for (const p of PROFILES) {
      if (p.lat === undefined || p.lng === undefined || seen.has(p.location)) continue;
      seen.set(p.location, { location: p.location, lat: p.lat, lng: p.lng });
    }
    cityCache = [...seen.values()];
  }
  return cityCache;
}

/**
 * Snaps a raw fix to the nearest city we have members in. The filter works on
 * city coordinates, so an exact street-level fix has nothing to attach to —
 * and snapping avoids storing a precise position we have no use for.
 */
export function nearestCity(lat: number, lng: number): { location: string; lat: number; lng: number; miles: number } | null {
  let best: { location: string; lat: number; lng: number; miles: number } | null = null;
  for (const c of cities()) {
    const miles = distanceMiles(lat, lng, c.lat, c.lng);
    if (!best || miles < best.miles) best = { ...c, miles };
  }
  return best;
}

/**
 * Precise fix from the browser. Triggers a permission prompt, so only call this
 * from a deliberate user action — never on page load.
 */
export function detectPrecise(timeoutMs = 10000): Promise<DetectedLocation | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const snapped = nearestCity(pos.coords.latitude, pos.coords.longitude);
        resolve(snapped ? { label: snapped.location, lat: snapped.lat, lng: snapped.lng, source: 'gps', offBy: snapped.miles } : null);
      },
      // Denied, unavailable, or timed out — all resolve to null so the caller
      // can fall back rather than handling three failure shapes.
      () => resolve(null),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 }
    );
  });
}

/** Coarse fix from the caller's IP, via the edge function. No permission needed. */
export async function detectByIp(): Promise<DetectedLocation | null> {
  try {
    const { data, error } = await supabase.functions.invoke('geolocate', { body: {} });
    const r = data?.result;
    if (error || !r || typeof r.lat !== 'number' || typeof r.lng !== 'number') return null;
    const snapped = nearestCity(r.lat, r.lng);
    return snapped ? { label: snapped.location, lat: snapped.lat, lng: snapped.lng, source: 'ip', offBy: snapped.miles } : null;
  } catch {
    return null;
  }
}

/**
 * Best available location without prompting: uses the browser only if permission
 * was already granted in a previous session, otherwise falls back to IP.
 */
export async function detectQuietly(): Promise<DetectedLocation | null> {
  try {
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (status.state === 'granted') {
        const precise = await detectPrecise(6000);
        if (precise) return precise;
      }
    }
  } catch {
    // Permissions API unsupported (older Safari) — fall through to IP.
  }
  return detectByIp();
}
