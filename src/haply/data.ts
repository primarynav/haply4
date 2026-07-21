export interface Profile {
  id: number;
  name: string;
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
  members: string;
  events: number;
}

export interface HaplyEvent {
  name: string;
  when: string;
  icon: string;
  going: number;
}

export const PROFILES: Profile[] = [
  { id: 1, name: 'Emily', age: 42, location: 'Seattle, WA', image: 'https://images.unsplash.com/photo-1690444963408-9573a17a8058?w=1080&q=80&fit=crop', bio: 'Divorced mom of two, yoga instructor, loves hiking and good coffee. Looking for genuine connection and someone who values mindfulness and outdoor adventures.', divorceYear: 2021, interests: ['Yoga', 'Hiking', 'Photography'], occupation: 'Yoga Instructor', education: "Bachelor's in Health Sciences", height: '5\'6"', children: '2 (ages 8 and 10)', lookingFor: 'A genuine connection with someone who understands the journey of starting over and values family, wellness, and authentic communication.' },
  { id: 2, name: 'Michael', age: 38, location: 'Portland, OR', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80&fit=crop', bio: 'Recently divorced dad, software engineer, enjoys cooking and weekend adventures. Ready for a fresh start with someone who appreciates good food and spontaneous road trips.', divorceYear: 2022, interests: ['Cooking', 'Technology', 'Travel'], occupation: 'Software Engineer', education: "Master's in Computer Science", height: '6\'0"', children: '1 (age 6)', lookingFor: "Looking for a partner who enjoys both cozy nights in and outdoor adventures. Someone who values family and isn't afraid of a little spontaneity." },
  { id: 3, name: 'Sarah', age: 35, location: 'San Francisco, CA', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1080&q=80&fit=crop', bio: 'Artist and teacher who believes in second chances. Love painting, museums, and weekend farmers markets. Looking for someone who appreciates creativity and meaningful conversations.', divorceYear: 2020, interests: ['Art', 'Teaching', 'Museums'], occupation: 'Art Teacher', education: 'MFA in Fine Arts', height: '5\'7"', children: 'No children', lookingFor: "Seeking a partner who appreciates art, culture, and deep conversations. Someone who sees beauty in the everyday and isn't afraid to try new things." },
  { id: 4, name: 'David', age: 44, location: 'Austin, TX', image: 'https://images.unsplash.com/photo-1622812947502-0a643f17387e?w=1080&q=80&fit=crop', bio: 'Musician by night, accountant by day. Two kids who are my world. Looking for someone who gets it.', divorceYear: 2019, interests: ['Music', 'Parenting', 'Live Shows'] },
  { id: 5, name: 'Jessica', age: 39, location: 'Denver, CO', image: 'https://images.unsplash.com/photo-1650484094047-bbbf2ca7c261?w=1080&q=80&fit=crop', bio: 'Nurse, adventurer, dog mom. Divorced and ready to write a new chapter filled with laughter and love.', divorceYear: 2021, interests: ['Healthcare', 'Dogs', 'Adventure'] },
  { id: 6, name: 'James', age: 41, location: 'Chicago, IL', image: 'https://images.unsplash.com/photo-1638016329956-1127c6e4c96f?w=1080&q=80&fit=crop', bio: 'Chef and single dad who believes the best meals are shared. Looking for someone to create new memories with.', divorceYear: 2020, interests: ['Cooking', 'Wine', 'Family Time'] }
];

export const LIKES_BACK = [2, 5];

export const AI_REPLIES = [
  "That's wonderful — family values matter here. Tell me about your parenting situation, and how you'd want a future partner to fit into it.",
  'Got it. One more thing: what does a good week look like for you? Lifestyle fit is where most matches succeed or fail.',
  "I have a clear picture now. Here are two verified members I'd genuinely introduce you to — both aligned on family, pace, and lifestyle."
];

export const CHAT_REPLIES: Record<number, string[]> = {
  1: ['That sounds lovely! I just got back from a morning yoga class by the water.', 'Would you want to grab coffee near Pike Place this weekend?'],
  2: ['Hey! Great to finally chat. Road trip season is coming up!', 'Any favorite weekend spots around Portland?'],
  3: ["I'd love that! I'm prepping a new gallery piece this week.", "Have you seen the new exhibit at SFMOMA? It's wonderful."],
  5: ['Hi! So glad we matched. My dog already approves of you 🐶', 'Do you hike? I know some great trails outside Denver.']
};

export const POSTS: Post[] = [
  { id: 1, name: 'Jennifer M.', cat: 'Success Stories', time: '2 hours ago', title: 'One year on Haply — engaged last weekend! 💍', body: "I almost deleted the app three times. So glad I didn't. To everyone still healing: take your time, but don't close the door.", likes: 128, comments: 34 },
  { id: 2, name: 'David R.', cat: 'Co-Parenting', time: '5 hours ago', title: 'How do you introduce a new partner to your kids?', body: "Been seeing someone wonderful for 4 months. My kids (7 and 10) don't know yet. Would love to hear how others handled the timing.", likes: 56, comments: 41 },
  { id: 3, name: 'Amanda S.', cat: 'Divorce Support', time: '1 day ago', title: 'Finalized yesterday. Feeling everything at once.', body: 'Relief, grief, freedom, fear — all in the same hour. Is that normal? Tell me it gets easier.', likes: 203, comments: 87 },
  { id: 4, name: 'Marcus T.', cat: 'Dating Again', time: '2 days ago', title: 'First date in 12 years — it went great!', body: "I was so nervous I rehearsed saying hello in the car. She was nervous too. We laughed about it for two hours. There's hope, people.", likes: 174, comments: 52 }
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
  { city: 'Seattle', members: '2,406', events: 9 },
  { city: 'Austin', members: '3,014', events: 11 },
  { city: 'Chicago', members: '2,871', events: 8 },
  { city: 'Portland', members: '1,882', events: 7 },
  { city: 'Denver', members: '1,655', events: 6 },
  { city: 'San Francisco', members: '2,238', events: 9 }
];

export const EVENTS: HaplyEvent[] = [
  { name: 'Divorced & Dining', when: 'Seattle · Thu 7pm', icon: 'restaurant', going: 18 },
  { name: 'Trail Talk: Parents Hike', when: 'Denver · Sat 9am', icon: 'hiking', going: 24 },
  { name: 'New Chapter Book Club', when: 'Online · Wed 6pm', icon: 'menu_book', going: 41 }
];

export const AI_MATCH_INTROS: { id: number; pct: string; reason: string }[] = [
  { id: 2, pct: '94% fit', reason: 'Strong co-parenting values and a shared love of cooking and travel.' },
  { id: 1, pct: '91% fit', reason: 'Shares your focus on family, wellness, and outdoor time.' }
];

export const INVITE_LINK = 'https://haply.com/invite/second-chapter';
