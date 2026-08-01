-- A verification bypass for allowlisted test accounts.
--
-- Being blunt about what this is: a way to mint the product's core trust signal
-- without any evidence behind it. It exists because testing the app end to end
-- otherwise means holding a real decree and waiting on a real review, so the
-- tester account could never get past the gate everything else sits behind.
--
-- It is worth having while there is nothing else to test against, and worth
-- deleting before there are members who could be deceived by it. To remove:
-- drop bypass_verification and viewer_can_bypass_verification, drop
-- test_accounts, and take the third clause back out of protect_trust_columns.

-- Same shape as admins: RLS on, no policies at all, so the table cannot be read
-- or written through the API and nobody can add themselves. The only way onto
-- the list is a deliberate SQL statement.
create table if not exists public.test_accounts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  note       text,
  added_at   timestamptz not null default now()
);
alter table public.test_accounts enable row level security;

create or replace function public.viewer_can_bypass_verification()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.test_accounts t where t.profile_id = auth.uid());
$$;

revoke all on function public.viewer_can_bypass_verification() from public;
revoke all on function public.viewer_can_bypass_verification() from anon;
-- The app asks this to decide whether to offer the skip button. Answering true
-- grants nothing on its own; the RPC below checks again.
grant execute on function public.viewer_can_bypass_verification() to authenticated;

-- A third exception, alongside the service role and admins. Everything else
-- still has its write to these columns silently reverted — confirmed by test:
-- an ordinary member setting divorce_verified on themselves still lands false.
create or replace function public.protect_trust_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() is distinct from 'service_role'
     and not public.viewer_is_admin()
     and not public.viewer_can_bypass_verification() then
    new.divorce_verified := old.divorce_verified;
    new.divorce_verified_at := old.divorce_verified_at;
    new.is_verified := old.is_verified;
    new.is_banned := old.is_banned;
    new.is_paused := old.is_paused;
  end if;
  return new;
end;
$$;

create or replace function public.bypass_verification(p_status text default 'divorced')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.viewer_can_bypass_verification() then
    raise exception 'not a test account';
  end if;
  if p_status not in ('divorced', 'legally_separated') then
    raise exception 'invalid status';
  end if;

  update public.profiles
  set divorce_verified = true,
      divorce_verified_at = now(),
      divorce_status = p_status
  where id = auth.uid();

  -- Logged, so a badge granted this way is traceable rather than
  -- indistinguishable from one that was actually earned.
  insert into public.admin_actions (admin_id, action, subject_id, detail)
  values (auth.uid(), 'test_bypass_verification', auth.uid(),
          jsonb_build_object('status', p_status));

  return true;
end;
$$;

revoke all on function public.bypass_verification(text) from public;
revoke all on function public.bypass_verification(text) from anon;
grant execute on function public.bypass_verification(text) to authenticated;

-- The main tester, resolved by email rather than a pasted id.
insert into public.test_accounts (profile_id, note)
select u.id, 'main tester'
from auth.users u
where u.email = 'jazper291@gmail.com'
on conflict (profile_id) do nothing;
