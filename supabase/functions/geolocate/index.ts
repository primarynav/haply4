// Coarse, consent-free location from the caller's IP, used to prefill Discover's
// distance filter. Precise location comes from the browser Geolocation API on the
// client — that needs explicit permission and is never requested here.
//
// The lookup lives server-side so the client never talks to a geo provider
// directly: the provider can be swapped, or given a key, without shipping a new
// frontend bundle.

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

interface Located {
  city: string;
  region: string;
  lat: number;
  lng: number;
  source: string;
}

/** First public address in the forwarding chain. */
function clientIp(req: Request): string | null {
  const fwd = req.headers.get('x-forwarded-for') ?? '';
  for (const part of fwd.split(',')) {
    const ip = part.trim();
    if (!ip) continue;
    // Skip loopback and RFC1918 — a lookup on those tells us nothing.
    if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fe80:)/i.test(ip)) continue;
    return ip;
  }
  return req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip');
}

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? Number.parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : null;
};

/** Two providers, both keyless, so one being down or rate-limited is survivable. */
async function lookup(ip: string): Promise<Located | null> {
  const attempts: { name: string; url: string; read: (d: Record<string, unknown>) => Located | null }[] = [
    {
      name: 'geojs',
      url: `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`,
      read: (d) => {
        const lat = num(d.latitude);
        const lng = num(d.longitude);
        return lat === null || lng === null ? null : { city: String(d.city ?? ''), region: String(d.region ?? ''), lat, lng, source: 'geojs' };
      }
    },
    {
      name: 'ipapi',
      url: `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
      read: (d) => {
        const lat = num(d.latitude);
        const lng = num(d.longitude);
        return lat === null || lng === null ? null : { city: String(d.city ?? ''), region: String(d.region_code ?? d.region ?? ''), lat, lng, source: 'ipapi' };
      }
    }
  ];

  for (const a of attempts) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 3500);
      const res = await fetch(a.url, { signal: ctl.signal, headers: { accept: 'application/json' } });
      clearTimeout(timer);
      if (!res.ok) {
        console.error(`geolocate: ${a.name} returned ${res.status}`);
        continue;
      }
      const parsed = a.read(await res.json());
      if (parsed) return parsed;
      console.error(`geolocate: ${a.name} returned no usable coordinates`);
    } catch (e) {
      console.error(`geolocate: ${a.name} failed:`, e instanceof Error ? e.message : String(e));
    }
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const ip = clientIp(req);
  if (!ip) return json({ error: 'no_client_ip' }, 200);

  const located = await lookup(ip);
  if (!located) return json({ error: 'lookup_failed' }, 200);

  console.log(`geolocate ok via ${located.source}: ${located.city}, ${located.region}`);
  // The IP itself is deliberately not echoed back or stored.
  return json({ result: located });
});
