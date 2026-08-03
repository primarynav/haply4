-- Tell people something happened.
--
-- A match made today is invisible until the other person happens to reopen the
-- app, and a message sits unread with nothing to indicate it. Every member
-- acquired before this is fixed matches, never finds out, and leaves — which
-- makes this worth more than any amount of acquisition spend.
--
-- Two halves. Rows are created here, by trigger, so nothing depends on the
-- client noticing; delivery by email is a separate job that reads them.

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind       text not null check (kind in ('match', 'message')),
  -- The match this concerns, so opening a conversation can clear it.
  match_id   uuid references public.matches(id) on delete cascade,
  actor_id   uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at    timestamptz,
  -- Stamped once an email has gone out, so a digest never sends twice.
  emailed_at timestamptz
);

alter table public.notifications enable row level security;

-- Yours to read and to mark read. Never to create: a notification is a
-- statement that something happened, and only the database gets to say so.
drop policy if exists "read own notifications" on public.notifications;
create policy "read own notifications" on public.notifications
  for select using (profile_id = auth.uid());

drop policy if exists "mark own notifications read" on public.notifications;
create policy "mark own notifications read" on public.notifications
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create index if not exists notifications_unread_idx
  on public.notifications (profile_id, kind) where read_at is null;
create index if not exists notifications_unemailed_idx
  on public.notifications (created_at) where emailed_at is null and read_at is null;

-- ---------------------------------------------------------------------------
-- A match notifies both sides.
create or replace function public.notify_on_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (profile_id, kind, match_id, actor_id)
  values (new.user_a, 'match', new.id, new.user_b),
         (new.user_b, 'match', new.id, new.user_a);
  return new;
end;
$$;

drop trigger if exists on_match_notify on public.matches;
create trigger on_match_notify after insert on public.matches
  for each row execute function public.notify_on_match();

-- ---------------------------------------------------------------------------
-- A message notifies the other party — once per conversation until they look.
--
-- Without the debounce, someone sending five messages generates five rows and
-- five emails, which is how a well-meant notification becomes a reason to
-- leave. One unread marker per conversation is enough to bring someone back.
create or replace function public.notify_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient uuid;
begin
  select case when m.user_a = new.sender_id then m.user_b else m.user_a end
  into v_recipient
  from public.matches m
  where m.id = new.match_id;

  if v_recipient is null then
    return new;
  end if;

  if exists (
    select 1 from public.notifications n
    where n.profile_id = v_recipient
      and n.kind = 'message'
      and n.match_id = new.match_id
      and n.read_at is null
  ) then
    return new;
  end if;

  insert into public.notifications (profile_id, kind, match_id, actor_id)
  values (v_recipient, 'message', new.match_id, new.sender_id);
  return new;
end;
$$;

drop trigger if exists on_message_notify on public.messages;
create trigger on_message_notify after insert on public.messages
  for each row execute function public.notify_on_message();

-- ---------------------------------------------------------------------------
-- What the tab badges show.
create or replace function public.get_unread_counts()
returns table (matches integer, messages integer)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) filter (where kind = 'match')::integer,
    count(*) filter (where kind = 'message')::integer
  from public.notifications
  where profile_id = auth.uid() and read_at is null;
$$;

revoke all on function public.get_unread_counts() from public;
revoke all on function public.get_unread_counts() from anon;
grant execute on function public.get_unread_counts() to authenticated;

/** Clear a badge. Opening the tab is the acknowledgement. */
create or replace function public.mark_notifications_read(p_kind text default null)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update public.notifications
  set read_at = now()
  where profile_id = auth.uid()
    and read_at is null
    and (p_kind is null or kind = p_kind);
$$;

revoke all on function public.mark_notifications_read(text) from public;
revoke all on function public.mark_notifications_read(text) from anon;
grant execute on function public.mark_notifications_read(text) to authenticated;
