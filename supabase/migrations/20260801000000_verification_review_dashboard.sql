-- A human review queue for divorce verifications.
--
-- Until now there was no admin capability of any kind: divorce_verifications
-- had exactly two policies, insert your own and read your own, so nobody could
-- read another member's submission, and nothing could act on the "Request human
-- review" the app already offers. That request was recorded and then went
-- nowhere.
--
-- The reviewer can open a decree only for submissions the member escalated
-- themselves, or that the automated check flagged as needing more information.
-- A routine approval is never opened by a person. That boundary is enforced in
-- three places — the queue, the RPC that hands out the path, and the storage
-- policy — rather than being a rule the UI is trusted to follow.

-- ---------------------------------------------------------------------------
-- Who is an admin
--
-- A table rather than a JWT claim: membership is visible in the database, can
-- be changed without reissuing anyone's token, and is covered by the same
-- backups. RLS is enabled with no policies at all, so the table is unreadable
-- and unwritable through the API — the only way in is a definer function or the
-- service role, and the only way to add an admin is a deliberate SQL statement.
create table if not exists public.admins (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  note       text,
  added_at   timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.viewer_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.profile_id = auth.uid());
$$;

revoke all on function public.viewer_is_admin() from public;
revoke all on function public.viewer_is_admin() from anon;
-- The signed-in app asks this to decide whether to show the review tab. It
-- reveals only whether *you* are an admin, never who else is.
grant execute on function public.viewer_is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- What every admin did
--
-- Reviewing verification documents is the most sensitive thing anyone does in
-- this product, so it is logged: who opened which decree and when, and who
-- decided what. Also unreadable through the API; it exists to be auditable
-- after the fact, not to be browsed by the people it records.
create table if not exists public.admin_actions (
  id              uuid primary key default gen_random_uuid(),
  admin_id        uuid not null references public.profiles(id),
  action          text not null,
  verification_id uuid,
  subject_id      uuid,
  detail          jsonb,
  created_at      timestamptz not null default now()
);
alter table public.admin_actions enable row level security;
create index if not exists admin_actions_created_idx on public.admin_actions (created_at desc);

-- ---------------------------------------------------------------------------
-- Let an admin set the trust columns
--
-- protect_trust_columns reverts any write to divorce_verified that does not
-- come from the service role, which is what stops a member verifying
-- themselves. A SECURITY DEFINER function does not change auth.role(), so the
-- review RPC below would have been silently reverted too. Admins are now an
-- explicit second exception — deliberately narrow, and still closed to every
-- ordinary member.
create or replace function public.protect_trust_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() is distinct from 'service_role' and not public.viewer_is_admin() then
    new.divorce_verified := old.divorce_verified;
    new.divorce_verified_at := old.divorce_verified_at;
    new.is_verified := old.is_verified;
    new.is_banned := old.is_banned;
    new.is_paused := old.is_paused;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- The queue
--
-- Only what a reviewer needs to make and record a decision. No date of birth,
-- no consent IP or user agent, no document path — the path comes from its own
-- RPC so that handing it out is always an audited act.
create or replace function public.get_review_queue()
returns table (
  verification_id  uuid,
  profile_id       uuid,
  member_name      text,
  status_claimed   text,
  status           text,
  member_message   text,
  submitted_at     timestamptz,
  escalated_at     timestamptz,
  document_purged  boolean,
  reason           text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    v.id,
    v.profile_id,
    p.name,
    v.status_claimed,
    v.status,
    v.member_message,
    v.created_at,
    v.escalated_at,
    v.document_purged_at is not null or v.document_path is null,
    case when v.escalated_at is not null then 'member asked for human review'
         else 'automated check needed more information' end
  from public.divorce_verifications v
  join public.profiles p on p.id = v.profile_id
  where public.viewer_is_admin()
    -- The two ways in. Anything else — including a clean automated approval —
    -- never reaches a person.
    and (v.escalated_at is not null or v.status = 'more_info_needed')
    and v.reviewed_by is null
  order by v.escalated_at nulls last, v.created_at;
$$;

revoke all on function public.get_review_queue() from public;
revoke all on function public.get_review_queue() from anon;
grant execute on function public.get_review_queue() to authenticated;

-- ---------------------------------------------------------------------------
-- Opening a document
--
-- Returns the storage path so the reviewer's own client can sign a short-lived
-- URL for it, and records that they did. Eligibility is re-checked here rather
-- than trusted from the queue, so a guessed id gets nothing.
create or replace function public.open_verification_document(p_verification_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_path text;
begin
  if not public.viewer_is_admin() then
    raise exception 'not authorised';
  end if;

  select v.document_path into v_path
  from public.divorce_verifications v
  where v.id = p_verification_id
    and (v.escalated_at is not null or v.status = 'more_info_needed')
    and v.document_purged_at is null;

  if v_path is null then
    -- Purged, never uploaded, or not one a person is allowed to open.
    raise exception 'document not available for review';
  end if;

  insert into public.admin_actions (admin_id, action, verification_id, detail)
  values (auth.uid(), 'opened_document', p_verification_id, jsonb_build_object('path', v_path));

  return v_path;
end;
$$;

revoke all on function public.open_verification_document(uuid) from public;
revoke all on function public.open_verification_document(uuid) from anon;
grant execute on function public.open_verification_document(uuid) to authenticated;

-- The storage layer enforces the same rule independently. verification-docs had
-- no SELECT policy at all, so nothing but the service role could read it; this
-- opens exactly the eligible objects to admins and nothing else.
drop policy if exists "admins read escalated divorce docs" on storage.objects;
create policy "admins read escalated divorce docs" on storage.objects
  for select using (
    bucket_id = 'verification-docs'
    and public.viewer_is_admin()
    and exists (
      select 1 from public.divorce_verifications v
      where v.document_path = storage.objects.name
        and (v.escalated_at is not null or v.status = 'more_info_needed')
        and v.document_purged_at is null
    )
  );

-- ---------------------------------------------------------------------------
-- Recording a decision
create or replace function public.decide_verification(
  p_verification_id uuid,
  p_decision        text,
  p_note            text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile uuid;
  v_claimed text;
begin
  if not public.viewer_is_admin() then
    raise exception 'not authorised';
  end if;
  if p_decision not in ('approved', 'rejected', 'more_info_needed') then
    raise exception 'invalid decision';
  end if;

  select v.profile_id, v.status_claimed into v_profile, v_claimed
  from public.divorce_verifications v
  where v.id = p_verification_id;

  if v_profile is null then
    raise exception 'no such verification';
  end if;

  update public.divorce_verifications
  set status = p_decision,
      reviewer_note = p_note,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_verification_id;

  -- The badge is the whole point of the feature, so a decision has to move it.
  -- Anything other than an approval leaves the member unverified rather than
  -- silently keeping a badge they were granted earlier.
  if p_decision = 'approved' then
    update public.profiles
    set divorce_verified = true,
        divorce_verified_at = now(),
        divorce_status = v_claimed
    where id = v_profile;
  else
    update public.profiles
    set divorce_verified = false,
        divorce_verified_at = null
    where id = v_profile;
  end if;

  insert into public.admin_actions (admin_id, action, verification_id, subject_id, detail)
  values (auth.uid(), 'decided', p_verification_id, v_profile,
          jsonb_build_object('decision', p_decision, 'note', p_note));

  return p_decision;
end;
$$;

revoke all on function public.decide_verification(uuid, text, text) from public;
revoke all on function public.decide_verification(uuid, text, text) from anon;
grant execute on function public.decide_verification(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- The first admin, resolved by email rather than a pasted id.
insert into public.admins (profile_id, note)
select u.id, 'founder'
from auth.users u
where u.email = 'james@primarynav.com'
on conflict (profile_id) do nothing;
