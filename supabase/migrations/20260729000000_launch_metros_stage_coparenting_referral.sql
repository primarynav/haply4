-- Launch focus, divorce stage, co-parenting compatibility, and partner attribution.
--
-- Applied to the project already; kept here so the schema is reproducible.

alter table public.profiles
  add column if not exists metro text,
  add column if not exists divorce_stage text,
  add column if not exists kids_at_home boolean,
  add column if not exists kids_age_bands text[],
  add column if not exists custody_schedule text,
  add column if not exists wants_more_kids text,
  add column if not exists referral_code text,
  add column if not exists referral_source text;

comment on column public.profiles.metro is
  'Launch metro slug the member belongs to. Density beats reach pre-launch.';
comment on column public.profiles.divorce_stage is
  'separated | healing | ready — where the member is in the divorce journey. Gates dating opt-in.';
comment on column public.profiles.custody_schedule is
  'none | full_time | most_time | half_time | some_time | long_distance';
comment on column public.profiles.wants_more_kids is
  'yes | no | open';
comment on column public.profiles.referral_code is
  'Partner code (attorney, mediator, therapist) captured at first landing.';

alter table public.profiles drop constraint if exists profiles_divorce_stage_check;
alter table public.profiles add constraint profiles_divorce_stage_check
  check (divorce_stage is null or divorce_stage in ('separated', 'healing', 'ready'));

alter table public.profiles drop constraint if exists profiles_wants_more_kids_check;
alter table public.profiles add constraint profiles_wants_more_kids_check
  check (wants_more_kids is null or wants_more_kids in ('yes', 'no', 'open'));

alter table public.profiles drop constraint if exists profiles_custody_check;
alter table public.profiles add constraint profiles_custody_check
  check (custody_schedule is null or custody_schedule in ('none','full_time','most_time','half_time','some_time','long_distance'));

create index if not exists profiles_metro_idx on public.profiles (metro) where metro is not null;

-- Everyone outside a launch metro. Collected so a fourth metro can be opened
-- where demand actually is, rather than guessed at.
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  postal text,
  metro_requested text,
  referral_code text,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_idx on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- Anyone may join; nobody may read the list back through the API.
drop policy if exists waitlist_insert_any on public.waitlist;
create policy waitlist_insert_any on public.waitlist for insert to anon, authenticated with check (true);
