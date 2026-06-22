// Embeds every recipe (that isn't already embedded) into recipe_embeddings using
// the local bge-small model. Runs in this warm Node process — $0/call. Idempotent.
// Run after seeding:`npm run embed`(or`npm run setup`for seed + embed).

import { config } from"dotenv";
config({ path:".env.local"});

import { createAdminClient } from"@/lib/supabase/admin";
import { embedPassage } from"@/lib/rag/embed";

async function main() {
 const db = createAdminClient();

 const [{ data: recipes }, { data: existing }, { data: ris }] = await Promise.all([
 db.from("recipes").select("id, title, summary, cuisine, dietary_tags"),
 db.from("recipe_embeddings").select("recipe_id"),
 db.from("recipe_ingredients").select("recipe_id, ingredients(name)"),
 ]);

 const done = new Set((existing ?? []).map((e: any) => e.recipe_id));
 const ingByRecipe = new Map<string, string[]>();
 for (const row of (ris ?? []) as any[]) {
 const list = ingByRecipe.get(row.recipe_id) ?? [];
 if (row.ingredients?.name) list.push(row.ingredients.name);
 ingByRecipe.set(row.recipe_id, list);
 }

 let embedded = 0;
 for (const r of (recipes ?? []) as any[]) {
 if (done.has(r.id)) continue;
 const text = [
 r.title,
 r.cuisine,
 (r.dietary_tags ?? []).join(","),
 r.summary,
"Ingredients:"+ (ingByRecipe.get(r.id) ?? []).join(","),
 ]
 .filter(Boolean)
 .join(".");

 const embedding = await embedPassage(text);
 const { error } = await db.from("recipe_embeddings").upsert({
 recipe_id: r.id,
 chunk_index: 0,
 chunk_text: text,
 embedding: JSON.stringify(embedding), // pgvector accepts the"[...]"text form
 });
 if (error) console.error("embed failed:", r.title, error.message);
 else {
 embedded++;
 console.log(`embedded: ${r.title}`);
 }
 }

 console.log(`✓ Embedded ${embedded} recipe(s). Knowledge base is ready.`);
}

main()
 .then(() => process.exit(0))
 .catch((e) => {
 console.error(e);
 process.exit(1);
 });
