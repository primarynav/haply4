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
// Weighted pick so big metros carry many more members than small ones — an even
// spread over 123 cities leaves ~8 per city, which makes local search useless.
const pickWeighted = (arr, weightOf) => {
  const total = arr.reduce((s, x) => s + weightOf(x), 0);
  let r = rnd() * total;
  for (const x of arr) {
    r -= weightOf(x);
    if (r <= 0) return x;
  }
  return arr[arr.length - 1];
};
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
  ['New York, NY',40.71,-74.01],['Brooklyn, NY',40.68,-73.94],['Buffalo, NY',42.89,-78.88],['Rochester, NY',43.16,-77.61],
  ['Los Angeles, CA',34.05,-118.24],['San Diego, CA',32.72,-117.16],['San Francisco, CA',37.77,-122.42],['San Jose, CA',37.34,-121.89],
  ['Sacramento, CA',38.58,-121.49],['Oakland, CA',37.80,-122.27],['Fresno, CA',36.74,-119.79],['Long Beach, CA',33.77,-118.19],
  ['Chicago, IL',41.88,-87.63],['Naperville, IL',41.79,-88.15],['Buffalo Grove, IL',42.17,-87.96],['Evanston, IL',42.05,-87.69],['Springfield, IL',39.80,-89.64],
  ['Houston, TX',29.76,-95.37],['Dallas, TX',32.78,-96.80],['Austin, TX',30.27,-97.74],['San Antonio, TX',29.42,-98.49],['Fort Worth, TX',32.76,-97.33],['Plano, TX',33.02,-96.70],['El Paso, TX',31.76,-106.49],
  ['Phoenix, AZ',33.45,-112.07],['Tucson, AZ',32.22,-110.97],['Scottsdale, AZ',33.49,-111.93],['Mesa, AZ',33.42,-111.83],
  ['Philadelphia, PA',39.95,-75.17],['Pittsburgh, PA',40.44,-79.99],['Allentown, PA',40.60,-75.49],
  ['Jacksonville, FL',30.33,-81.66],['Miami, FL',25.76,-80.19],['Tampa, FL',27.95,-82.46],['Orlando, FL',28.54,-81.38],['St. Petersburg, FL',27.77,-82.64],['Fort Lauderdale, FL',26.12,-80.14],
  ['Columbus, OH',39.96,-83.00],['Cleveland, OH',41.50,-81.69],['Cincinnati, OH',39.10,-84.51],['Toledo, OH',41.65,-83.54],
  ['Charlotte, NC',35.23,-80.84],['Raleigh, NC',35.78,-78.64],['Durham, NC',35.99,-78.90],['Greensboro, NC',36.07,-79.79],
  ['Indianapolis, IN',39.77,-86.16],['Fort Wayne, IN',41.08,-85.14],
  ['Seattle, WA',47.61,-122.33],['Spokane, WA',47.66,-117.43],['Tacoma, WA',47.25,-122.44],['Bellevue, WA',47.61,-122.20],
  ['Denver, CO',39.74,-104.99],['Colorado Springs, CO',38.83,-104.82],['Boulder, CO',40.01,-105.27],['Fort Collins, CO',40.59,-105.08],
  ['Boston, MA',42.36,-71.06],['Worcester, MA',42.26,-71.80],['Cambridge, MA',42.37,-71.11],
  ['Nashville, TN',36.16,-86.78],['Memphis, TN',35.15,-90.05],['Knoxville, TN',35.96,-83.92],
  ['Detroit, MI',42.33,-83.05],['Grand Rapids, MI',42.96,-85.67],['Ann Arbor, MI',42.28,-83.74],
  ['Portland, OR',45.52,-122.68],['Eugene, OR',44.05,-123.09],['Salem, OR',44.94,-123.04],
  ['Las Vegas, NV',36.17,-115.14],['Reno, NV',39.53,-119.81],
  ['Atlanta, GA',33.75,-84.39],['Savannah, GA',32.08,-81.09],['Augusta, GA',33.47,-81.97],
  ['Minneapolis, MN',44.98,-93.27],['St. Paul, MN',44.95,-93.09],['Rochester, MN',44.02,-92.47],
  ['Kansas City, MO',39.10,-94.58],['St. Louis, MO',38.63,-90.20],['Springfield, MO',37.21,-93.29],
  ['Baltimore, MD',39.29,-76.61],['Silver Spring, MD',38.99,-77.03],
  ['Milwaukee, WI',43.04,-87.91],['Madison, WI',43.07,-89.40],['Green Bay, WI',44.51,-88.02],
  ['Albuquerque, NM',35.08,-106.65],['Santa Fe, NM',35.69,-105.94],
  ['Salt Lake City, UT',40.76,-111.89],['Provo, UT',40.23,-111.66],['Boise, ID',43.62,-116.20],
  ['Oklahoma City, OK',35.47,-97.52],['Tulsa, OK',36.15,-95.99],
  ['Louisville, KY',38.25,-85.76],['Lexington, KY',38.04,-84.50],
  ['New Orleans, LA',29.95,-90.07],['Baton Rouge, LA',30.45,-91.19],
  ['Richmond, VA',37.54,-77.44],['Virginia Beach, VA',36.85,-75.98],['Arlington, VA',38.88,-77.10],
  ['Omaha, NE',41.26,-95.93],['Lincoln, NE',40.81,-96.70],['Des Moines, IA',41.59,-93.62],['Little Rock, AR',34.75,-92.29],
  ['Birmingham, AL',33.52,-86.80],['Huntsville, AL',34.73,-86.59],['Columbia, SC',34.00,-81.03],['Charleston, SC',32.78,-79.93],
  ['Hartford, CT',41.76,-72.67],['New Haven, CT',41.31,-72.93],['Providence, RI',41.82,-71.41],
  ['Newark, NJ',40.74,-74.17],['Jersey City, NJ',40.73,-74.08],['Trenton, NJ',40.22,-74.74],
  ['Wilmington, DE',39.74,-75.55],['Manchester, NH',42.99,-71.46],['Burlington, VT',44.48,-73.21],['Portland, ME',43.66,-70.26],
  ['Anchorage, AK',61.22,-149.90],['Honolulu, HI',21.31,-157.86],['Billings, MT',45.78,-108.50],['Sioux Falls, SD',43.55,-96.73],
  ['Fargo, ND',46.88,-96.79],['Cheyenne, WY',41.14,-104.82],['Charleston, WV',38.35,-81.63],['Jackson, MS',32.30,-90.18]
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

// Weighted so the common answer dominates, the way a real population would.
const SMOKING = ['No', 'No', 'No', 'No', 'No', 'No', 'Occasionally', 'Socially', 'Yes'];
const DRINKING = ['Socially', 'Socially', 'Socially', 'Socially', 'Rarely', 'Rarely', 'Never', 'Regularly'];

// Roughly population-scaled: a Chicago search should surface dozens of people,
// a Cheyenne search a handful.
const BIG = new Set(['New York, NY','Brooklyn, NY','Los Angeles, CA','Chicago, IL','Houston, TX','Phoenix, AZ','Philadelphia, PA','San Antonio, TX','San Diego, CA','Dallas, TX','Austin, TX','San Jose, CA','Jacksonville, FL','Fort Worth, TX','Columbus, OH','Charlotte, NC','Indianapolis, IN','Seattle, WA','Denver, CO','Boston, MA','Nashville, TN','Detroit, MI','Portland, OR','Las Vegas, NV','Atlanta, GA','Miami, FL','Minneapolis, MN','Tampa, FL','Baltimore, MD','Milwaukee, WI','Sacramento, CA','Kansas City, MO','St. Louis, MO','Pittsburgh, PA','Cleveland, OH','Orlando, FL','San Francisco, CA']);
const MID = new Set(['Naperville, IL','Evanston, IL','Buffalo Grove, IL','Plano, TX','Scottsdale, AZ','Mesa, AZ','Oakland, CA','Long Beach, CA','Fresno, CA','Tucson, AZ','Raleigh, NC','Durham, NC','Bellevue, WA','Tacoma, WA','Cambridge, MA','Worcester, MA','St. Paul, MN','Boulder, CO','Colorado Springs, CO','Cincinnati, OH','Memphis, TN','Grand Rapids, MI','Ann Arbor, MI','Louisville, KY','New Orleans, LA','Richmond, VA','Arlington, VA','Virginia Beach, VA','Omaha, NE','Albuquerque, NM','Salt Lake City, UT','Oklahoma City, OK','Tulsa, OK','Madison, WI','Fort Lauderdale, FL','St. Petersburg, FL','Newark, NJ','Jersey City, NJ','Providence, RI','Hartford, CT','New Haven, CT','Silver Spring, MD','Greensboro, NC','Toledo, OH','Spokane, WA','Reno, NV','Birmingham, AL','Charleston, SC','Columbia, SC','Des Moines, IA','Lexington, KY']);
const cityWeight = (c) => (BIG.has(c[0]) ? 26 : MID.has(c[0]) ? 8 : 2);

const heightFor = (gender) => {
  const inches = gender === 'woman' ? int(60, 71) : int(66, 77);
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};

function makeProfile(id, gender) {
  const age = int(21, 70);
  const c = cohort(age);
  const name = pick(NAMES[gender][c]);
  const [location, lat, lng] = pickWeighted(CITIES, cityWeight);
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
    lat,
    lng,
    image: `https://randomuser.me/api/portraits/${gender === 'woman' ? 'women' : 'men'}/${id % 100}.jpg`,
    bio,
    divorceYear,
    interests,
    occupation,
    education: pick(EDUCATION),
    height: heightFor(gender),
    smoking: pick(SMOKING),
    drinking: pick(DRINKING),
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
console.error(`smoking No: ${profiles.filter((p) => p.smoking === 'No').length}, drinking Socially: ${profiles.filter((p) => p.drinking === 'Socially').length}`);
const byCity = {};
for (const p of profiles) byCity[p.location] = (byCity[p.location] || 0) + 1;
const top = Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 5);
console.error(`densest cities: ${top.map(([c, n]) => `${c} ${n}`).join(', ')}`);
console.error(`distinct cities: ${new Set(profiles.map((p) => p.location)).size}, distinct names: ${new Set(profiles.map((p) => p.name)).size}`);
