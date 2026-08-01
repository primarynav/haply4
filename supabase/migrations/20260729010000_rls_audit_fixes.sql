-- Fixes for the findings of a full RLS audit of the 22 public tables.
--
-- Each item below was reproduced against the live schema by impersonating the
-- `authenticated` role with a forged request.jwt.claims, then rolled back.

-- ---------------------------------------------------------------------------
-- 1. Blocks were unenforceable from inside a policy.
--
-- The profiles SELECT policy tested "did either of us block the other" with an
-- inline `exists (select 1 from blocks ...)`. That subquery is itself subject
-- to RLS on `blocks`, and the only policy there is `blocker_id = auth.uid()`.
-- So the "they blocked me" half of the test could never see a row: a blocked
-- member kept full read access to the profile of the person who blocked them.
--
-- A security definer helper reads `blocks` without RLS. It takes no blocker
-- argument, only the other party, so it cannot be used to probe blocks between
-- two unrelated members.
create or replace function public.viewer_blocked_with(target uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1 from public.blocks b
    where (b.blocker_id = target and b.blocked_id = auth.uid())
       or (b.blocker_id = auth.uid() and b.blocked_id = target)
  );
$function$;

revoke all on function public.viewer_blocked_with(uuid) from public;
grant execute on function public.viewer_blocked_with(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Consolidate the duplicated profiles write policies.
--
-- There were two identical INSERT policies and two near-identical UPDATE
-- policies; one of the UPDATE policies had no WITH CHECK at all. Collapse each
-- pair into a single explicit policy.
drop policy if exists "members insert own profile" on public.profiles;
drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "members update own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Rebuild the read policy on the definer helper so blocks actually bite.
drop policy if exists "view active verified profiles" on public.profiles;
create policy "view active verified profiles" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or (
      not is_banned
      and not is_paused
      and divorce_verified = true
      and public.viewer_is_divorce_verified()
      and not public.viewer_blocked_with(id)
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Photos ignored every visibility rule that profiles enforces.
--
-- `moderation = 'approved' or profile_id = auth.uid()` let any signed-in
-- account — unverified, blocked, or otherwise — read every approved photo row
-- in the table, including those of paused and banned members. Route the
-- decision through `profiles` instead: RLS on that table applies to this
-- subquery, so a photo is readable exactly when its owner's profile is, and
-- the rule cannot drift out of step with the profile rule again.
drop policy if exists "view approved photos" on public.photos;
create policy "view approved photos" on public.photos
  for select to authenticated
  using (
    profile_id = auth.uid()
    or (
      moderation = 'approved'
      and exists (select 1 from public.profiles p where p.id = photos.profile_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Prompt answers were world-readable to any signed-in account.
--
-- The policy was literally `using (true)`, so free-text profile prose was
-- readable regardless of verification, pause, ban, or block. Gate it the same
-- way as photos.
drop policy if exists "view answers" on public.prompt_answers;
create policy "view answers" on public.prompt_answers
  for select to authenticated
  using (
    profile_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = prompt_answers.profile_id)
  );

-- ---------------------------------------------------------------------------
-- 5. A member could rewrite who they were matched with.
--
-- The `unmatch` UPDATE policy had no WITH CHECK, so Postgres reused the USING
-- clause as the check: `user_a = auth.uid() or user_b = auth.uid()`. Staying on
-- one side of the row satisfied that while the *other* side was replaced with
-- an arbitrary third party. Since the messages policies only ask whether the
-- caller belongs to a live match, that fabricated a mutual match and opened a
-- chat with someone who never consented to it.
--
-- Column privileges make the identity columns unwritable; the policy keeps the
-- caller from attributing the unmatch to the other person.
revoke update on public.matches from authenticated;
revoke update on public.matches from anon;
grant update (ended_at, ended_by) on public.matches to authenticated;

drop policy if exists "unmatch" on public.matches;
create policy "unmatch" on public.matches
  for update to authenticated
  using (user_a = auth.uid() or user_b = auth.uid())
  with check (
    (user_a = auth.uid() or user_b = auth.uid())
    and (ended_by is null or ended_by = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 6. Rejected verification applicants counted as community members.
--
-- `is_community_member()` accepted the mere existence of a divorce_verifications
-- row, so an applicant whose document was rejected kept community access simply
-- by having applied. Keep access for anyone still in the pipeline, drop it for
-- a rejection.
create or replace function public.is_community_member()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        p.divorce_verified
        or exists (
          select 1 from public.divorce_verifications d
          where d.profile_id = p.id
            and d.status in ('pending', 'approved', 'more_info_needed')
        )
      )
  );
$function$;

-- ---------------------------------------------------------------------------
-- 7. The waitlist accepted anything from anyone.
--
-- Insert is deliberately open to anon — that is the signup path — but the check
-- was `true`, which accepts rows with no email at all. Require something
-- email-shaped and bounded in length.
drop policy if exists "waitlist_insert_any" on public.waitlist;
create policy "waitlist_insert_any" on public.waitlist
  for insert to anon, authenticated
  with check (
    email is not null
    and email like '%_@_%.__%'
    and char_length(email) between 6 and 320
  );
