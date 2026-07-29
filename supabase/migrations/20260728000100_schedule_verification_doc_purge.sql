-- Schedules the 90-day verification-document purge.
--
-- The Privacy Policy and the pre-upload consent screen both promise members that
-- their uploaded decree is deleted 90 days after a decision. This is what makes
-- that promise true. Without it the statement is inaccurate, and every document
-- ever uploaded is still sitting in the bucket.
--
-- The shared secret lives in Vault and nowhere else -- not in this repo, and not
-- as an env var on the edge function. The function checks the header it receives
-- by calling public.verify_purge_secret(), so the value never leaves the
-- database. Rotating it is one statement and needs no redeploy:
--
--   select vault.update_secret(
--            (select id from vault.secrets where name = 'purge_secret'),
--            '<new-random-string>');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Daily at 03:17 UTC. Off-peak, and the odd minute keeps it from contending
-- with everything else scheduled on the hour.
select cron.unschedule('purge-verification-docs')
where exists (select 1 from cron.job where jobname = 'purge-verification-docs');

select cron.schedule(
  'purge-verification-docs',
  '17 3 * * *',
  $$
  select net.http_post(
    url     := 'https://ignlircqmifvmxnmwjks.supabase.co/functions/v1/purge-verification-docs',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-purge-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'purge_secret')
               ),
    body    := '{}'::jsonb
  );
  $$
);

-- To confirm it is scheduled:      select * from cron.job where jobname = 'purge-verification-docs';
-- To confirm runs are succeeding:  select * from cron.job_run_details where jobid = (select jobid from cron.job where jobname = 'purge-verification-docs') order by start_time desc limit 10;
-- To remove:                       select cron.unschedule('purge-verification-docs');
