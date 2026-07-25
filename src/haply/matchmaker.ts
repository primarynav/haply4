import { PROFILES, type Profile } from './data';

/** The member's matchmaking profile, built up conversationally and saved locally. */
export interface UserProfile {
  age?: number;
  gender?: 'man' | 'woman';
  city?: string;
  kids?: string;
  interests: string[];
  prefLocal?: boolean;
  prefSameAge?: boolean;
  prefKidsOk?: boolean;
  intro?: string;
  customIntro?: boolean;
}

export const emptyProfile = (): UserProfile => ({ interests: [] });

const INTEREST_WORDS: [RegExp, string][] = [
  [/\btravel(?:l?ing|s)?\b/, 'Travel'],
  [/\bhik(?:e|es|ing)\b/, 'Hiking'],
  [/\bcook(?:s|ing)?\b/, 'Cooking'],
  [/\bmusic\b|\bconcerts?\b/, 'Music'],
  [/\bart\b|\bpainting\b|\bmuseums?\b/, 'Art'],
  [/\byoga\b/, 'Yoga'],
  [/\breading\b|\bbooks?\b/, 'Reading'],
  [/\bwine\b/, 'Wine'],
  [/\bdogs?\b/, 'Dogs'],
  [/\bphotograph(?:y|er)\b/, 'Photography'],
  [/\bfitness\b|\bgym\b|\bwork(?:ing)? out\b/, 'Fitness'],
  [/\bmovies?\b|\bfilms?\b/, 'Movies'],
  [/\bdanc(?:e|ing)\b/, 'Dancing'],
  [/\bcoffee\b/, 'Coffee'],
  [/\bfoodie?\b|\bdining\b|\brestaurants?\b/, 'Food & dining'],
  [/\boutdoors?\b|\bnature\b/, 'Outdoors'],
  [/\brun(?:ning)?\b|\bjogging\b/, 'Running'],
  [/\bgolf\b/, 'Golf']
];

function normalizeCity(raw: string): string {
  const c = raw.trim().replace(/[.,;]+$/, '');
  return c
    .split(/\s+/)
    .map((w) => (w.length === 2 && w === w.toUpperCase() ? w : /^[A-Za-z]/.test(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ')
    .replace(/,\s*([a-z]{2})$/i, (_, st: string) => `, ${st.toUpperCase()}`);
}

export function makeIntro(p: UserProfile): string {
  if (p.customIntro && p.intro) return p.intro;
  const hasKids = p.kids && p.kids !== 'No kids';
  const bits: string[] = [];
  let s1 = 'Divorced' + (p.gender ? ` ${p.gender}` : '');
  if (p.age) s1 += `, ${p.age}`;
  if (p.city) s1 += `, in ${p.city}`;
  if (hasKids) s1 += ` — proud parent of ${p.kids!.toLowerCase()}`;
  else if (p.kids === 'No kids') s1 += ' — no kids';
  bits.push(s1 + '.');
  if (p.interests.length) bits.push(`Into ${p.interests.map((i) => i.toLowerCase()).join(', ')}.`);
  const prefs: string[] = [];
  if (p.prefLocal) prefs.push('local');
  if (p.prefSameAge) prefs.push('around the same age');
  if (p.prefKidsOk) prefs.push('with or without kids');
  bits.push(prefs.length ? `Hoping to meet someone ${prefs.join(', ')}, who understands the journey.` : 'Here for real connection with people who understand the journey.');
  if (!p.age && !p.city && !p.interests.length && !p.kids && !prefs.length) {
    return "Starting a new chapter and figuring out what's next — here for real connection with people who get it.";
  }
  return bits.join(' ');
}

/** Parse one chat message into profile updates. Returns the new profile and human-readable facts learned. */
export function absorbMessage(text: string, prev: UserProfile): { profile: UserProfile; facts: string[] } {
  const p: UserProfile = { ...prev, interests: [...prev.interests] };
  const facts: string[] = [];
  const t = ' ' + text.toLowerCase() + ' ';

  // Direct intro override: "change my intro to ..." / "my intro should say ..."
  const introM = text.match(/(?:change my intro to|my intro should say|set my intro to|my intro:)\s*(.+)/i);
  if (introM && introM[1].trim().length > 8) {
    p.intro = introM[1].trim();
    p.customIntro = true;
    facts.push('your custom intro');
    return { profile: p, facts };
  }

  const ageM = t.match(/\b(?:age\s*|i'?m\s+|i am\s+)(\d{2})\b/) || t.match(/\b(\d{2})\s*(?:years?\s*old|y\/?o|yrs?)\b/);
  if (ageM) {
    const a = parseInt(ageM[1], 10);
    if (a >= 21 && a <= 99 && p.age !== a) {
      p.age = a;
      facts.push(`age ${a}`);
    }
  }

  if (/\b(male|man|guy|dad|father)\b/.test(t) && !/\b(female|woman)\b/.test(t)) {
    if (p.gender !== 'man') {
      p.gender = 'man';
      facts.push('divorced man');
    }
  } else if (/\b(female|woman|lady|mom|mother)\b/.test(t)) {
    if (p.gender !== 'woman') {
      p.gender = 'woman';
      facts.push('divorced woman');
    }
  }

  const cityM = text.match(/\b(?:live in|living in|located in|i'?m in|i am in|based in|moved to)\s+([A-Za-z][A-Za-z .'-]*(?:,\s*[A-Za-z]{2})?)/i);
  if (cityM) {
    const c = normalizeCity(cityM[1]);
    if (c && c.toLowerCase() !== (p.city || '').toLowerCase()) {
      p.city = c;
      facts.push(`in ${c}`);
    }
  }

  if (/\b(?:no kids|don'?t have kids|without kids myself|no children)\b/.test(t) && !/with or without/.test(t)) {
    if (p.kids !== 'No kids') {
      p.kids = 'No kids';
      facts.push('no kids');
    }
  } else {
    const kidsM = t.match(/\b(\d+|one|two|three|four)\s*(kids?|children|boys?|girls?|sons?|daughters?)\b/);
    if (kidsM) {
      const agesM = t.match(/\b(\d{1,2})\s*(?:and|&)\s*(\d{1,2})\b/);
      let k = `${kidsM[1]} ${kidsM[2]}`;
      if (agesM && parseInt(agesM[1], 10) < 21 && parseInt(agesM[2], 10) < 21) k += ` (${agesM[1]} and ${agesM[2]})`;
      if (p.kids !== k) {
        p.kids = k;
        facts.push(k);
      }
    }
  }

  for (const [re, label] of INTEREST_WORDS) {
    if (re.test(t) && !p.interests.includes(label)) {
      p.interests.push(label);
      facts.push(`likes ${label.toLowerCase()}`);
    }
  }

  if (/\b(local|nearby|near me|close by|in my area)\b/.test(t) && !p.prefLocal) {
    p.prefLocal = true;
    facts.push('prefers someone local');
  }
  if (/(same age|similar age|around my age|my own age)/.test(t) && !p.prefSameAge) {
    p.prefSameAge = true;
    facts.push('around the same age');
  }
  if (/(with or without kids|kids (are )?(ok|okay|fine)|kids don'?t matter)/.test(t) && !p.prefKidsOk) {
    p.prefKidsOk = true;
    facts.push('open to partners with or without kids');
  }

  if (!p.customIntro) p.intro = makeIntro(p);
  return { profile: p, facts };
}

export function profileReady(p: UserProfile): boolean {
  const signals = [p.age, p.city, p.kids, p.interests.length > 0, p.prefLocal, p.prefSameAge, p.prefKidsOk].filter(Boolean).length;
  return signals >= 2;
}

export function matchmakerReply(facts: string[], p: UserProfile, firstReveal: boolean): string {
  if (!facts.length) {
    return "Tell me a little more — your age, your city, whether you have kids, what you enjoy, and what matters in a partner. I'll build your intro and save it to your profile as we go, and you can change anything just by telling me.";
  }
  const noted = `Noted — ${facts.join(', ')}. I've updated your intro and saved it to your profile.`;
  if (firstReveal) {
    return `${noted} Based on what you've told me, here are members I'd introduce you to — they're on the right, ranked by fit. Keep chatting to refine your profile and I'll re-rank them.`;
  }
  const missing = !p.age
    ? 'How old are you?'
    : !p.city
      ? 'What city are you in?'
      : !p.interests.length
        ? 'What do you enjoy — hobbies, weekends, travel?'
        : 'Anything else that matters in a partner — pace, values, lifestyle?';
  return `${noted} ${missing}`;
}

export interface Intro {
  profile: Profile;
  pct: string;
  reason: string;
}

/** Score the member pool against the user's stated preferences. */
export function buildIntros(p: UserProfile, looking: string): Intro[] {
  let pool = PROFILES;
  if (looking === 'woman') pool = pool.filter((x) => x.gender === 'woman');
  else if (looking === 'man') pool = pool.filter((x) => x.gender === 'man');

  const scored = pool.map((x) => {
    let s = 0;
    const reasons: string[] = [];
    if (p.age) {
      const diff = Math.abs(x.age - p.age);
      s += Math.max(0, (p.prefSameAge ? 24 : 16) - diff);
      if (diff <= 6) reasons.push('close to your age');
    }
    const shared = x.interests.filter((i) => p.interests.some((mine) => i.toLowerCase().includes(mine.toLowerCase()) || mine.toLowerCase().includes(i.toLowerCase())));
    if (shared.length) {
      s += 12 * shared.length;
      reasons.push(`shares your love of ${shared.map((i) => i.toLowerCase()).join(' and ')}`);
    }
    const theyParent = /\bkid|mom |dad |parent|children\b/i.test(x.bio + ' ' + (x.children || ''));
    if (p.kids && p.kids !== 'No kids' && theyParent) {
      s += 10;
      reasons.push('also a parent');
    }
    if (p.prefKidsOk) s += 4;
    if (p.city && x.location.toLowerCase().includes(p.city.split(',')[0].toLowerCase())) {
      s += 15;
      reasons.push('right in your area');
    }
    const pct = Math.min(96, 62 + s);
    const reason = reasons.length ? reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1) + (reasons.length > 1 ? `, and ${reasons.slice(1).join(', ')}` : '') + '.' : 'A thoughtful match on pace and life stage.';
    return { profile: x, pct: `${pct}% fit`, reason, score: s };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ profile, pct, reason }) => ({ profile, pct, reason }));
}
