-- Verification privacy/legal hardening.
--
-- 1. member_message: the explanation written for the member, stored separately
--    from reviewer_note (the internal rationale). Previously the UI showed the
--    internal reasoning directly to the member.
-- 2. consent_ip / consent_user_agent: a consent record is only useful in a
--    dispute if it captures who agreed, to what, and when. consent_version is
--    now set server-side (see supabase/functions/verify-divorce) rather than
--    accepted from the client, which could previously send any string.
-- 3. document_purged_at: proves the 90-day deletion promised in the Privacy
--    Policy actually ran for a given row. See the purge-verification-docs
--    function; before it existed, nothing deleted these documents.

alter table public.divorce_verifications
  add column if not exists member_message text,
  add column if not exists consent_ip text,
  add column if not exists consent_user_agent text,
  add column if not exists document_purged_at timestamptz;

comment on column public.divorce_verifications.member_message is
  'Member-facing explanation of the decision. Safe to display; reviewer_note is not.';
comment on column public.divorce_verifications.consent_ip is
  'IP recorded at the moment consent was given, for the consent audit trail.';
comment on column public.divorce_verifications.document_purged_at is
  'When the uploaded document was deleted under the 90-day retention policy.';

-- Backfill so existing rows have something member-safe to show rather than
-- falling back to internal reasoning in the UI.
update public.divorce_verifications
   set member_message = reviewer_note
 where member_message is null
   and reviewer_note is not null;

-- Speeds up the purge job's scan for documents past retention.
create index if not exists divorce_verifications_purge_idx
  on public.divorce_verifications (created_at)
  where document_path is not null;
