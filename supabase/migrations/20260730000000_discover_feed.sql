-- Discover and the AI matchmaker read real members.
--
-- Until now both read a bundled fixture file, so a signed-in member browsed
-- invented people. This adds the one read path they share.
--
-- The previous migration revoked `get_daily_set` because `returns setof
-- profiles` handed callers every column — postal, exact birthdate,
-- terms_accepted_at, referral_source — and SECURITY DEFINER meant row policies
-- did not trim it. Its note said: if the discover feed is wired up later, give
-- it an explicit column list covering only what the cards render. That is what
-- this is. `get_daily_set` stays revoked.
--
-- Definer is required rather than convenient: the profiles SELECT policy only
-- lets a member read their own row, so a plain query returns nothing. The
-- function therefore carries the gating the policy would otherwise do, and the
-- return list is the whole privacy boundary — every column here is one the
-- member typed for other members to read. Deliberately absent: postal,
-- birthdate (only the derived `age` ships), email, location, terms_*,
-- referral_*, is_banned, is_paused, and the verification tables.

create or replace function public.get_discover_feed(
  p_gender          text    default null,   -- 'man' | 'woman'; null = anyone
  p_min_age         integer default null,
  p_max_age         integer default null,
  p_interests       text[]  default null,   -- overlap; null or empty = any
  p_kids            text    default null,   -- 'has' | 'none'
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
      -- Whether they have kids, for the filter only. The co-parenting question
      -- is authoritative when answered; otherwise fall back to reading the
      -- free-text answer from onboarding. Null means they never said.
      case
        when p.kids_at_home is not null then p.kids_at_home
        when p.kids is null or btrim(p.kids) = '' then null
        when p.kids ~* '^(no|none)' then false
        else true
      end as has_kids
    from public.profiles p, me
    -- The viewer has to be a verified member in good standing to see anyone:
    -- the promise on the landing page is that everyone here is verified, and
    -- that only holds if browsing requires it too.
    where me.divorce_verified
      and not me.is_banned
      and p.id <> me.id
      and p.divorce_verified
      and p.dating_on
      and not p.is_banned
      and not p.is_paused
      and not public.viewer_blocked_with(p.id)
  ),
  filtered as (
    select c.* from candidate c
    -- An attribute the candidate never filled in does not disqualify them,
    -- which is how the client-side filters already behaved. Age is the one
    -- exception people expect to be strict, but a null age still passes rather
    -- than hiding a member for an unanswered field.
    where (p_gender is null or c.gender = p_gender)
      and (p_min_age is null or c.age is null or c.age >= p_min_age)
      and (p_max_age is null or c.age is null or c.age <= p_max_age)
      and (p_interests is null or cardinality(p_interests) = 0
           or c.interests && p_interests)
      and (p_kids is null
           or (p_kids = 'has'  and c.has_kids is true)
           -- "no kids" keeps the unanswered, matching the old client filter.
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
    -- Window functions run before LIMIT, so this is the true match count and
    -- the header can say "42 members" while only one page is fetched.
    count(*) over () as total_count
  from filtered f
  -- id breaks ties so paging cannot repeat or skip a member.
  order by f.last_active desc nulls last, f.id
  limit greatest(0, least(coalesce(p_limit, 60), 200))
  offset greatest(0, coalesce(p_offset, 0));
$$;

comment on function public.get_discover_feed(text, integer, integer, text[], text, text, text, text, integer, integer) is
  'Discover feed for a verified signed-in member. Explicit column list — add a column only if a card actually renders it. Never widen to SETOF profiles.';

-- Postgres grants EXECUTE to PUBLIC on every new function, which would hand
-- this to anon. Drop that, then grant the one role that should have it.
revoke all on function public.get_discover_feed(text, integer, integer, text[], text, text, text, text, integer, integer) from public;
revoke all on function public.get_discover_feed(text, integer, integer, text[], text, text, text, text, integer, integer) from anon;
grant execute on function public.get_discover_feed(text, integer, integer, text[], text, text, text, text, integer, integer) to authenticated;

-- The feed filters on these before ordering by recency; without them every
-- browse is a seq scan over profiles once the table is non-trivial.
create index if not exists profiles_discover_idx
  on public.profiles (last_active desc)
  where divorce_verified and dating_on and not is_banned and not is_paused;

create index if not exists profiles_interests_idx
  on public.profiles using gin (interests);
