import type { SupabaseClient } from"@supabase/supabase-js";
import { embedQuery } from"@/lib/rag/embed";
import { canonicalize } from"@/lib/domain/synonyms";
import { dietToTags } from"@/lib/recipes/diet";
import type {
 AlmostThereCard,
 CookFromResponse,
 Diet,
 RecipeCardData,
} from"@/lib/recipes/types";

export interface CookFromOptions {
 have: string[]; // raw user input; normalized here
 maxMissing?: number; // default 3
 diet?: Diet;
 cuisine?: string;
 query?: string; // optional free text → similarity blend
 k?: number; // max rows
}

interface MatchRow {
 recipe_id: string;
 title: string;
 cuisine: string | null;
 dietary_tags: string[] | null;
 servings: number | null;
 summary: string | null;
 total_count: number;
 have_count: number;
 missing_count: number;
 coverage: number | null;
 missing_names: string[] | null;
 similarity: number | null;
}

//"Cook from what I have": normalize the user's ingredients, call the coverage
// matcher, and split results into make-now (nothing missing) vs almost-there
// (missing 1..maxMissing items). Mirrors lib/rag/retrieve.ts conventions.
export async function cookFrom(
 supabase: SupabaseClient,
 opts: CookFromOptions,
): Promise<CookFromResponse> {
 const have = [...new Set(opts.have.map((h) => canonicalize(h)).filter(Boolean))];
 if (have.length === 0) return { full: [], almost: [] };

 const maxMissing = opts.maxMissing ?? 3;

 let queryEmbedding: string | null = null;
 if (opts.query?.trim()) {
 queryEmbedding = JSON.stringify(await embedQuery(opts.query));
 }

 const { data, error } = await supabase.rpc("match_recipes_by_ingredients", {
 have_names: have,
 max_missing: maxMissing,
 match_count: opts.k ?? 40,
 p_cuisine: opts.cuisine ?? null,
 p_include_tags: dietToTags(opts.diet) ?? null,
 query_embedding: queryEmbedding,
 });
 if (error) throw error;

 const rows = (data ?? []) as MatchRow[];
 const card = (r: MatchRow): RecipeCardData => ({
 recipe_id: r.recipe_id,
 title: r.title,
 cuisine: r.cuisine,
 dietary_tags: r.dietary_tags ?? [],
 servings: r.servings ?? 2,
 summary: r.summary,
 coverage: r.coverage ?? 0,
 have: r.have_count ?? 0,
 total: r.total_count ?? 0,
 });

 const full: RecipeCardData[] = [];
 const almost: AlmostThereCard[] = [];
 for (const r of rows) {
 if (r.missing_count === 0) full.push(card(r));
 else almost.push({ ...card(r), missing: r.missing_names ?? [] });
 }
 return { full, almost };
}
