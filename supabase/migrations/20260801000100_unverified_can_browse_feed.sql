-- Unverified members can browse Discover and the matchmaker.
--
-- The feed previously required the viewer to be verified, so an unverified
-- member saw nothing and had no way to judge whether verifying was worth it.
-- Everyone *listed* is still verified — that half of the promise is untouched.
-- What the viewer gives up is a clear look at photos, which the client blurs,
-- and the ability to like anyone, which the likes insert policy already refuses
-- them.
--
-- Only the viewer-side check changed. Candidate gating, the filters, the
-- already-answered exclusion and the column list are all as before; the whole
-- body is restated because the function is replaced wholesale.

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
    select p.id, p.is_banned
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
    where not me.is_banned
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
