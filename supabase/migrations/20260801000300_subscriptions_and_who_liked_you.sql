-- Paid subscriptions, and the first thing they unlock: who liked you.
--
-- The likes policy deliberately hides incoming likes from everyone — a member
-- reads only the likes they sent, so interest arrives as a match or not at all.
-- That is the right default for privacy and it is also what makes this sellable:
-- the information exists, nobody can see it, and revealing it costs nothing to
-- produce.
--
-- Entitlement lives in the database, never in the client. A member cannot grant
-- themselves a subscription any more than they can grant themselves a badge.

create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  profile_id               uuid not null references public.profiles(id) on delete cascade,
  provider                 text not null default 'paypal',
  -- PayPal's subscription id (I-XXXXXXXXXXXX). Unique so a replayed webhook
  -- updates the row it already created rather than adding a second one.
  provider_subscription_id text not null unique,
  plan_id                  text,
  status                   text not null,
  -- Paid-through date from PayPal. Access is checked against this as well as
  -- status, so a cancelled subscription keeps working until the period it was
  -- already paid for runs out.
  current_period_end       timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint subscriptions_status_check
    check (status in ('active', 'cancelled', 'suspended', 'past_due', 'expired'))
);

alter table public.subscriptions enable row level security;

-- A member may see their own subscription — the profile screen needs to show
-- what they are paying for and when it renews. Nobody may write one: rows come
-- from the PayPal webhook with the service role, so a forged insert is not a
-- route to free access.
drop policy if exists "see own subscription" on public.subscriptions;
create policy "see own subscription" on public.subscriptions
  for select using (profile_id = auth.uid());

create index if not exists subscriptions_profile_idx on public.subscriptions (profile_id, status);

/**
 * Whether the signed-in member currently has paid access.
 *
 * Active, or cancelled but still inside the period they already paid for.
 * Cancelling should stop the next charge, not confiscate the current month.
 */
create or replace function public.viewer_is_subscriber()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.profile_id = auth.uid()
      and (
        s.status = 'active'
        or (s.status in ('cancelled', 'suspended') and s.current_period_end > now())
      )
  );
$$;

revoke all on function public.viewer_is_subscriber() from public;
revoke all on function public.viewer_is_subscriber() from anon;
grant execute on function public.viewer_is_subscriber() to authenticated;

/**
 * How many people have liked you and are still waiting.
 *
 * Deliberately available to everyone, subscriber or not: a bare number reveals
 * nobody's identity, and it is the whole reason to consider paying. Selling a
 * locked door with no indication anything is behind it would be worse for the
 * member and worse for conversion.
 */
create or replace function public.count_who_liked_me()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.likes l
  join public.profiles p on p.id = l.liker_id
  where l.liked_id = auth.uid()
    and l.action = 'like'
    and p.divorce_verified
    and p.dating_on
    and not p.is_banned
    and not p.is_paused
    and not public.viewer_blocked_with(p.id)
    -- Someone you already answered is not pending interest: either you liked
    -- them back and it is a match, or you passed and it is closed.
    and not exists (
      select 1 from public.likes mine
      where mine.liker_id = auth.uid() and mine.liked_id = l.liker_id
    );
$$;

revoke all on function public.count_who_liked_me() from public;
revoke all on function public.count_who_liked_me() from anon;
grant execute on function public.count_who_liked_me() to authenticated;

/**
 * The people themselves — subscribers only.
 *
 * Same column list discipline as the discover feed: only what a card renders.
 * The subscription check is inside the function rather than in a policy on
 * likes, so there is exactly one place that decides who may see this.
 */
create or replace function public.get_who_liked_me()
returns table (
  liker_id  uuid,
  name      text,
  age       integer,
  city      text,
  intro     text,
  interests text[],
  liked_at  timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.age, p.city, p.intro, p.interests, l.created_at
  from public.likes l
  join public.profiles p on p.id = l.liker_id
  where public.viewer_is_subscriber()
    and l.liked_id = auth.uid()
    and l.action = 'like'
    and p.divorce_verified
    and p.dating_on
    and not p.is_banned
    and not p.is_paused
    and not public.viewer_blocked_with(p.id)
    and not exists (
      select 1 from public.likes mine
      where mine.liker_id = auth.uid() and mine.liked_id = l.liker_id
    )
  order by l.created_at desc;
$$;

revoke all on function public.get_who_liked_me() from public;
revoke all on function public.get_who_liked_me() from anon;
grant execute on function public.get_who_liked_me() to authenticated;
