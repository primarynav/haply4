-- Schedules the 90-day verification-document purge.
--
-- The Privacy Policy and the pre-upload consent screen both promise members that
-- their uploaded decree is deleted 90 days after a decision. This is what makes
-- that promise true. Without it the statement is inaccurate, and every document
-- ever uploaded is still sitting in the bucket.
--
-- BEFORE APPLYING, set the two values below. The secret must match the
-- PURGE_SECRET env var set on the purge-verification-docs edge function:
--
--   select vault.create_secret('<random-string>', 'purge_secret');
--   supabase secrets set PURGE_SECRET='<same-random-string>'
--
-- Then replace <PROJECT_REF> with the project ref.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Daily at 03:17 UTC. Off-peak, and the exact minute keeps it from contending
-- with everything else scheduled on the hour.
select cron.schedule(
  'purge-verification-docs',
  '17 3 * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/purge-verification-docs',
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
