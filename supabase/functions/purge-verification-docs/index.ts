import { createClient } from 'npm:@supabase/supabase-js';

/**
 * Deletes verification documents 90 days after their decision.
 *
 * The Privacy Policy and the pre-upload consent screen both tell members their
 * uploaded decree is deleted after 90 days. Until this ran, nothing deleted
 * anything — the documents accumulated indefinitely. An unkept retention promise
 * is a false statement about data handling, and it converts any future breach of
 * this bucket into a much worse problem: the records were not supposed to exist.
 *
 * Scheduled by supabase/migrations/*_schedule_verification_doc_purge.sql. Also
 * safe to invoke by hand. Not member-facing: requires PURGE_SECRET.
 *
 * document_path is nulled in the same pass so the row still records that a
 * document was reviewed, without retaining a pointer to a deleted object.
 */

const RETENTION_DAYS = 90;
const BATCH = 500;

Deno.serve(async (req: Request) => {
  const secret = Deno.env.get('PURGE_SECRET');
  if (!secret) return new Response(JSON.stringify({ error: 'not_configured' }), { status: 503 });
  if (req.headers.get('x-purge-secret') !== secret) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'not_configured' }), { status: 503 });

  const admin = createClient(supabaseUrl, serviceKey);
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: rows, error } = await admin
    .from('divorce_verifications')
    .select('id, document_path')
    .not('document_path', 'is', null)
    .lt('created_at', cutoff)
    .limit(BATCH);

  if (error) {
    console.error('purge-verification-docs query failed:', error.message);
    return new Response(JSON.stringify({ error: 'db_error', detail: error.message }), { status: 500 });
  }
  if (!rows?.length) return new Response(JSON.stringify({ purged: 0 }), { status: 200 });

  const paths = rows.map((r) => r.document_path as string);
  const { error: removeErr } = await admin.storage.from('verification-docs').remove(paths);

  // Clearing document_path is what stops the next run from retrying forever, so
  // only do it once the objects are actually gone.
  if (removeErr) {
    console.error('purge-verification-docs storage remove failed:', removeErr.message);
    return new Response(JSON.stringify({ error: 'storage_error', detail: removeErr.message }), { status: 500 });
  }

  const { error: updateErr } = await admin
    .from('divorce_verifications')
    .update({ document_path: null, document_purged_at: new Date().toISOString() })
    .in(
      'id',
      rows.map((r) => r.id)
    );
  if (updateErr) {
    console.error('purge-verification-docs row update failed:', updateErr.message);
    return new Response(JSON.stringify({ error: 'db_error', detail: updateErr.message }), { status: 500 });
  }

  console.log(`purge-verification-docs removed ${paths.length} document(s) older than ${RETENTION_DAYS} days`);
  return new Response(JSON.stringify({ purged: paths.length }), { status: 200 });
});
