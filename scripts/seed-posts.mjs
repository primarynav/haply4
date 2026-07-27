// Community seed content. Emits two artifacts from one source so they can't drift:
//   src/haply/communityPosts.ts  — the client-side fallback / pre-fetch state
//   supabase/seed/posts.sql      — rows for the live posts table
// Run: node scripts/seed-posts.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

// hoursAgo drives both the relative label in the fallback and created_at in SQL.
const POSTS = [
  { hoursAgo: 0, pinned: true, name: 'Haply Team', cat: 'Divorce Support', title: 'Read before posting — what this space is for',
    body: 'This is a community for people who are separated or divorced. Vent, ask, celebrate, or just read. No advice-giving unless someone asks for it, and no contact info in public threads. If you are new, saying hello is enough.',
    likes: 214, comments: 38 },

  { hoursAgo: 3, name: 'Marcus T.', cat: 'Divorce Support', title: 'Signed the papers Tuesday and I have not told anyone yet',
    body: 'Eleven years. It took four minutes at a desk with a woman who had a photo of her dog on the monitor. I keep opening my phone to tell someone and then closing it. Not sad exactly. Just nothing where something should be. Is that normal or am I about to get hit by a truck emotionally.',
    likes: 342, comments: 87 },

  { hoursAgo: 6, name: 'Dana R.', cat: 'Co-Parenting', title: 'How do you handle the handoff when they are crying?',
    body: 'My daughter is 6. Every Sunday at 5 she cries in the car and asks why she has to go. She is fine ten minutes after she gets there — her dad sends a photo, she is laughing. But those ten minutes are wrecking me. Do you say something reassuring or does that make it worse?',
    likes: 189, comments: 64 },

  { hoursAgo: 9, name: 'Priya S.', cat: 'Self-Care', title: 'I cooked a real dinner for one tonight',
    body: 'Not standing over the sink. Not cereal. I made the salmon thing I used to make for company, sat at the actual table, and ate it. Small. But I have been living on toast since March so I am counting it.',
    likes: 508, comments: 42 },

  { hoursAgo: 14, name: 'Kevin M.', cat: 'Divorce Support', title: 'The mediator asked what I wanted and I could not answer',
    body: 'Genuinely blanked. Twenty two years of knowing what she wanted, what the kids needed, what the mortgage needed. He asked what I want and I sat there. Went home and wrote a list. It was four items long and two of them were about the dog.',
    likes: 421, comments: 96 },

  { hoursAgo: 19, name: 'Alicia B.', cat: 'Dating Again', title: 'First date in 16 years. What do people even do now',
    body: 'Coffee on Saturday with someone from a hiking group. Last time I dated, you called a landline. I do not know when texting becomes too much texting, or whether I mention the divorce, or how much. Anyone got a rule of thumb that worked?',
    likes: 276, comments: 118 },

  { hoursAgo: 26, name: 'Tom H.', cat: 'Co-Parenting', title: 'Two years in: the schedule that finally stopped the fighting',
    body: 'Posting because I wish someone had told me. We went to 2-2-3 and put everything in a shared calendar that neither of us is allowed to comment in — logistics only, no messages. Every argument we had was actually about tone in the messages, not the schedule. Removing the place to argue removed the arguing.',
    likes: 634, comments: 71 },

  { hoursAgo: 31, name: 'Renee W.', cat: 'Divorce Support', title: 'Does the anger arrive late for anyone else?',
    body: 'I was so calm through all of it. Everyone said how well I was handling it. Fourteen months out I am furious, and about specific small things — a comment he made at my brother\'s wedding in 2019. It feels like it is happening now. Is this a stage or should I be worried.',
    likes: 397, comments: 103 },

  { hoursAgo: 38, name: 'Jordan P.', cat: 'Success Stories', title: 'Update: the apartment I hated is now the place I like best',
    body: 'I posted here in the winter about how much I hated my place. Beige, loud upstairs neighbour, took the first thing available. Painted two walls, got a real bed instead of the mattress on the floor, put my records where I can reach them. Came home Thursday and felt glad to be there. Wanted to report back.',
    likes: 712, comments: 55 },

  { hoursAgo: 44, name: 'Nicole F.', cat: 'Self-Care', title: 'Stopped checking her Instagram. 41 days.',
    body: 'It was the last thing I did every night and the first every morning. I would learn something and feel awful for hours. Blocked, not unfollowed — unfollowing left the door open. 41 days and I could not tell you what she did last weekend, which is the point.',
    likes: 589, comments: 47 },

  { hoursAgo: 52, name: 'Greg D.', cat: 'Divorce Support', title: 'Practical: what did nobody warn you about the money side?',
    body: 'Six weeks in. Already hit two things I did not expect — the filing fee, and that refinancing in my name alone meant a whole new credit check. What else is coming that people do not mention? Would rather be braced than surprised.',
    likes: 268, comments: 141 },

  { hoursAgo: 60, name: 'Bethany L.', cat: 'Co-Parenting', title: 'His new partner is good with my kids and I feel awful about how much that stings',
    body: 'She is genuinely kind to them. My son mentioned she helped him with a science project and I said something clipped that I regretted immediately. I want them to be happy there. I do. Both things are true at once and I do not know what to do with that.',
    likes: 466, comments: 89 },

  { hoursAgo: 68, name: 'Sam K.', cat: 'Dating Again', title: 'When do you tell them how long the marriage was?',
    body: 'Twenty three years feels like a number that changes how someone sees you. I have been vague twice and it felt dishonest. Do you lead with it, wait for it to come up, or is it just not the big deal I think it is?',
    likes: 203, comments: 76 },

  { hoursAgo: 75, name: 'Carmen O.', cat: 'Self-Care', title: 'Therapist gave me one sentence that actually helped',
    body: '"You are not behind." I had been comparing my nine months to someone else\'s three years and treating it as a race I was losing. Writing it here because I would have needed to read it in February.',
    likes: 823, comments: 64 },

  { hoursAgo: 84, name: 'Derek A.', cat: 'Divorce Support', title: 'Told the kids last night. 9 and 13.',
    body: 'We did it together, at the kitchen table, kept it short like every guide says. The 13 year old had clearly already worked it out. The 9 year old asked if we were still going to Michigan in July. Then they both went and watched TV and I sat there not knowing what to do with my hands.',
    likes: 745, comments: 132 },

  { hoursAgo: 96, name: 'Lauren V.', cat: 'Success Stories', title: 'One year since I moved out. Some things I know now.',
    body: 'The loneliness peaked around month four and then genuinely eased. I made two friends who never knew me as half of a couple, which turned out to matter more than I expected. I still have bad weeks. They are weeks now, not seasons.',
    likes: 1104, comments: 97 },

  { hoursAgo: 108, name: 'Anthony R.', cat: 'Co-Parenting', title: 'Anyone else find the empty week harder than the busy one?',
    body: 'When I have them I am exhausted and fine. The off week I cannot settle. House is too quiet, I eat standing up, I go to bed at 9. Trying to build something into those weeks rather than just waiting them out. What worked for you?',
    likes: 512, comments: 108 },

  { hoursAgo: 120, name: 'Michelle T.', cat: 'Dating Again', title: 'Second date went well and I panicked about it',
    body: 'Nice man, easy conversation, walked me to the car. Got home and felt straight up dread. I think part of me decided that wanting something again is how you get hurt. Working on it. Not cancelling on him.',
    likes: 388, comments: 82 },

  { hoursAgo: 134, name: 'Ray B.', cat: 'Divorce Support', title: 'Sixty two, married thirty one years, starting over',
    body: 'I know I am older than most people posting here. Reading these threads has helped more than the two group sessions I went to. If there is anyone else in their sixties doing this, I would like to hear from you. It is a specific kind of quiet.',
    likes: 967, comments: 156 },

  { hoursAgo: 148, name: 'Elena G.', cat: 'Self-Care', title: 'Made a rule: no big decisions after 9pm',
    body: 'Every regrettable text, every 2am draft of an email to his lawyer, every online purchase I did not need — all after 9. Now anything that feels urgent at night gets written down and looked at in the morning. About half of it turns out not to matter.',
    likes: 641, comments: 39 },

  { hoursAgo: 162, name: 'Chris W.', cat: 'Co-Parenting', title: 'Do you go to the school events together or split them?',
    body: 'First parent-teacher night since the split is next week. She suggested going together for our daughter\'s sake. I think I can do it. I am less sure I can do the walking-out-to-separate-cars part afterwards.',
    likes: 294, comments: 67 },

  { hoursAgo: 178, name: 'Yolanda M.', cat: 'Success Stories', title: 'Got the promotion I would have turned down two years ago',
    body: 'It needs travel, which never would have worked before. I said yes without running it past anybody, and that part felt stranger than the job itself. Not what I would have chosen, but here we are and it is good.',
    likes: 878, comments: 61 },

  { hoursAgo: 196, name: 'Paul S.', cat: 'Divorce Support', title: 'The grief is not for her, it is for the version of me that was married',
    body: 'Took me a long time to work out what I was actually mourning. It is not her — we were miserable and both knew. It is the guy who had a plan. I liked having a plan. Building a new one slowly and it is nothing like the old one.',
    likes: 1032, comments: 88 },

  { hoursAgo: 214, name: 'Simone A.', cat: 'Dating Again', title: 'Told him about my kids on the first date and he did not blink',
    body: 'I had a whole speech ready because the last one went badly. He asked their names and what they are into. That was it. I had forgotten it could just be a normal fact about a person.',
    likes: 726, comments: 54 },

  { hoursAgo: 238, name: 'Nate F.', cat: 'Self-Care', title: 'Started running because I could not sleep. Kept it because of the mornings.',
    body: 'Nothing impressive, three miles, slowly. But I am outside at 6am and it is the only part of the day nobody needs anything from me. Sleeping better too, which was the original point.',
    likes: 549, comments: 44 },

  { hoursAgo: 262, name: 'Gina C.', cat: 'Co-Parenting', title: 'What do you say when they ask if you still love their dad?',
    body: 'My son asked in the car, which is where all the real questions happen apparently. I said something about loving him for a long time and that changing. He seemed to accept it. I have no idea if it was the right answer.',
    likes: 683, comments: 121 },

  { hoursAgo: 290, name: 'Doug H.', cat: 'Divorce Support', title: 'Nine months out. Ask me anything, I have made most of the mistakes.',
    body: 'Sent the long email. Went to the wedding I should have skipped. Told my kids more than they needed. Dated someone three weeks after moving out. All survivable, none recommended. Happy to answer anything if it saves someone a step.',
    likes: 1289, comments: 203 },

  { hoursAgo: 320, name: 'Farah N.', cat: 'Success Stories', title: 'My daughter told me the house feels calmer now',
    body: 'She is 15 and not given to reassuring anybody. She said it offhand, doing homework. I had spent two years assuming I had broken something for her. I went into the other room and cried, then made dinner.',
    likes: 1456, comments: 112 }
];

const label = (h) => {
  if (h === 0) return 'Pinned';
  if (h < 1) return 'Just now';
  if (h < 24) return `${h} hours ago`;
  const d = Math.round(h / 24);
  return d === 1 ? '1 day ago' : `${d} days ago`;
};

// --- TypeScript fallback ---
const ts = `// AUTO-GENERATED by scripts/seed-posts.mjs — do not edit by hand.
// Client-side fallback and pre-fetch state. The live feed is served from the
// Supabase \`posts\` table; seed it with supabase/seed/posts.sql.
import type { Post } from './data';

export const COMMUNITY_POSTS: Post[] = [
${POSTS.map((p, i) => `  ${JSON.stringify({ id: i + 1, name: p.name, cat: p.cat, time: label(p.hoursAgo), title: p.title, body: p.body, likes: p.likes, comments: p.comments })},`).join('\n')}
];
`;
writeFileSync('src/haply/communityPosts.ts', ts);

// --- SQL seed ---
const esc = (s) => s.replace(/'/g, "''");
const rows = POSTS.map(
  (p) =>
    `  (${p.pinned ? 'true' : 'false'}, '${esc(p.name)}', '${esc(p.cat)}', '${esc(p.title)}', '${esc(p.body)}', now() - interval '${p.hoursAgo} hours')`
).join(',\n');

const sql = `-- AUTO-GENERATED by scripts/seed-posts.mjs — do not edit by hand.
-- Seeds the community feed with realistic member posts.
--
-- Run in the Supabase SQL editor.
--
-- Safe to re-run: each row is skipped when a post with the same title already
-- exists, so this does not depend on a unique constraint and will not duplicate.
--
-- NOTE ON COUNTS: likes and comments are NOT columns on posts — fetchPosts()
-- derives them from the post_likes and comments relations. So these posts will
-- show 0 likes and 0 comments in the live feed regardless of what is seeded
-- here. Seeding realistic counts would need one row per like from a distinct
-- user, since post_likes is keyed by (post_id, user_id).
--
-- user_id is left NULL: the column is nullable, and these posts are not authored
-- by any real account. Attributing them to a member's uuid would make them look
-- like that person's posts to anything that reads user_id.

with seed(pinned, author_name, cat, title, body, created_at) as (
  values
${rows}
)
insert into public.posts (user_id, author_name, cat, title, body, pinned, created_at)
select
  null,
  s.author_name, s.cat, s.title, s.body, s.pinned, s.created_at
from seed s
where not exists (select 1 from public.posts p where p.title = s.title);

-- Verify:
--   select cat, count(*) from public.posts group by cat order by 2 desc;
--   select author_name, title, created_at from public.posts order by created_at desc limit 10;
`;
mkdirSync('supabase/seed', { recursive: true });
writeFileSync('supabase/seed/posts.sql', sql);

const byCat = {};
for (const p of POSTS) byCat[p.cat] = (byCat[p.cat] || 0) + 1;
console.error(`wrote ${POSTS.length} posts`);
console.error('by category:', JSON.stringify(byCat));
console.error(`oldest: ${label(POSTS[POSTS.length - 1].hoursAgo)}, newest member post: ${label(POSTS[1].hoursAgo)}`);
