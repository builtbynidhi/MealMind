import type { SupabaseClient } from"@supabase/supabase-js";
import { cookFrom } from"@/lib/rag/cookFrom";
import type {
 Diet,
 RecommendBucket,
 RecommendResponse,
} from"@/lib/recipes/types";

export interface RecommendOptions {
 groceries: string[];
 diet?: Diet;
 cuisine?: string;
}

//"Feed your groceries once, get a recommended chart."Thin, deterministic
// composition over the coverage matcher: make-now + almost-there, plus a
// per-cuisine breakdown for the chart view. No LLM on this hot path.
export async function recommend(
 supabase: SupabaseClient,
 opts: RecommendOptions,
): Promise<RecommendResponse> {
 const { full, almost } = await cookFrom(supabase, {
 have: opts.groceries,
 diet: opts.diet,
 cuisine: opts.cuisine,
 maxMissing: 3,
 k: 60,
 });

 // Group make-now recipes by cuisine, ordered by best coverage within each.
 const buckets = new Map<string, RecommendBucket>();
 for (const r of full) {
 const c = r.cuisine ??"Other";
 const b = buckets.get(c) ?? { cuisine: c, recipes: [] };
 b.recipes.push(r);
 buckets.set(c, b);
 }
 const byCuisine = [...buckets.values()].sort(
 (a, b) => b.recipes.length - a.recipes.length || a.cuisine.localeCompare(b.cuisine),
 );

 return { makeNow: full, almost, byCuisine };
}
