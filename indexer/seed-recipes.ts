// Seeds the recipe knowledge base (ingredients + recipes + links) via the service
// role (bypasses RLS). Idempotent: recipes are keyed by a stable`source`slug, so
// re-running only inserts what's missing. Run:`npm run seed`.
//
// Recipe data now lives in indexer/data/* (curated + generated). Aisle map and
// the Seed type are imported from there so the seeder, validator and generator
// share one source of truth.

import { config } from"dotenv";
config({ path:".env.local"});

import { createAdminClient } from"@/lib/supabase/admin";
import { canonicalize } from"@/lib/domain/synonyms";
import { AISLE_RAW } from"./data/aisles";
import { allRecipes } from"./data";

const RECIPES = allRecipes();

async function main() {
 const db = createAdminClient();

 // 1. Upsert the unique ingredient set with aisles.
 const aisleByNorm = new Map<string, string>();
 for (const [raw, aisle] of Object.entries(AISLE_RAW)) aisleByNorm.set(canonicalize(raw), aisle);

 const display = new Map<string, string>();
 for (const r of RECIPES)
 for (const ing of r.ingredients) {
 const n = canonicalize(ing.name);
 if (!display.has(n)) display.set(n, ing.name);
 }

 const ingredientRows = [...display.entries()].map(([norm, name]) => ({
 name,
 normalized_name: norm,
 aisle: aisleByNorm.get(norm) ??"Other",
 }));
 const { error: ingErr } = await db.from("ingredients").upsert(ingredientRows, { onConflict:"normalized_name"});
 if (ingErr) throw ingErr;

 const { data: ingData } = await db.from("ingredients").select("id, normalized_name");
 const ingId = new Map((ingData ?? []).map((i: any) => [i.normalized_name, i.id]));

 // 2. Insert recipes (skip ones already seeded by slug).
 let inserted = 0;
 for (const r of RECIPES) {
 const source =`seed:${r.slug}`;
 const { data: existing } = await db.from("recipes").select("id").eq("source", source).maybeSingle();
 if (existing) continue;

 const { data: rec, error } = await db
 .from("recipes")
 .insert({
 title: r.title, summary: r.summary, cuisine: r.cuisine,
 dietary_tags: r.tags, servings: r.servings, instructions: r.instructions, source,
 })
 .select("id")
 .single();
 if (error || !rec) {
 console.error("recipe insert failed:", r.title, error?.message);
 continue;
 }

 const links = r.ingredients
 .map((ing) => ({
 recipe_id: rec.id,
 ingredient_id: ingId.get(canonicalize(ing.name)),
 quantity: ing.qty ?? null,
 unit: ing.unit ?? null,
 }))
 .filter((l) => l.ingredient_id);
 if (links.length) await db.from("recipe_ingredients").insert(links);
 inserted++;
 }

 console.log(`✓ Ingredients: ${ingredientRows.length}. Recipes inserted: ${inserted}/${RECIPES.length}.`);
 console.log("Next: npm run embed");
}

main()
 .then(() => process.exit(0))
 .catch((e) => {
 console.error(e);
 process.exit(1);
 });
