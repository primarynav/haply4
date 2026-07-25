import { createClient } from '@supabase/supabase-js';

// haply-production (Supabase). The publishable key is safe to ship to browsers;
// data access is enforced by Row Level Security policies on every table.
const SUPABASE_URL = 'https://ignlircqmifvmxnmwjks.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-kjI-2PgXdvUG1zivC2T6g_ADFLQ_TK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
