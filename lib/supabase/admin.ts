import { createClient } from"@supabase/supabase-js";
import { env } from"@/lib/env";

// Service-role client — BYPASSES Row-Level Security. Server-only.
// Use exclusively for trusted backend work: the indexer (seeding/embedding the
// recipe KB) and cron jobs (cross-household batch work, writing job_runs).
// NEVER import this into client components or expose the service role key.
export function createAdminClient() {
 return createClient(env.supabaseUrl(), env.supabaseServiceRole(), {
 auth: { persistSession: false, autoRefreshToken: false },
 });
}
