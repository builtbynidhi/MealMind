// LLM recipe generator → writes indexer/data/generated.json in the Seed shape.
// Resumable + idempotent (dedupes by slug & title). Run:`npm run generate`
// (optionally`npm run generate -- 400`to set the target count).
//
// Honest caveat: at volume, quantities/combinations are LLM-drafted and will
// contain errors.`npm run validate`hard-gates only the dangerous case
// (veg/non-veg / meat misclassification). Do not market as chef-verified.

import { config } from"dotenv";
config({ path:".env.local"});

import { readFileSync, writeFileSync, existsSync } from"node:fs";
import { join } from"node:path";
import { z } from"zod";
import { generateJSON } from"@/lib/llm/provider";
import { normalizeName } from"@/lib/domain/normalize";
import type { Seed } from"./data/types";
import { CANONICAL_CUISINES } from"./data/types";
import { CURATED } from"./data/curated";

const OUT = join(process.cwd(),"indexer/data/generated.json");
const TARGET = Number(process.argv[2] ?? 400);
const BATCH = 12;

// Tolerant schema: the LLM occasionally returns instructions as an array of
// steps, qty as a numeric string, etc. Coerce those rather than dropping recipes.
const num = z.coerce.number().optional();
const IngSchema = z.object({
 name: z.string().min(1),
 qty: num,
 unit: z.string().optional(),
});
const SeedSchema = z.object({
 slug: z.string().min(1),
 title: z.string().min(1),
 summary: z.string().min(1),
 cuisine: z.string().min(1),
 tags: z.array(z.string()).min(1),
 servings: z.coerce.number().int().min(1).max(12),
 instructions: z.preprocess(
 (v) => (Array.isArray(v) ? v.join("") : v),
 z.string().min(1),
 ),
 ingredients: z.array(IngSchema).min(3),
});
// Validate each recipe individually so one malformed entry doesn't lose the batch.
const BatchSchema = z.object({ recipes: z.array(z.any()) });

const SYSTEM =
"You are a precise recipe data generator. Output ONLY valid JSON matching the requested shape."+
"Use real, authentic, well-known dishes. Ingredient names must be simple, lowercase, singular grocery-store"+
"names (e.g.'chicken','onion','soy sauce','basmati rice') with NO brand names or descriptors."+
"Quantities must be realistic for the stated servings. Slugs must be unique kebab-case."+
"Use DECIMAL numbers only for qty (e.g. 0.5, never fractions like 1/2). Output strictly valid JSON.";

function prompt(cuisine: string, diet:"veg"|"non-veg", avoid: string[]): string {
 const dietRule =
 diet ==="veg"
 ?"Every recipe must be vegetarian or vegan (NO meat, poultry, fish or seafood)."+
"Tags MUST include'vegetarian'(or'vegan'if it has no dairy, egg or honey)."
 :"Every recipe MUST contain at least one meat or seafood ingredient (chicken, mutton, lamb, beef,"+
"pork, fish, prawns, etc.). Tags MUST include'non-vegetarian'plus the protein sub-tag"+
"(one of: chicken, mutton, seafood).";
 return [
`Generate ${BATCH} distinct, authentic ${cuisine} ${diet ==="veg"?"vegetarian/vegan":"non-vegetarian"} recipes.`,
 dietRule,
`Set"cuisine"to exactly"${cuisine}".`,
"Add relevant tags from: high-protein, gluten-free, low-carb, dairy-free where they truly apply.",
"Each: 4-9 ingredients, a one-sentence summary, and 1-3 concise instruction sentences.",
 avoid.length ?`Do NOT repeat these dish titles: ${avoid.slice(-80).join(",")}.`:"",
'Return JSON: {"recipes": [ {"slug","title","summary","cuisine","tags":[],"servings",'+
'"instructions","ingredients":[{"name","qty","unit"}] } ] }',
 ]
 .filter(Boolean)
 .join("\n");
}

function load(): Seed[] {
 if (!existsSync(OUT)) return [];
 try { return JSON.parse(readFileSync(OUT,"utf8")) as Seed[]; } catch { return []; }
}

async function main() {
 const generated = load();
 const slugs = new Set([...CURATED, ...generated].map((r) => r.slug));
 const titles = new Set([...CURATED, ...generated].map((r) => r.title.toLowerCase()));
 const total = () => CURATED.length + generated.length;

 console.log(`Start: ${total()} recipes (target ${TARGET}). Generated file has ${generated.length}.`);

 const diets: Array<"veg"|"non-veg"> = ["veg","non-veg"];
 let guard = 0;
 while (total() < TARGET && guard < 200) {
 guard++;
 const cuisine = CANONICAL_CUISINES[guard % CANONICAL_CUISINES.length];
 const diet = diets[guard % 2];
 try {
 const { recipes: raw } = await generateJSON({
 system: SYSTEM,
 prompt: prompt(cuisine, diet, [...titles]),
 schema: BatchSchema,
 lite: true,
 });
 let added = 0;
 for (const candidate of raw) {
 const parsed = SeedSchema.safeParse(candidate);
 if (!parsed.success) continue; // skip malformed recipe, keep the rest
 const r = parsed.data as Seed;
 const slug = normalizeName(r.slug).replace(/\s+/g,"-") || normalizeName(r.title).replace(/\s+/g,"-");
 const t = r.title.toLowerCase();
 if (!slug || slugs.has(slug) || titles.has(t)) continue;
 // enforce canonical cuisine string
 r.cuisine = cuisine;
 r.slug = slug;
 slugs.add(slug);
 titles.add(t);
 generated.push(r);
 added++;
 if (total() >= TARGET) break;
 }
 writeFileSync(OUT, JSON.stringify(generated, null, 2));
 console.log(`+${added} ${cuisine}/${diet} → ${total()} total`);
 } catch (e: any) {
 console.error(`batch failed (${cuisine}/${diet}):`, e?.message ?? e);
 }
 }
 console.log(`\nDone: ${total()} recipes. Wrote ${generated.length} to ${OUT}.`);
 console.log("Next: npm run validate");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
