-- Make liking, matching and messaging real.
--
-- The tables were already here from the original scaffold — likes with a
-- like/pass action and a unique pair, matches with a user_a < user_b invariant,
-- messages keyed to a match, and an AFTER INSERT trigger (handle_mutual_like)
-- that creates the match when a like is reciprocated. None of it was reachable:
-- the app kept likes, matches and conversations in React state seeded from
-- LIKES_BACK and CHAT_REPLIES, so liking a real member wrote nothing.
--
-- This migration closes the three gaps between those tables and a working loop.

-- ---------------------------------------------------------------------------
-- 1. A member could enumerate who liked them.
--
-- The SELECT policy was `liker_id = auth.uid() OR liked_id = auth.uid()`, so
-- anyone could read every incoming like — including from people they had not
-- matched with, and including likes they had already passed on. That is the
-- reciprocity the whole design turns on, handed over for free: you could see
-- who wanted you without ever declaring yourself.
--
-- A member now reads only the likes they sent. Incoming interest becomes
-- visible the only way it should — as a match, once it is mutual. The trigger
-- that detects reciprocity is SECURITY DEFINER and reads the table directly,
-- so matching is unaffected.
drop policy if exists "see own like activity" on public.likes;

create policy "see own likes" on public.likes
  for select using (liker_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. Nothing could render a match.
--
-- The profiles SELECT policy is own-row-only, so a member holding a match row
-- still could not read the other person's name. Same shape as
-- get_discover_feed: SECURITY DEFINER, explicit column list, only what a match
-- card and a conversation header actually show.
create or replace function public.get_my_matches()
returns table (
  match_id       uuid,
  other_id       uuid,
  name           text,
  age            integer,
  city           text,
  intro          text,
  interests      text[],
  matched_at     timestamptz,
  last_body      text,
  last_at        timestamptz,
  last_sender_id uuid,
  unread_count   bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id,
    other.id,
    other.name,
    other.age,
    other.city,
    other.intro,
    other.interests,
    m.created_at,
    last.body,
    last.created_at,
    last.sender_id,
    coalesce(unread.n, 0)
  from public.matches m
  join public.profiles other
    on other.id = case when m.user_a = auth.uid() then m.user_b else m.user_a end
  -- The newest message, for the conversation list preview.
  left join lateral (
    select msg.body, msg.created_at, msg.sender_id
    from public.messages msg
    where msg.match_id = m.id
    order by msg.created_at desc
    limit 1
  ) last on true
  left join lateral (
    select count(*) as n
    from public.messages msg
    where msg.match_id = m.id
      and msg.sender_id <> auth.uid()
      and msg.read_at is null
  ) unread on true
  where (m.user_a = auth.uid() or m.user_b = auth.uid())
    and m.ended_at is null
    -- A block hides the match from both sides without deleting the history.
    and not public.viewer_blocked_with(other.id)
  order by coalesce(last.created_at, m.created_at) desc, m.id;
$$;

comment on function public.get_my_matches() is
  'Match list for the signed-in member, with the other person''s card columns. Explicit column list — never widen to SETOF profiles.';

revoke all on function public.get_my_matches() from public;
revoke all on function public.get_my_matches() from anon;
grant execute on function public.get_my_matches() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Discover kept showing people you had already answered.
--
-- Passing someone only hid them in local state, so they came back on reload,
-- and a member you had already liked stayed in the grid to be liked again.
-- Both directions of that are now handled where the feed is built.
--
-- Same signature and same column list as before — the only change is the
-- exclusion of profiles this member has already acted on.
create or replace function public.get_discover_feed(
  p_gender          text    default null,
  p_min_age         integer default null,
  p_max_age         integer default null,
  p_interests       text[]  default null,
  p_kids            text    default null,
  p_custody         text    default null,
  p_wants_more_kids text    default null,
  p_metro           text    default null,
  p_limit           integer default 60,
  p_offset          integer default 0
)
returns table (
  id               uuid,
  name             text,
  age              integer,
  gender           text,
  city             text,
  metro            text,
  intro            text,
  kids             text,
  interests        text[],
  divorce_status   text,
  divorce_year     integer,
  divorce_stage    text,
  kids_at_home     boolean,
  kids_age_bands   text[],
  custody_schedule text,
  wants_more_kids  text,
  last_active      timestamptz,
  total_count      bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select p.id, p.divorce_verified, p.is_banned
    from public.profiles p
    where p.id = auth.uid()
  ),
  candidate as (
    select
      p.*,
      case
        when p.kids_at_home is not null then p.kids_at_home
        when p.kids is null or btrim(p.kids) = '' then null
        when p.kids ~* '^(no|none)' then false
        else true
      end as has_kids
    from public.profiles p, me
    where me.divorce_verified
      and not me.is_banned
      and p.id <> me.id
      and p.divorce_verified
      and p.dating_on
      and not p.is_banned
      and not p.is_paused
      and not public.viewer_blocked_with(p.id)
      -- Already liked or passed: answering someone should be the last time
      -- they appear, in either direction.
      and not exists (
        select 1 from public.likes l
        where l.liker_id = me.id and l.liked_id = p.id
      )
  ),
  filtered as (
    select c.* from candidate c
    where (p_gender is null or c.gender = p_gender)
      and (p_min_age is null or c.age is null or c.age >= p_min_age)
      and (p_max_age is null or c.age is null or c.age <= p_max_age)
      and (p_interests is null or cardinality(p_interests) = 0
           or c.interests && p_interests)
      and (p_kids is null
           or (p_kids = 'has'  and c.has_kids is true)
           or (p_kids = 'none' and coalesce(c.has_kids, false) = false))
      and (p_custody is null or c.custody_schedule is null
           or c.custody_schedule = p_custody)
      and (p_wants_more_kids is null or c.wants_more_kids is null
           or c.wants_more_kids = p_wants_more_kids)
      and (p_metro is null or c.metro = p_metro)
  )
  select
    f.id, f.name, f.age, f.gender, f.city, f.metro, f.intro, f.kids,
    f.interests, f.divorce_status, f.divorce_year, f.divorce_stage,
    f.kids_at_home, f.kids_age_bands, f.custody_schedule, f.wants_more_kids,
    f.last_active,
    count(*) over () as total_count
  from filtered f
  order by f.last_active desc nulls last, f.id
  limit greatest(0, least(coalesce(p_limit, 60), 200))
  offset greatest(0, coalesce(p_offset, 0));
$$;

-- Marking a conversation read is the receiving member updating rows they did
-- not send, which the existing policies allow no route for.
create policy "mark received messages read" on public.messages
  for update using (
    sender_id <> auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
        and m.ended_at is null
    )
  )
  with check (sender_id <> auth.uid());

-- The feed's new exclusion and the match list's newest-message lookup both sit
-- on the hot path of every Discover load and every Messages open.
create index if not exists likes_liker_liked_idx on public.likes (liker_id, liked_id);
create index if not exists messages_match_created_idx on public.messages (match_id, created_at desc);
