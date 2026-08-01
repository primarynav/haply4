-- Second half of the RLS audit: shrink the SECURITY DEFINER surface that
-- PostgREST exposes. Definer functions run with the owner's rights and so skip
-- the row policies tightened in the previous migration; anything reachable at
-- /rest/v1/rpc/* therefore needs the same scrutiny as a policy.

-- ---------------------------------------------------------------------------
-- 1. A trigger function was published as a callable RPC.
--
-- `protect_trust_columns()` is the trigger body that reverts member edits to
-- divorce_verified / is_banned / is_paused. It was executable by anon and
-- authenticated via /rest/v1/rpc/protect_trust_columns. Calling it outside a
-- trigger context errors out, so nothing was exploitable, but a trigger body
-- has no business in the public API.
--
-- The grant came from the PUBLIC default that Postgres applies to every new
-- function, not from a grant to anon or authenticated, so it has to be revoked
-- from PUBLIC — revoking from those two roles individually leaves the inherited
-- privilege in place.
--
-- Postgres checks TRIGGER privilege on the table when the trigger is created,
-- not EXECUTE on the function when it fires, so the trigger keeps working. That
-- was confirmed against the live schema after the revoke: an authenticated
-- member's attempt to set is_banned and divorce_verified on their own profile
-- still came back reverted.
revoke all on function public.protect_trust_columns() from public;
revoke all on function public.protect_trust_columns() from anon;
revoke all on function public.protect_trust_columns() from authenticated;

-- ---------------------------------------------------------------------------
-- 2. A dormant RPC returned whole profile rows.
--
-- `get_daily_set(p_limit)` is declared `returns setof profiles`, so it hands
-- the caller every column — postal, exact birthdate, terms_accepted_at,
-- referral_source — for each candidate. Being SECURITY DEFINER, row policies
-- do not trim it. Its gating (both parties verified, target not banned or
-- paused, blocks respected) is sound; the problem is column breadth.
--
-- Nothing in the app or the edge functions calls it, so it leaves the public
-- API. If the discover feed is wired up later, give it an explicit column list
-- covering only what the cards render, then grant execute to authenticated
-- again — do not restore SETOF profiles.
revoke all on function public.get_daily_set(integer) from anon;
revoke all on function public.get_daily_set(integer) from authenticated;
