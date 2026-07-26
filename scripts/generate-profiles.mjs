// Generates a large synthetic member pool for testing the matchmaker's filters.
// Deterministic: same seed always produces the same dataset.
//   node scripts/generate-profiles.mjs > src/haply/generatedProfiles.ts
import { writeFileSync } from 'node:fs';

const SEED = 20260726;
const PER_GENDER = 1000;
const THIS_YEAR = 2026;

// mulberry32 — small deterministic PRNG so the dataset is reproducible.
let state = SEED;
const rnd = () => {
  state |= 0;
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const chance = (p) => rnd() < p;
const sample = (arr, n) => {
  const copy = arr.slice();
  const out = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rnd() * copy.length), 1)[0]);
  return out;
};

// First names grouped by birth cohort so a 66-year-old isn't named Madison.
const NAMES = {
  woman: {
    20: ['Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Abigail', 'Chloe', 'Grace', 'Zoe', 'Lily', 'Aaliyah', 'Camila'],
    30: ['Ashley', 'Jessica', 'Samantha', 'Brittany', 'Amanda', 'Taylor', 'Megan', 'Rachel', 'Lauren', 'Hannah', 'Alexis', 'Kayla', 'Danielle', 'Nicole', 'Stephanie', 'Jasmine'],
    40: ['Jennifer', 'Melissa', 'Heather', 'Amy', 'Michelle', 'Kimberly', 'Christina', 'Sara', 'Erin', 'Katie', 'Angela', 'Tiffany', 'Vanessa', 'Rebecca', 'Maria', 'April'],
    50: ['Lisa', 'Karen', 'Susan', 'Donna', 'Tracy', 'Wendy', 'Julie', 'Laura', 'Dawn', 'Stacy', 'Robin', 'Denise', 'Rhonda', 'Monica', 'Yolanda', 'Teresa'],
    60: ['Linda', 'Deborah', 'Barbara', 'Patricia', 'Cynthia', 'Kathleen', 'Sandra', 'Nancy', 'Carol', 'Janet', 'Diane', 'Sharon', 'Cheryl', 'Brenda', 'Gail', 'Rosa']
  },
  man: {
    20: ['Noah', 'Liam', 'Mason', 'Ethan', 'Elijah', 'Logan', 'Caleb', 'Ryan', 'Owen', 'Isaiah', 'Diego', 'Jalen', 'Hunter', 'Cooper', 'Xavier', 'Levi'],
    30: ['Tyler', 'Brandon', 'Justin', 'Kyle', 'Zachary', 'Austin', 'Jordan', 'Dylan', 'Cody', 'Nathan', 'Sean', 'Derek', 'Trevor', 'Marcus', 'Devin', 'Andre'],
    40: ['Christopher', 'Matthew', 'Joshua', 'Daniel', 'Andrew', 'Jason', 'Aaron', 'Adam', 'Eric', 'Jeremy', 'Brian', 'Nicholas', 'Patrick', 'Travis', 'Luis', 'Omar'],
    50: ['Michael', 'David', 'John', 'Robert', 'Steven', 'Kevin', 'Mark', 'Scott', 'Todd', 'Gregory', 'Douglas', 'Jeffrey', 'Timothy', 'Craig', 'Dean', 'Carlos'],
    60: ['Richard', 'James', 'Thomas', 'William', 'Gary', 'Ronald', 'Dennis', 'Larry', 'Wayne', 'Terry', 'Randy', 'Glenn', 'Bruce', 'Alan', 'Keith', 'Miguel']
  }
};
const cohort = (age) => (age < 30 ? 20 : age < 40 ? 30 : age < 50 ? 40 : age < 60 ? 50 : 60);

// Real US metros, spread across every region so city filtering is testable.
const CITIES = [
  'New York, NY', 'Brooklyn, NY', 'Buffalo, NY', 'Rochester, NY', 'Los Angeles, CA', 'San Diego, CA',
  'San Francisco, CA', 'San Jose, CA', 'Sacramento, CA', 'Oakland, CA', 'Fresno, CA', 'Long Beach, CA',
  'Chicago, IL', 'Naperville, IL', 'Buffalo Grove, IL', 'Evanston, IL', 'Springfield, IL',
  'Houston, TX', 'Dallas, TX', 'Austin, TX', 'San Antonio, TX', 'Fort Worth, TX', 'Plano, TX', 'El Paso, TX',
  'Phoenix, AZ', 'Tucson, AZ', 'Scottsdale, AZ', 'Mesa, AZ',
  'Philadelphia, PA', 'Pittsburgh, PA', 'Allentown, PA',
  'Jacksonville, FL', 'Miami, FL', 'Tampa, FL', 'Orlando, FL', 'St. Petersburg, FL', 'Fort Lauderdale, FL',
  'Columbus, OH', 'Cleveland, OH', 'Cincinnati, OH', 'Toledo, OH',
  'Charlotte, NC', 'Raleigh, NC', 'Durham, NC', 'Greensboro, NC',
  'Indianapolis, IN', 'Fort Wayne, IN', 'Seattle, WA', 'Spokane, WA', 'Tacoma, WA', 'Bellevue, WA',
  'Denver, CO', 'Colorado Springs, CO', 'Boulder, CO', 'Fort Collins, CO',
  'Boston, MA', 'Worcester, MA', 'Cambridge, MA', 'Nashville, TN', 'Memphis, TN', 'Knoxville, TN',
  'Detroit, MI', 'Grand Rapids, MI', 'Ann Arbor, MI', 'Portland, OR', 'Eugene, OR', 'Salem, OR',
  'Las Vegas, NV', 'Reno, NV', 'Atlanta, GA', 'Savannah, GA', 'Augusta, GA',
  'Minneapolis, MN', 'St. Paul, MN', 'Rochester, MN', 'Kansas City, MO', 'St. Louis, MO', 'Springfield, MO',
  'Baltimore, MD', 'Silver Spring, MD', 'Milwaukee, WI', 'Madison, WI', 'Green Bay, WI',
  'Albuquerque, NM', 'Santa Fe, NM', 'Salt Lake City, UT', 'Provo, UT', 'Boise, ID',
  'Oklahoma City, OK', 'Tulsa, OK', 'Louisville, KY', 'Lexington, KY', 'New Orleans, LA', 'Baton Rouge, LA',
  'Richmond, VA', 'Virginia Beach, VA', 'Arlington, VA', 'Omaha, NE', 'Lincoln, NE',
  'Des Moines, IA', 'Little Rock, AR', 'Birmingham, AL', 'Huntsville, AL', 'Columbia, SC', 'Charleston, SC',
  'Hartford, CT', 'New Haven, CT', 'Providence, RI', 'Newark, NJ', 'Jersey City, NJ', 'Trenton, NJ',
  'Wilmington, DE', 'Manchester, NH', 'Burlington, VT', 'Portland, ME', 'Anchorage, AK', 'Honolulu, HI',
  'Billings, MT', 'Sioux Falls, SD', 'Fargo, ND', 'Cheyenne, WY', 'Charleston, WV', 'Jackson, MS'
];

// These labels are deliberately the same vocabulary matchmaker.ts parses out of
// member messages — otherwise shared-interest scoring can never match anything.
const INTERESTS = [
  'Travel', 'Hiking', 'Cooking', 'Music', 'Art', 'Yoga', 'Reading', 'Wine', 'Dogs', 'Photography',
  'Fitness', 'Movies', 'Dancing', 'Coffee', 'Food & dining', 'Outdoors', 'Running', 'Golf',
  'Beach days', 'Camping'
];
// Extra colour, still substring-compatible with the labels above where it matters.
const EXTRA_INTERESTS = [
  'Live music', 'Farmers markets', 'Gardening', 'Kayaking', 'Cycling', 'Board games', 'Baking',
  'Museums', 'Road trips', 'Volunteering', 'Fishing', 'Skiing', 'Tennis', 'Pottery', 'Birdwatching',
  'Concerts', 'Podcasts', 'Woodworking', 'Sailing', 'Crossword puzzles'
];

const GERUNDS = {
  Travel: 'planning the next trip', Hiking: 'out on a trail', Cooking: 'cooking for people I love',
  Music: 'at a show', Art: 'in a gallery', Yoga: 'on the mat', Reading: 'deep in a good book',
  Wine: 'sharing a bottle of something good', Dogs: 'out walking my dog', Photography: 'behind a camera',
  Fitness: 'at the gym before sunrise', Movies: 'arguing about movies', Dancing: 'dancing badly and not caring',
  Coffee: 'lingering over coffee', 'Food & dining': 'trying a new restaurant', Outdoors: 'outside somewhere quiet',
  Running: 'getting my miles in', Golf: 'on the course early', 'Beach days': 'near the water', Camping: 'off the grid for a weekend'
};

const OCCUPATIONS = [
  'Registered Nurse', 'Software Engineer', 'High School Teacher', 'Accountant', 'Physical Therapist',
  'Small Business Owner', 'Project Manager', 'Electrician', 'Dental Hygienist', 'Graphic Designer',
  'Real Estate Agent', 'Social Worker', 'Paralegal', 'Chef', 'Firefighter', 'Pharmacist',
  'Marketing Director', 'HR Manager', 'Contractor', 'Veterinary Technician', 'Flight Attendant',
  'Occupational Therapist', 'Insurance Adjuster', 'Data Analyst', 'Librarian', 'Bank Manager',
  'Plumber', 'School Counselor', 'Nurse Practitioner', 'Sales Manager', 'Truck Driver', 'Architect',
  'Speech Pathologist', 'Police Officer', 'Optometrist', 'Landscape Designer', 'Financial Advisor',
  'Elementary Teacher', 'Massage Therapist', 'IT Director', 'Bookkeeper', 'Welder', 'Radiologic Tech',
  'Nonprofit Director', 'Hair Stylist', 'Civil Engineer', 'Executive Assistant', 'Baker',
  'Respiratory Therapist', 'Auto Technician', 'Retired Educator', 'Retired Nurse', 'Consultant'
];

const EDUCATION = [
  'High school diploma', 'Some college', "Associate's degree", "Bachelor's in Business",
  "Bachelor's in Nursing", "Bachelor's in Education", "Bachelor's in Psychology",
  "Bachelor's in Communications", "Master's in Education", "Master's in Social Work", 'MBA',
  "Master's in Computer Science", 'JD', 'Trade certification', 'Nursing (RN)', "Bachelor's in Engineering"
];

const KIDS = {
  20: ['None', 'None', 'None', '1 (age 2)', '1 (age 4)', '2 (ages 1 and 3)'],
  30: ['None', 'None', '1 (age 6)', '1 (age 8)', '2 (ages 4 and 7)', '2 (ages 5 and 9)', '3 (ages 2, 6 and 9)'],
  40: ['None', '1 (age 12)', '1 (age 16)', '2 (ages 10 and 13)', '2 (ages 14 and 17)', '3 (ages 8, 12 and 15)'],
  50: ['None', '1 (age 19)', '2 (both in college)', '2 (ages 18 and 22)', '3 (all grown)', '2 grown children'],
  60: ['None', '2 grown children', '3 grown children', '2 grown children and 3 grandchildren', 'Grown kids, one grandchild', '4 grandchildren']
};

const OPENERS = [
  'Divorced {yrs} years and finally feeling like myself again.',
  'Newly single after a long marriage, and taking it slow.',
  'Started over at {age} — hardest thing I have done and the best.',
  'The divorce was rough, but I came out of it more myself than before.',
  'Two years out and genuinely happy for the first time in a while.',
  'Rebuilding, not rebounding. There is a difference.',
  'Long marriage, amicable ending, no regrets and no bitterness.',
  'I did the therapy, I did the work, and I am ready for something real.',
  'Coming out of a marriage that ended quietly and kindly.',
  'Single again and surprised by how much I like my own company.',
  'Divorced, co-parenting well, and open to what comes next.',
  'It took a while to feel ready. I feel ready now.'
];

const CLOSERS = [
  'Looking for someone kind who communicates like an adult.',
  'I would rather have one honest conversation than ten clever ones.',
  'Not looking to rush anything. Just want it to be real.',
  'Hoping to meet someone who has done their own work too.',
  'Want a partner, not a project.',
  'Someone who laughs easily and shows up when it matters.',
  'Looking for warmth, honesty, and decent taste in music.',
  'If you can be direct about what you want, we will get along.',
  'Second chapters can be better than the first. I believe that.',
  'I want the ordinary stuff — Sunday mornings, real talk, someone in my corner.',
  'Kindness first. Everything else we can figure out.',
  'Looking for someone steady who still likes to be surprised.'
];

const LOOKING_FOR = [
  'Someone emotionally available who has processed their own past and is ready to build something honest.',
  'A partner who values direct communication over guessing games, and who is comfortable with my kids being my priority.',
  'Looking for a genuine connection with someone who understands starting over and does not flinch at the messy parts.',
  'Someone who wants a real partnership — shared calendars, shared plans, shared quiet nights.',
  'A kind, curious person who asks good questions and actually listens to the answers.',
  'I want someone who is settled in themselves. Not perfect, just self-aware.',
  'Hoping to find someone who treats co-parenting as normal rather than baggage.',
  'A partner who is as comfortable at a nice dinner as on a muddy trail.',
  'Someone honest, patient, and willing to be a little vulnerable early on.',
  'Looking for warmth and consistency. Grand gestures matter less than showing up.',
  'Someone who has their own life and interests, and wants to share rather than merge.',
  'A person who can talk about hard things without it turning into a fight.',
  'I would love to meet someone who is genuinely happy for other people. That tells me a lot.',
  'Someone who understands that a second marriage takes more intention than the first.',
  'Looking for a best friend I am also attracted to. That is the whole list.'
];

const heightFor = (gender) => {
  const inches = gender === 'woman' ? int(60, 71) : int(66, 77);
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};

function makeProfile(id, gender) {
  const age = int(21, 70);
  const c = cohort(age);
  const name = pick(NAMES[gender][c]);
  const location = pick(CITIES);
  const occupation = age >= 64 && chance(0.35) ? pick(['Retired Educator', 'Retired Nurse', 'Consultant']) : pick(OCCUPATIONS);
  const children = pick(KIDS[c]);
  const isParent = children !== 'None';

  // Divorce must land after adulthood and no later than last year.
  const maxYearsSince = Math.max(1, Math.min(15, age - 22));
  const yrs = int(1, maxYearsSince);
  const divorceYear = THIS_YEAR - yrs;

  const core = sample(INTERESTS, int(2, 3));
  const interests = chance(0.55) ? [...core, pick(EXTRA_INTERESTS)] : core;

  const opener = pick(OPENERS).replace('{yrs}', String(yrs)).replace('{age}', String(age));
  const gerund = GERUNDS[core[0]] ?? 'outside';
  const kidSentence = isParent
    ? pick([`${children} and they come first.`, `Kids: ${children}. They are the best part of my life.`, `Parenting ${children} and loving it.`])
    : pick(['No kids of my own, and good with that.', 'No children — plenty of nieces and nephews though.', 'Child-free and happy about it.']);

  const bio = `${opener} ${occupation} in ${location.split(',')[0]}. Happiest when I am ${gerund}. ${kidSentence} ${pick(CLOSERS)}`;

  return {
    id,
    name,
    gender,
    age,
    location,
    image: `https://randomuser.me/api/portraits/${gender === 'woman' ? 'women' : 'men'}/${id % 100}.jpg`,
    bio,
    divorceYear,
    interests,
    occupation,
    education: pick(EDUCATION),
    height: heightFor(gender),
    children,
    lookingFor: pick(LOOKING_FOR)
  };
}

const profiles = [];
let id = 100;
for (let i = 0; i < PER_GENDER; i++) profiles.push(makeProfile(id++, 'woman'));
for (let i = 0; i < PER_GENDER; i++) profiles.push(makeProfile(id++, 'man'));

// A 2000-element annotated array literal trips TS2590 ("union type too complex"),
// so the data ships as a JSON string and is parsed at module load instead. That
// typechecks instantly and parses faster than an object literal of this size.
const file = `// AUTO-GENERATED by scripts/generate-profiles.mjs — do not edit by hand.
// Regenerate with: node scripts/generate-profiles.mjs
// ${PER_GENDER} women + ${PER_GENDER} men, ages 21-70, across ${CITIES.length} US metros.
// Interest labels intentionally match the vocabulary matchmaker.ts parses from
// member messages, so shared-interest scoring actually fires.
import type { Profile } from './data';

const RAW = ${JSON.stringify(JSON.stringify(profiles))};

export const GENERATED_PROFILES: Profile[] = JSON.parse(RAW);
`;

writeFileSync('src/haply/generatedProfiles.ts', file);

const women = profiles.filter((p) => p.gender === 'woman').length;
const parents = profiles.filter((p) => p.children !== 'None').length;
console.error(`wrote ${profiles.length} profiles (${women} women, ${profiles.length - women} men)`);
console.error(`parents: ${parents}, child-free: ${profiles.length - parents}`);
console.error(`distinct cities: ${new Set(profiles.map((p) => p.location)).size}, distinct names: ${new Set(profiles.map((p) => p.name)).size}`);
