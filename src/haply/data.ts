import { GENERATED_PROFILES } from './generatedProfiles';
import { COMMUNITY_POSTS } from './communityPosts';
import type { CustodySchedule, KidsAgeBand, WantsMoreKids } from './journey';

export interface Profile {
  id: number;
  name: string;
  gender: 'man' | 'woman';
  age: number;
  location: string;
  /** Approximate city coordinates, so Discover can filter by real distance. */
  lat?: number;
  lng?: number;
  image: string;
  bio: string;
  divorceYear: number;
  interests: string[];
  occupation?: string;
  education?: string;
  height?: string;
  children?: string;
  smoking?: string;
  drinking?: string;
  lookingFor?: string;
  /**
   * True only for sample profiles shipped with the app so Discover isn't empty
   * before there is a member base. These are not real people and have never been
   * through verification, so the UI must label them as examples and must never
   * render a verification badge for them.
   */
  demo?: boolean;
  /**
   * Whether this member actually completed divorce verification. Only ever true
   * for a real account whose submission was approved — never for demo profiles.
   * Rendering a badge off anything other than this field fabricates a trust
   * signal members are invited to rely on.
   */
  divorceVerified?: boolean;
  /** Launch metro slug — see launchMarkets.ts. */
  metro?: string;
  /** Co-parenting facts, the compatibility axis this audience actually filters on. */
  kidsAtHome?: boolean;
  kidsAgeBands?: KidsAgeBand[];
  custodySchedule?: CustodySchedule;
  wantsMoreKids?: WantsMoreKids;
}

export interface Post {
  id: number;
  name: string;
  /** Set only for posts by a real signed-in account — the seeded community posts have none. */
  userId?: string;
  cat: string;
  time: string;
  title: string;
  body: string;
  likes: number;
  comments: number;
}

export interface CityGroup {
  city: string;
  vibe: string;
}

export interface HaplyEvent {
  name: string;
  sub: string;
  icon: string;
}

export interface HeroSlide {
  /** File in public/images. Swap the file (same name) or point at a new one. */
  src: string;
  /** Screen-reader description of the photo. Must describe the real image. */
  alt: string;
  /** Short label on the slide's dot control. */
  label: string;
  /** Headline on the floating card while this slide is showing. */
  caption: string;
  sub: string;
}

// Hero rotation. Captions describe what each photo actually shows, so when you
// replace a photo, update its alt/label/caption in the same entry.
// Target activities for the 30–60 audience: a hike, a movie night, a café date.
// Drop replacements in public/images and edit `src` — nothing else to change.
export const HERO_SLIDES: HeroSlide[] = [
  {
    src: '/images/hero-1.jpg',
    alt: 'Two people talking and smiling over coffee at a café window',
    label: 'Coffee',
    caption: 'Coffee that turns into three hours',
    sub: 'Dating Again · a community favorite'
  },
  {
    src: '/images/hero-2.jpg',
    alt: 'A couple laughing together outdoors',
    label: 'Laughing',
    caption: 'Someone who laughs at the same things',
    sub: 'Community · your people'
  },
  {
    src: '/images/hero-3.jpg',
    alt: 'A couple walking together at golden hour',
    label: 'Walks',
    caption: 'Long walks, no explaining needed',
    sub: 'City groups · real meetups'
  }
];

// The six hand-written members stay first — CHAT_REPLIES and LIKES_BACK key off
// their ids — with the generated test pool appended behind them.
const SEED_PROFILES: Profile[] = [
  { id: 1, name: 'Emily', gender: 'woman', age: 42, location: 'Seattle, WA', lat: 47.61, lng: -122.33, image: 'https://images.unsplash.com/photo-1690444963408-9573a17a8058?w=1080&q=80&fit=crop', bio: 'Divorced mom of two, yoga instructor, loves hiking and good coffee. Looking for genuine connection and someone who values mindfulness and outdoor adventures.', divorceYear: 2021, interests: ['Yoga', 'Hiking', 'Photography'], occupation: 'Yoga Instructor', education: "Bachelor's in Health Sciences", height: '5\'6"', children: '2 (ages 8 and 10)', lookingFor: 'A genuine connection with someone who understands the journey of starting over and values family, wellness, and authentic communication.', smoking: 'No', drinking: 'Socially' },
  { id: 2, name: 'Michael', gender: 'man', age: 38, location: 'Portland, OR', lat: 45.52, lng: -122.68, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80&fit=crop', bio: 'Recently divorced dad, software engineer, enjoys cooking and weekend adventures. Ready for a fresh start with someone who appreciates good food and spontaneous road trips.', divorceYear: 2022, interests: ['Cooking', 'Technology', 'Travel'], occupation: 'Software Engineer', education: "Master's in Computer Science", height: '6\'0"', children: '1 (age 6)', lookingFor: "Looking for a partner who enjoys both cozy nights in and outdoor adventures. Someone who values family and isn't afraid of a little spontaneity.", smoking: 'No', drinking: 'Socially' },
  { id: 3, name: 'Sarah', gender: 'woman', age: 35, location: 'San Francisco, CA', lat: 37.77, lng: -122.42, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1080&q=80&fit=crop', bio: 'Artist and teacher who believes in second chances. Love painting, museums, and weekend farmers markets. Looking for someone who appreciates creativity and meaningful conversations.', divorceYear: 2020, interests: ['Art', 'Teaching', 'Museums'], occupation: 'Art Teacher', education: 'MFA in Fine Arts', height: '5\'7"', children: 'No children', lookingFor: "Seeking a partner who appreciates art, culture, and deep conversations. Someone who sees beauty in the everyday and isn't afraid to try new things.", smoking: 'No', drinking: 'Rarely' },
  { id: 4, name: 'David', gender: 'man', age: 44, location: 'Austin, TX', lat: 30.27, lng: -97.74, image: 'https://images.unsplash.com/photo-1622812947502-0a643f17387e?w=1080&q=80&fit=crop', bio: 'Musician by night, accountant by day. Two kids who are my world. Looking for someone who gets it.', divorceYear: 2019, interests: ['Music', 'Parenting', 'Live Shows'], smoking: 'Occasionally', drinking: 'Regularly' },
  { id: 5, name: 'Jessica', gender: 'woman', age: 39, location: 'Denver, CO', lat: 39.74, lng: -104.99, image: 'https://images.unsplash.com/photo-1650484094047-bbbf2ca7c261?w=1080&q=80&fit=crop', bio: 'Nurse, adventurer, dog mom. Divorced and ready to write a new chapter filled with laughter and love.', divorceYear: 2021, interests: ['Healthcare', 'Dogs', 'Adventure'], smoking: 'No', drinking: 'Socially' },
  { id: 6, name: 'James', gender: 'man', age: 41, location: 'Chicago, IL', lat: 41.88, lng: -87.63, image: 'https://images.unsplash.com/photo-1638016329956-1127c6e4c96f?w=1080&q=80&fit=crop', bio: 'Chef and single dad who believes the best meals are shared. Looking for someone to create new memories with.', divorceYear: 2020, interests: ['Cooking', 'Wine', 'Family Time'], smoking: 'No', drinking: 'Socially' }
];

/**
 * Sample profiles ship only when VITE_DEMO_PROFILES=1.
 *
 * They exist to demo the UI, not to pad a member base. Shown to real members
 * they are worse than an empty app: people spot invented profiles quickly, and
 * a community product that opens with 2,000 strangers who never reply has
 * spent its credibility before anyone has posted. Launch metros start empty and
 * fill with real people, and Discover says so plainly.
 *
 * Marked demo in one place rather than on 2,000 literals so a new batch cannot
 * forget — the UI keys "Example profile" labelling and badge suppression off it.
 */
export const DEMO_PROFILES_ENABLED = import.meta.env.VITE_DEMO_PROFILES === '1';

export const PROFILES: Profile[] = DEMO_PROFILES_ENABLED
  ? [...SEED_PROFILES, ...GENERATED_PROFILES].map((p) => ({ ...p, demo: true, divorceVerified: false }))
  : [];

export const LIKES_BACK = [2, 5];

export const CHAT_REPLIES: Record<number, string[]> = {
  1: ['That sounds lovely! I just got back from a morning yoga class by the water.', 'Would you want to grab coffee near Pike Place this weekend?'],
  2: ['Hey! Great to finally chat. Road trip season is coming up!', 'Any favorite weekend spots around Portland?'],
  3: ["I'd love that! I'm prepping a new gallery piece this week.", "Have you seen the new exhibit at SFMOMA? It's wonderful."],
  5: ['Hi! So glad we matched. My dog already approves of you 🐶', 'Do you hike? I know some great trails outside Denver.']
};

export const POSTS: Post[] = COMMUNITY_POSTS;

export const CATS = ['All Topics', 'Divorce Support', 'Co-Parenting', 'Dating Again', 'Success Stories', 'Self-Care'];

export const GROUPS: CityGroup[] = [
  { city: 'Seattle', vibe: 'Coffee walks & waterfront meetups' },
  { city: 'Austin', vibe: 'Live music & taco nights' },
  { city: 'Chicago', vibe: 'Supper clubs & lakefront walks' },
  { city: 'Portland', vibe: 'Group hikes & book clubs' },
  { city: 'Denver', vibe: 'Trail days & weekend brunches' },
  { city: 'San Francisco', vibe: 'Coastal walks & wine nights' }
];

export const EVENTS: HaplyEvent[] = [
  { name: 'Dinner clubs', sub: 'Meet over a good meal', icon: 'restaurant' },
  { name: 'Group hikes', sub: 'Fresh air with your people', icon: 'hiking' },
  { name: 'Book clubs', sub: 'New chapters, literally', icon: 'menu_book' }
];

/** Lightweight respectful-language screen — placeholder for server-side moderation bots. */
const FLAGGED = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'whore', 'slut', 'bastard', 'retard', 'faggot', 'kill yourself', 'kys', 'nazi', 'rape'];
export function violatesLanguagePolicy(text: string): boolean {
  const words = text.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(Boolean);
  const t = ' ' + words.join(' ') + ' ';
  return FLAGGED.some((w) => (w.includes(' ') ? t.includes(' ' + w + ' ') : words.some((word) => word === w || word.startsWith(w))));
}

export const INVITE_LINK = 'https://haply.com/invite/second-chapter';
