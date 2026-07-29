/**
 * Partner attribution.
 *
 * Paid acquisition does not work at this price point — a niche dating CAC of
 * $80–300 per payer against a lifetime value near $100 is how this category
 * kills its companies. The channel that does work is people who meet our member
 * at exactly the right moment: divorce attorneys, mediators, family therapists,
 * financial advisors. They cost nothing per referral, but only if we can tell
 * which ones actually send anyone.
 *
 * So: a partner gets a link (haply.com/?ref=CODE), the code survives the whole
 * signup journey including an OAuth round trip, and lands on the profile row.
 */

const KEY = 'haply.ref';
const SOURCE_KEY = 'haply.ref.source';

/** Codes are short, case-insensitive, and safe to put on a printed card. */
const VALID = /^[a-z0-9][a-z0-9-]{1,31}$/i;

/**
 * Reads ?ref= / ?partner= / ?utm_source= off the current URL and remembers it.
 * First touch wins — a partner who introduced someone should not lose the
 * credit because that person later arrived via a search result.
 */
export function captureReferral(search: string = window.location.search): void {
  try {
    const params = new URLSearchParams(search);
    const raw = params.get('ref') || params.get('partner') || '';
    const code = raw.trim().toLowerCase();
    if (code && VALID.test(code) && !localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, code);
      const source = (params.get('utm_source') || params.get('src') || '').trim().toLowerCase().slice(0, 64);
      if (source) localStorage.setItem(SOURCE_KEY, source);
    }
  } catch {
    /* private browsing / storage disabled — attribution is best-effort only */
  }
}

/**
 * Records which entry point a visitor arrived through when there's no partner
 * code involved — e.g. the switch landing page. First touch wins, same as codes.
 */
export function noteSource(source: string): void {
  try {
    if (!localStorage.getItem(SOURCE_KEY)) localStorage.setItem(SOURCE_KEY, source.slice(0, 64));
  } catch {
    /* storage disabled */
  }
}

export function storedReferral(): { code: string | null; source: string | null } {
  try {
    return { code: localStorage.getItem(KEY), source: localStorage.getItem(SOURCE_KEY) };
  } catch {
    return { code: null, source: null };
  }
}

/** Called once the code has been written to the member's profile. */
export function clearReferral(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(SOURCE_KEY);
  } catch {
    /* nothing to clear */
  }
}
