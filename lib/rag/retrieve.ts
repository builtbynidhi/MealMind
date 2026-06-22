import type { SupabaseClient } from"@supabase/supabase-js";
import { embedQuery } from"@/lib/rag/embed";
import type { PromptRecipe } from"@/lib/llm/prompts";

export interface RetrieveOptions {
 includeTags?: string[];
 excludeIngredients?: string[];
 k?: number;
}

// Embed the query, run cosine search via the match_recipes RPC (tag-filtered +
// allergen-excluded), then hydrate the matches into the catalog shape the
// plan-assembly prompt needs — preserving similarity order.
export async function retrieveRecipes(
 supabase: SupabaseClient,
 query: string,
 opts: RetrieveOptions = {},
): Promise<PromptRecipe[]> {
 const embedding = await embedQuery(query);

 const { data: matches, error } = await supabase.rpc("match_recipes", {
 query_embedding: JSON.stringify(embedding), // pgvector"[...]"text form
 match_count: opts.k ?? 20,
 include_tags: opts.includeTags?.length ? opts.includeTags : null,
 exclude_ingredient_names: opts.excludeIngredients?.length ? opts.excludeIngredients : null,
 });
 if (error) throw error;

 const orderedIds: string[] = (matches ?? []).map((m: any) => m.recipe_id);
 if (orderedIds.length === 0) return [];

 const [{ data: recipes }, { data: recipeIngredients }] = await Promise.all([
 supabase.from("recipes").select("id,title,cuisine,dietary_tags,servings").in("id", orderedIds),
 supabase.from("recipe_ingredients").select("recipe_id, ingredients(name)").in("recipe_id", orderedIds),
 ]);

 const ingredientsByRecipe = new Map<string, string[]>();
 for (const row of (recipeIngredients ?? []) as any[]) {
 const list = ingredientsByRecipe.get(row.recipe_id) ?? [];
 if (row.ingredients?.name) list.push(row.ingredients.name);
 ingredientsByRecipe.set(row.recipe_id, list);
 }

 const byId = new Map((recipes ?? []).map((r: any) => [r.id, r]));
 return orderedIds
 .map((id): PromptRecipe | null => {
 const r = byId.get(id);
 if (!r) return null;
 return {
 id: r.id,
 title: r.title,
 cuisine: r.cuisine,
 dietary_tags: r.dietary_tags ?? [],
 servings: r.servings ?? 2,
 ingredients: ingredientsByRecipe.get(id) ?? [],
 };
 })
 .filter((r): r is PromptRecipe => r !== null);
}
