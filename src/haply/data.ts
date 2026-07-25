export interface Profile {
  id: number;
  name: string;
  gender: 'man' | 'woman';
  age: number;
  location: string;
  image: string;
  bio: string;
  divorceYear: number;
  interests: string[];
  occupation?: string;
  education?: string;
  height?: string;
  children?: string;
  lookingFor?: string;
}

export interface Post {
  id: number;
  name: string;
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

export const PROFILES: Profile[] = [
  { id: 1, name: 'Emily', gender: 'woman', age: 42, location: 'Seattle, WA', image: 'https://images.unsplash.com/photo-1690444963408-9573a17a8058?w=1080&q=80&fit=crop', bio: 'Divorced mom of two, yoga instructor, loves hiking and good coffee. Looking for genuine connection and someone who values mindfulness and outdoor adventures.', divorceYear: 2021, interests: ['Yoga', 'Hiking', 'Photography'], occupation: 'Yoga Instructor', education: "Bachelor's in Health Sciences", height: '5\'6"', children: '2 (ages 8 and 10)', lookingFor: 'A genuine connection with someone who understands the journey of starting over and values family, wellness, and authentic communication.' },
  { id: 2, name: 'Michael', gender: 'man', age: 38, location: 'Portland, OR', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80&fit=crop', bio: 'Recently divorced dad, software engineer, enjoys cooking and weekend adventures. Ready for a fresh start with someone who appreciates good food and spontaneous road trips.', divorceYear: 2022, interests: ['Cooking', 'Technology', 'Travel'], occupation: 'Software Engineer', education: "Master's in Computer Science", height: '6\'0"', children: '1 (age 6)', lookingFor: "Looking for a partner who enjoys both cozy nights in and outdoor adventures. Someone who values family and isn't afraid of a little spontaneity." },
  { id: 3, name: 'Sarah', gender: 'woman', age: 35, location: 'San Francisco, CA', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1080&q=80&fit=crop', bio: 'Artist and teacher who believes in second chances. Love painting, museums, and weekend farmers markets. Looking for someone who appreciates creativity and meaningful conversations.', divorceYear: 2020, interests: ['Art', 'Teaching', 'Museums'], occupation: 'Art Teacher', education: 'MFA in Fine Arts', height: '5\'7"', children: 'No children', lookingFor: "Seeking a partner who appreciates art, culture, and deep conversations. Someone who sees beauty in the everyday and isn't afraid to try new things." },
  { id: 4, name: 'David', gender: 'man', age: 44, location: 'Austin, TX', image: 'https://images.unsplash.com/photo-1622812947502-0a643f17387e?w=1080&q=80&fit=crop', bio: 'Musician by night, accountant by day. Two kids who are my world. Looking for someone who gets it.', divorceYear: 2019, interests: ['Music', 'Parenting', 'Live Shows'] },
  { id: 5, name: 'Jessica', gender: 'woman', age: 39, location: 'Denver, CO', image: 'https://images.unsplash.com/photo-1650484094047-bbbf2ca7c261?w=1080&q=80&fit=crop', bio: 'Nurse, adventurer, dog mom. Divorced and ready to write a new chapter filled with laughter and love.', divorceYear: 2021, interests: ['Healthcare', 'Dogs', 'Adventure'] },
  { id: 6, name: 'James', gender: 'man', age: 41, location: 'Chicago, IL', image: 'https://images.unsplash.com/photo-1638016329956-1127c6e4c96f?w=1080&q=80&fit=crop', bio: 'Chef and single dad who believes the best meals are shared. Looking for someone to create new memories with.', divorceYear: 2020, interests: ['Cooking', 'Wine', 'Family Time'] }
];

export const LIKES_BACK = [2, 5];

export const CHAT_REPLIES: Record<number, string[]> = {
  1: ['That sounds lovely! I just got back from a morning yoga class by the water.', 'Would you want to grab coffee near Pike Place this weekend?'],
  2: ['Hey! Great to finally chat. Road trip season is coming up!', 'Any favorite weekend spots around Portland?'],
  3: ["I'd love that! I'm prepping a new gallery piece this week.", "Have you seen the new exhibit at SFMOMA? It's wonderful."],
  5: ['Hi! So glad we matched. My dog already approves of you 🐶', 'Do you hike? I know some great trails outside Denver.']
};

export const POSTS: Post[] = [
  { id: 1, name: 'Haply Team', cat: 'Divorce Support', time: 'Pinned', title: 'Welcome to Haply — introduce yourself', body: 'Tell the community a little about where you are in your journey. New here? Start with hello — someone will be glad you did.', likes: 0, comments: 0 },
  { id: 2, name: 'Haply Team', cat: 'Co-Parenting', time: 'Pinned', title: 'Co-parents: what is working for you?', body: 'Schedules, hand-offs, holidays — share what has made two-home parenting smoother for your family.', likes: 0, comments: 0 },
  { id: 3, name: 'Haply Team', cat: 'Dating Again', time: 'Pinned', title: 'What does "ready to date" feel like?', body: "There's no deadline. Share how you knew it was time — or ask the community how they knew.", likes: 0, comments: 0 },
  { id: 4, name: 'Haply Team', cat: 'Self-Care', time: 'Pinned', title: 'One small win this week', body: 'Big or small, share a win. This thread is for cheering each other on.', likes: 0, comments: 0 }
];

export const CATS = ['All Topics', 'Divorce Support', 'Co-Parenting', 'Dating Again', 'Success Stories', 'Self-Care'];

export const AV_COLORS: [string, string][] = [
  ['#FFE4E6', '#be123c'],
  ['#E0E7FF', '#4338ca'],
  ['#DCFCE7', '#15803d'],
  ['#FEF3C7', '#b45309'],
  ['#F3E8FF', '#7e22ce']
];

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
