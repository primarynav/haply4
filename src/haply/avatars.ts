import { PROFILES, type Post, type Profile } from './data';

/** Small stable string hash — same input always picks the same avatar/profile. */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// First names used by the seeded community posts (scripts/seed-posts.mjs), so the
// stock photo picked for each one at least matches the gender implied by the name.
const FEMALE_SEED_NAMES = new Set([
  'dana', 'priya', 'alicia', 'renee', 'nicole', 'bethany', 'carmen', 'lauren', 'michelle', 'elena', 'yolanda', 'simone', 'gina', 'farah'
]);
const MALE_SEED_NAMES = new Set([
  'marcus', 'kevin', 'tom', 'jordan', 'greg', 'sam', 'derek', 'anthony', 'ray', 'chris', 'paul', 'nate', 'doug'
]);

function genderHint(firstName: string): 'man' | 'woman' | null {
  const f = firstName.toLowerCase();
  if (FEMALE_SEED_NAMES.has(f)) return 'woman';
  if (MALE_SEED_NAMES.has(f)) return 'man';
  return null;
}

let poolByGender: Record<'man' | 'woman', Profile[]> | null = null;
function pool() {
  if (!poolByGender) {
    poolByGender = { man: PROFILES.filter((p) => p.gender === 'man'), woman: PROFILES.filter((p) => p.gender === 'woman') };
  }
  return poolByGender;
}

/**
 * A stock photo + bio from the existing member pool, used to give a fictional
 * community post (no real account behind it) a face and a "profile" to click
 * into. Real accounts (post.userId set) and the Haply Team brand account never
 * get one — they are handled separately.
 */
export function demoMatchForPost(post: Post): Profile | null {
  if (post.userId || post.name === 'Haply Team') return null;
  const firstName = post.name.split(' ')[0];
  const hint = genderHint(firstName);
  const candidates = hint ? pool()[hint] : PROFILES;
  if (!candidates.length) return null;
  const idx = hashString(`${post.id}:${post.name}`) % candidates.length;
  return candidates[idx];
}

const AVATAR_GRADIENTS: [string, string][] = [
  ['#FDA4AF', '#e11d48'],
  ['#93C5FD', '#1d4ed8'],
  ['#86EFAC', '#15803d'],
  ['#FCD34D', '#b45309'],
  ['#D8B4FE', '#7e22ce'],
  ['#67E8F9', '#0e7490']
];

/**
 * A deterministic illustrated avatar for a real member who hasn't uploaded a
 * photo (there's no upload pipeline yet — see photos table, unused). Same seed
 * always renders the same image, so it stays stable across sessions/devices.
 */
export function generatedAvatarDataUri(seed: string, initial: string): string {
  const h = hashString(seed || 'member');
  const [c1, c2] = AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="96" height="96" rx="48" fill="url(#g)"/><text x="48" y="48" text-anchor="middle" dominant-baseline="central" font-family="Georgia, serif" font-size="40" fill="#fff">${initial.toUpperCase()}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface PostAvatar {
  src: string;
  /** What clicking the avatar/name should do. Demo cards carry their own display data —
   *  the post's own name, not the matched pool profile's, so identity stays consistent. */
  action: { kind: 'demo-card'; profile: Profile } | { kind: 'member-card'; uid: string } | { kind: 'none' };
}

export function avatarForPost(post: Post): PostAvatar {
  if (post.name === 'Haply Team') {
    return { src: generatedAvatarDataUri('haply-team', 'H'), action: { kind: 'none' } };
  }
  if (post.userId) {
    return { src: generatedAvatarDataUri(post.userId, post.name.charAt(0)), action: { kind: 'member-card', uid: post.userId } };
  }
  const match = demoMatchForPost(post);
  if (match) return { src: match.image, action: { kind: 'demo-card', profile: match } };
  return { src: generatedAvatarDataUri(post.name, post.name.charAt(0)), action: { kind: 'none' } };
}
