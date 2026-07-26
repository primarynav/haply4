import { PROFILES, type Profile } from './data';

export type Seeking = 'women' | 'men' | 'anyone';
export type AskKey = 'age' | 'city' | 'seeking' | 'kids' | 'interests' | null;

/** The member's matchmaking profile, built up conversationally and saved to their account. */
export interface UserProfile {
  age?: number;
  gender?: 'man' | 'woman';
  /** Who they want to be introduced to. Applied as a HARD filter — never a preference. */
  seeking?: Seeking;
  city?: string;
  kids?: string;
  interests: string[];
  prefLocal?: boolean;
  prefSameAge?: boolean;
  prefKidsOk?: boolean;
  intro?: string;
  customIntro?: boolean;
  /** What the matchmaker asked last, so a bare reply like "chicago" is understood. */
  lastAsked?: AskKey;
}

export const emptyProfile = (): UserProfile => ({ interests: [] });

const FEMALE = /\b(women|woman|female|females|ladies|lady)\b/i;
const MALE = /\b(men|man|male|males|guys|guy|gentlemen|gentleman)\b/i;

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
  [/\bmovies?\b|\bfilms?\b|\bcinema\b/, 'Movies'],
  [/\bdanc(?:e|ing)\b/, 'Dancing'],
  [/\bcoffee\b/, 'Coffee'],
  [/\bfoodie?\b|\bdining\b|\brestaurants?\b/, 'Food & dining'],
  [/\boutdoors?\b|\bnature\b/, 'Outdoors'],
  [/\brun(?:ning)?\b|\bjogging\b/, 'Running'],
  [/\bgolf\b/, 'Golf'],
  [/\bbeach\b/, 'Beach days'],
  [/\bcamping\b/, 'Camping']
];

// Bare city mentions ("chicago") are common, so match well-known metros directly.
const CITIES = [
  'Buffalo Grove', 'San Francisco', 'Los Angeles', 'New York', 'San Diego', 'Salt Lake City', 'Kansas City',
  'Las Vegas', 'San Antonio', 'San Jose', 'Fort Worth', 'Colorado Springs', 'Virginia Beach', 'Long Beach',
  'Seattle', 'Chicago', 'Austin', 'Denver', 'Portland', 'Boston', 'Atlanta', 'Dallas', 'Houston', 'Phoenix',
  'Philadelphia', 'Miami', 'Minneapolis', 'Detroit', 'Nashville', 'Charlotte', 'Baltimore', 'Milwaukee',
  'Sacramento', 'Tampa', 'Orlando', 'Pittsburgh', 'Cincinnati', 'Cleveland', 'Columbus', 'Indianapolis',
  'Raleigh', 'Richmond', 'Tucson', 'Albuquerque', 'Omaha', 'Oakland', 'Tulsa', 'Memphis', 'Louisville',
  'Brooklyn', 'Queens', 'Naperville', 'Evanston', 'Schaumburg', 'Arlington', 'Alexandria', 'Bellevue'
];

function titleCase(raw: string): string {
  return raw
    .trim()
    .replace(/[.,;!?]+$/, '')
    .split(/\s+/)
    .map((w) => (w.length === 2 && /^[A-Za-z]{2}$/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}

function parseSeeking(text: string): Seeking | undefined {
  const t = text.toLowerCase();
  // "looking for women", "prefer a woman", "match me with men", "show me women"
  const intent = t.match(
    /(?:looking for|look for|interested in|prefer|prefers|match me with|introduce me to|show me|meet|date|dating|seeking|want|open to)\s+(?:only\s+)?(?:a\s+|an\s+|some\s+)?(?:divorced\s+)?(women|woman|female|females|ladies|lady|men|man|male|males|guys|guy|gentlemen|anyone|any gender|both|either|everyone)/
  );
  // "women only", "men only"
  const only = t.match(/\b(women|woman|men|man|females|males)\s+only\b/);
  const token = intent?.[1] || only?.[1];
  if (!token) return undefined;
  if (/anyone|any gender|both|either|everyone/.test(token)) return 'anyone';
  if (FEMALE.test(token)) return 'women';
  if (MALE.test(token)) return 'men';
  return undefined;
}

function parseOwnGender(text: string): 'man' | 'woman' | undefined {
  // Only explicit self-description, so "looking for women" never sets the member's own gender.
  const m =
    text.match(/\b(?:i am|i'?m|im)\s+(?:a\s+|an\s+)?(?:\d{2}\s*(?:years?|yrs?)?\s*(?:old)?\s*)?(?:newly\s+)?(?:divorced\s+|separated\s+|single\s+)?(man|male|woman|female|guy|lady|dad|mom|father|mother)\b/i) ||
    text.match(/\b(?:as a|being a|i'?m a)\s+(man|male|woman|female|dad|mom)\b/i) ||
    text.match(/\b(?:divorced|separated|single)\s+(man|male|woman|female|dad|mom|father|mother)\b/i);
  if (!m) return undefined;
  return /woman|female|lady|mom|mother/i.test(m[1]) ? 'woman' : 'man';
}

function parseCity(text: string, lastAsked: AskKey): string | undefined {
  const explicit = text.match(/(?:live in|living in|located in|i'?m in|i am in|based in|moved to|i'?m from|from)\s+([A-Za-z][A-Za-z .'-]{1,40}(?:,\s*[A-Za-z]{2})?)/i);
  if (explicit) return titleCase(explicit[1]);
  const cityState = text.match(/\b([A-Za-z][A-Za-z.'-]+(?:\s+[A-Za-z][A-Za-z.'-]+)*),\s*([A-Za-z]{2})\b/);
  if (cityState) return `${titleCase(cityState[1])}, ${cityState[2].toUpperCase()}`;
  for (const c of CITIES) {
    if (new RegExp(`\\b${c.replace(/ /g, '\\s+')}\\b`, 'i').test(text)) return c;
  }
  // The matchmaker just asked for a city, so treat a short bare reply as the answer.
  if (lastAsked === 'city') {
    const bare = text.trim().replace(/[.!?]+$/, '');
    if (bare.length >= 3 && bare.split(/\s+/).length <= 4 && !/\d/.test(bare)) return titleCase(bare);
  }
  return undefined;
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
  if (!p.age && !p.city && !p.interests.length && !p.kids && !prefs.length && !p.seeking) {
    return "Starting a new chapter and figuring out what's next — here for real connection with people who get it.";
  }
  return bits.join(' ');
}

export interface Absorbed {
  profile: UserProfile;
  /** Newly learned facts, phrased for the reply. */
  facts: string[];
  /** Facts the member restated that were already on file. */
  restated: string[];
}

/** Parse one chat message into profile updates. */
export function absorbMessage(text: string, prev: UserProfile): Absorbed {
  const p: UserProfile = { ...prev, interests: [...prev.interests] };
  const facts: string[] = [];
  const restated: string[] = [];
  const lastAsked = prev.lastAsked ?? null;

  const introM = text.match(/(?:change my intro to|my intro should say|set my intro to|rewrite my intro to|my intro:)\s*(.+)/i);
  if (introM && introM[1].trim().length > 8) {
    p.intro = introM[1].trim();
    p.customIntro = true;
    p.lastAsked = null;
    return { profile: p, facts: ['your custom intro'], restated };
  }

  const seeking = parseSeeking(text);
  if (seeking) {
    if (p.seeking === seeking) restated.push(`you're looking for ${seeking === 'anyone' ? 'anyone' : seeking}`);
    else {
      p.seeking = seeking;
      facts.push(seeking === 'anyone' ? 'open to anyone' : `looking for ${seeking}`);
    }
  }

  const gender = parseOwnGender(text);
  if (gender) {
    if (p.gender === gender) restated.push(`you're a divorced ${gender}`);
    else {
      p.gender = gender;
      facts.push(`divorced ${gender}`);
    }
  }

  const ageM =
    text.match(/\b(?:age\s*|i'?m\s+|i am\s+|im\s+)(\d{2})\b/i) ||
    text.match(/\b(\d{2})\s*(?:years?\s*old|y\/?o|yrs?)\b/i) ||
    (lastAsked === 'age' ? text.match(/^\s*(\d{2})\s*$/) : null);
  if (ageM) {
    const a = parseInt(ageM[1], 10);
    if (a >= 21 && a <= 99) {
      if (p.age === a) restated.push(`you're ${a}`);
      else {
        p.age = a;
        facts.push(`age ${a}`);
      }
    }
  }

  const city = parseCity(text, lastAsked);
  if (city) {
    if ((p.city || '').toLowerCase() === city.toLowerCase()) restated.push(`you're in ${city}`);
    else {
      p.city = city;
      facts.push(`in ${city}`);
    }
  }

  if (/\b(?:no kids|don'?t have kids|without kids myself|no children|childless)\b/i.test(text) && !/with or without/i.test(text)) {
    if (p.kids === 'No kids') restated.push('you have no kids');
    else {
      p.kids = 'No kids';
      facts.push('no kids');
    }
  } else {
    const kidsM = text.match(/\b(\d+|one|two|three|four|five)\s*(kids?|children|boys?|girls?|sons?|daughters?)\b/i);
    if (kidsM) {
      const agesM = text.match(/\b(\d{1,2})\s*(?:and|&|,)\s*(\d{1,2})\b/);
      let k = `${kidsM[1]} ${kidsM[2].toLowerCase()}`;
      if (agesM && parseInt(agesM[1], 10) < 21 && parseInt(agesM[2], 10) < 21) k += ` (${agesM[1]} and ${agesM[2]})`;
      if (p.kids === k) restated.push(`you have ${k}`);
      else {
        p.kids = k;
        facts.push(k);
      }
    }
  }

  for (const [re, label] of INTEREST_WORDS) {
    if (re.test(text) && !p.interests.includes(label)) {
      p.interests.push(label);
      facts.push(`likes ${label.toLowerCase()}`);
    }
  }

  if (/\b(local|nearby|near me|close by|in my area|same city)\b/i.test(text) && !p.prefLocal) {
    p.prefLocal = true;
    facts.push('prefers someone local');
  }
  if (/(same age|similar age|around my age|my own age|close to my age)/i.test(text) && !p.prefSameAge) {
    p.prefSameAge = true;
    facts.push('around the same age');
  }
  if (/(with or without kids|kids (?:are )?(?:ok|okay|fine|welcome)|likes kids|loves kids|good with kids|has kids|their own kids|kids don'?t matter)/i.test(text) && !p.prefKidsOk) {
    p.prefKidsOk = true;
    facts.push('open to partners with or without kids');
  }

  if (!p.customIntro) p.intro = makeIntro(p);
  return { profile: p, facts, restated };
}

/** Enough on file to make introductions worth showing. */
export function profileReady(p: UserProfile): boolean {
  const signals = [p.age, p.city, p.kids, p.seeking, p.interests.length > 0, p.prefLocal, p.prefSameAge, p.prefKidsOk].filter(Boolean).length;
  return signals >= 2;
}

function nextQuestion(p: UserProfile): { q: string; key: AskKey } {
  if (!p.seeking) return { q: 'Who would you like me to introduce you to — women, men, or anyone?', key: 'seeking' };
  if (!p.age) return { q: 'How old are you?', key: 'age' };
  if (!p.city) return { q: 'What city are you in?', key: 'city' };
  if (!p.kids) return { q: 'Do you have kids?', key: 'kids' };
  if (!p.interests.length) return { q: 'What do you enjoy — hobbies, weekends, travel?', key: 'interests' };
  return { q: 'Anything else that matters in a partner — pace, values, lifestyle?', key: null };
}

export function matchmakerReply(a: Absorbed, firstReveal: boolean): { text: string; lastAsked: AskKey } {
  const p = a.profile;
  const { q, key } = nextQuestion(p);

  if (!a.facts.length && !a.restated.length) {
    return {
      text: `I didn't quite catch that. ${q} You can also tell me what matters in a partner, and I'll save it to your profile.`,
      lastAsked: key
    };
  }

  const parts: string[] = [];
  if (a.facts.length) parts.push(`Noted — ${a.facts.join(', ')}.`);
  if (a.restated.length) parts.push(`${a.facts.length ? 'And yes' : 'Already have that'} — ${a.restated.join(', ')}.`);
  if (a.facts.length) parts.push("I've updated your intro and saved it to your profile.");

  // Confirm the hard filter explicitly so members can trust it.
  if (a.facts.some((f) => f.startsWith('looking for'))) {
    parts.push(`From here I'll only introduce you to ${p.seeking}.`);
  }

  if (firstReveal) {
    parts.push("Here are the members I'd introduce you to — on the right, ranked by fit. Keep chatting and I'll re-rank them.");
    return { text: parts.join(' '), lastAsked: null };
  }
  parts.push(q);
  return { text: parts.join(' '), lastAsked: key };
}

export interface Intro {
  profile: Profile;
  pct: string;
  reason: string;
}

/**
 * Rank the member pool. `seeking` is a hard filter: someone who asked for women
 * is never shown men.
 */
export function buildIntros(p: UserProfile, fallbackLooking?: string): Intro[] {
  const seeking: Seeking | undefined =
    p.seeking ?? (fallbackLooking === 'woman' ? 'women' : fallbackLooking === 'man' ? 'men' : fallbackLooking === 'any' ? 'anyone' : undefined);

  let pool = PROFILES;
  if (seeking === 'women') pool = pool.filter((x) => x.gender === 'woman');
  else if (seeking === 'men') pool = pool.filter((x) => x.gender === 'man');

  const memberHasKids = !!p.kids && p.kids !== 'No kids';

  const scored = pool.map((x) => {
    let s = 0;
    const reasons: string[] = [];

    if (p.age) {
      const diff = Math.abs(x.age - p.age);
      s += Math.max(0, (p.prefSameAge ? 26 : 18) - diff);
      if (diff <= 6) reasons.push('close to your age');
    }

    const shared = x.interests.filter((i) => p.interests.some((mine) => i.toLowerCase().includes(mine.toLowerCase()) || mine.toLowerCase().includes(i.toLowerCase())));
    if (shared.length) {
      s += 12 * shared.length;
      reasons.push(`shares your love of ${shared.map((i) => i.toLowerCase()).join(' and ')}`);
    }

    // "No kids" and "No children" both contain the words we look for, so strip
    // negated mentions first — otherwise every child-free member reads as a parent.
    const parentText = `${x.bio} ${x.children ?? ''} ${x.interests.join(' ')}`
      .replace(/\b(?:no|none|zero|without|child-?free)\b[^.!?]*/gi, ' ');
    const theyAreParent = /\bkids?\b|\bmom\b|\bdad\b|\bparent|children/i.test(parentText);
    if (memberHasKids && theyAreParent) {
      s += 14;
      reasons.push('also a parent, so kids are no surprise');
    } else if (p.prefKidsOk && theyAreParent) {
      s += 6;
      reasons.push('a parent, which you said works for you');
    }

    if (p.city) {
      const cityName = p.city.split(',')[0].trim().toLowerCase();
      if (cityName && x.location.toLowerCase().includes(cityName)) {
        s += 20;
        reasons.push('right in your area');
      } else if (p.prefLocal) {
        s -= 6;
      }
    }

    const pct = Math.max(60, Math.min(96, 62 + s));
    const reason = reasons.length
      ? reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1) + (reasons.length > 1 ? `, and ${reasons.slice(1).join(', ')}` : '') + '.'
      : 'A thoughtful match on pace and life stage.';
    return { profile: x, pct: `${pct}% fit`, reason, score: s };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ profile, pct, reason }) => ({ profile, pct, reason }));
}
