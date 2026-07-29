-- Authorisation for the verification-document purge job.
--
-- The secret is held only in Vault. The edge function does not get a copy: it
-- passes the header value it received to verify_purge_secret() and is told yes
-- or no. That keeps the value out of the repo and out of the function's
-- configuration, and makes rotation a single SQL statement with no redeploy.
--
-- The secret value itself is deliberately not in this file. Set it once per
-- environment with:
--
--   select vault.create_secret('<random-string>', 'purge_secret',
--            'Shared secret authorising the verification-document purge job');

create extension if not exists pg_cron;
create extension if not exists pg_net;

/*
  security definer so it can read the vault; locked to service_role so no member
  JWT can reach it and turn it into an oracle. Constant-time comparison so a
  caller cannot recover the secret byte by byte from response timings.
*/
create or replace function public.verify_purge_secret(candidate text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  expected text;
begin
  select decrypted_secret into expected from vault.decrypted_secrets where name = 'purge_secret';
  if expected is null or candidate is null then
    return false;
  end if;
  -- Length is not secret; content comparison is digest-based so it does not
  -- short-circuit on the first differing byte.
  return extensions.digest(expected, 'sha256') = extensions.digest(candidate, 'sha256')
     and length(expected) = length(candidate);
end $$;

revoke all on function public.verify_purge_secret(text) from public, anon, authenticated;
grant execute on function public.verify_purge_secret(text) to service_role;
