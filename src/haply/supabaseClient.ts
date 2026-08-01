import { createClient } from '@supabase/supabase-js';

const PRODUCTION_URL = 'https://ignlircqmifvmxnmwjks.supabase.co';

/**
 * Which Supabase project this build talks to.
 *
 * Defaults to haply-production, so an ordinary build behaves exactly as before.
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to point a build
 * somewhere else — which is what makes a staging deploy mean anything. Without
 * them a preview deploy is only a preview of the code: it signs real people up
 * to the production database and writes real likes and matches into it.
 *
 * The publishable key is safe to ship to browsers either way; data access is
 * enforced by Row Level Security on every table, not by keeping this secret.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || PRODUCTION_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_-kjI-2PgXdvUG1zivC2T6g_ADFLQ_TK';

/**
 * Whether this build is pointed away from production. Worth surfacing in the
 * UI of a staging deploy: a site that looks identical to production but holds
 * different data is easy to mistake for the real thing.
 */
export const IS_STAGING_BACKEND = SUPABASE_URL !== PRODUCTION_URL;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
