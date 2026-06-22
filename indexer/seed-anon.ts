// One-off loader+embedder that writes via the ANON key — works only while the
// temporary`tmp anon write ...`RLS policies are in place (added/dropped via MCP
// around this run). Mirrors seed-recipes.ts + build-embeddings.ts. Idempotent.
// Safe to delete afterwards.

import { config } from"dotenv";
config({ path:".env.local"});

import { createClient } from"@supabase/supabase-js";
import { canonicalize } from"@/lib/domain/synonyms";
import { embedPassage } from"@/lib/rag/embed";
import { AISLE_RAW } from"./data/aisles";
import { allRecipes } from"./data";

const db = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 { auth: { persistSession: false, autoRefreshToken: false } },
);

const chunk = <T>(a: T[], n: number): T[][] => {
 const out: T[][] = [];
 for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n));
 return out;
};

async function main() {
 const RECIPES = allRecipes();

 // 1. Ingredients (upsert by normalized_name).
 const aisleByNorm = new Map<string, string>();
 for (const [raw, aisle] of Object.entries(AISLE_RAW)) aisleByNorm.set(canonicalize(raw), aisle);
 const display = new Map<string, string>();
 for (const r of RECIPES)
 for (const ing of r.ingredients) {
 const n = canonicalize(ing.name);
 if (n && !display.has(n)) display.set(n, ing.name);
 }
 const ingredientRows = [...display.entries()].map(([norm, name]) => ({
 name, normalized_name: norm, aisle: aisleByNorm.get(norm) ??"Other",
 }));
 for (const part of chunk(ingredientRows, 200)) {
 const { error } = await db.from("ingredients").upsert(part, { onConflict:"normalized_name"});
 if (error) throw new Error("ingredients:"+ error.message);
 }
 const { data: ingData } = await db.from("ingredients").select("id, normalized_name");
 const ingId = new Map((ingData ?? []).map((i: any) => [i.normalized_name, i.id]));
 console.log(`ingredients: ${ingredientRows.length}`);

 // 2. Recipes (skip already-seeded by source slug).
 const { data: existingRecipes } = await db.from("recipes").select("source");
 const haveSource = new Set((existingRecipes ?? []).map((r: any) => r.source));
 const toInsert = RECIPES.filter((r) => !haveSource.has(`seed:${r.slug}`));
 for (const part of chunk(toInsert, 100)) {
 const rows = part.map((r) => ({
 title: r.title, summary: r.summary, cuisine: r.cuisine,
 dietary_tags: r.tags, servings: r.servings, instructions: r.instructions, source:`seed:${r.slug}`,
 }));
 const { error } = await db.from("recipes").insert(rows);
 if (error) throw new Error("recipes:"+ error.message);
 }
 console.log(`recipes inserted: ${toInsert.length} (skipped ${RECIPES.length - toInsert.length})`);

 // Map slug → recipe id.
 const { data: allRecs } = await db.from("recipes").select("id, source");
 const idBySource = new Map((allRecs ?? []).map((r: any) => [r.source, r.id]));

 // 3. Links (insert; ignore dup PK errors per chunk).
 const { data: existingLinks } = await db.from("recipe_ingredients").select("recipe_id");
 const linkedRecipeIds = new Set((existingLinks ?? []).map((l: any) => l.recipe_id));
 const links: any[] = [];
 for (const r of RECIPES) {
 const rid = idBySource.get(`seed:${r.slug}`);
 if (!rid || linkedRecipeIds.has(rid)) continue;
 const seen = new Set<string>();
 for (const ing of r.ingredients) {
 const norm = canonicalize(ing.name);
 const iid = ingId.get(norm);
 if (!iid || seen.has(norm)) continue;
 seen.add(norm);
 links.push({ recipe_id: rid, ingredient_id: iid, quantity: ing.qty ?? null, unit: ing.unit ?? null });
 }
 }
 for (const part of chunk(links, 500)) {
 const { error } = await db
 .from("recipe_ingredients")
 .upsert(part, { onConflict:"recipe_id,ingredient_id", ignoreDuplicates: true });
 if (error) throw new Error("links:"+ error.message);
 }
 console.log(`links inserted: ${links.length}`);

 // 4. Embeddings (skip recipes already embedded).
 const { data: embRows } = await db.from("recipe_embeddings").select("recipe_id");
 const embedded = new Set((embRows ?? []).map((e: any) => e.recipe_id));
 let done = 0;
 for (const r of RECIPES) {
 const rid = idBySource.get(`seed:${r.slug}`);
 if (!rid || embedded.has(rid)) continue;
 const text = [r.title, r.cuisine, r.tags.join(","), r.summary,"Ingredients:"+ r.ingredients.map((i) => i.name).join(",")]
 .filter(Boolean)
 .join(".");
 const embedding = await embedPassage(text);
 const { error } = await db.from("recipe_embeddings").upsert({
 recipe_id: rid, chunk_index: 0, chunk_text: text, embedding: JSON.stringify(embedding),
 });
 if (error) console.error("embed failed:", r.title, error.message);
 else { done++; if (done % 25 === 0) console.log(`embedded ${done}…`); }
 }
 console.log(`✓ embedded ${done} new recipe(s). Done.`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
