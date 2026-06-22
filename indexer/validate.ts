// Read-only corpus validator. Run:`npm run validate`.
// Hard-fails (exit 1) on integrity errors; warns on soft issues. The veg/non-veg
// consistency check is the safety-critical one (allergen mislabeling).

import { normalizeName } from"@/lib/domain/normalize";
import { AISLE_RAW } from"./data/aisles";
import { allRecipes } from"./data";
import { CANONICAL_CUISINES, MEAT_TERMS } from"./data/types";

const TARGET = 400;
const cuisines = new Set<string>(CANONICAL_CUISINES);
const meat = new Set(MEAT_TERMS.map(normalizeName));
const aisleNorms = new Set(Object.keys(AISLE_RAW).map(normalizeName));

function main() {
 const recipes = allRecipes();
 const errors: string[] = [];
 const warnings: string[] = [];
 const slugs = new Set<string>();
 const byCuisine = new Map<string, number>();
 let veg = 0, nonVeg = 0;

 for (const r of recipes) {
 const id = r.slug || r.title;

 if (!r.slug || !/^[a-z0-9-]+$/.test(r.slug)) errors.push(`${id}: invalid slug (must be kebab-case)`);
 if (slugs.has(r.slug)) errors.push(`${id}: duplicate slug`);
 slugs.add(r.slug);

 if (!r.title?.trim()) errors.push(`${id}: missing title`);
 if (!r.instructions?.trim()) errors.push(`${id}: missing instructions`);
 if (!Number.isFinite(r.servings) || r.servings < 1) errors.push(`${id}: invalid servings`);
 if (!cuisines.has(r.cuisine)) errors.push(`${id}: non-canonical cuisine"${r.cuisine}"`);
 if (!r.ingredients || r.ingredients.length < 3) errors.push(`${id}: needs >=3 ingredients`);

 byCuisine.set(r.cuisine, (byCuisine.get(r.cuisine) ?? 0) + 1);

 const tags = new Set(r.tags ?? []);
 const isVeg = tags.has("vegetarian") || tags.has("vegan");
 const isNonVeg = tags.has("non-vegetarian");
 const isEgg = tags.has("egg");
 if (!isVeg && !isNonVeg && !isEgg) errors.push(`${id}: no veg/non-veg/egg classification tag`);
 if (isVeg && isNonVeg) errors.push(`${id}: tagged both vegetarian and non-vegetarian`);
 if (isNonVeg) nonVeg++; else veg++;

 // Safety-critical: any meat/seafood ingredient ⇒ must be non-vegetarian only.
 const hasMeat = (r.ingredients ?? []).some((ing) => meat.has(normalizeName(ing.name)));
 if (hasMeat && !isNonVeg) errors.push(`${id}: contains meat/seafood but not tagged non-vegetarian`);
 if (hasMeat && (tags.has("vegetarian") || tags.has("vegan")))
 errors.push(`${id}: contains meat/seafood but tagged vegetarian/vegan (DANGEROUS)`);
 if (!hasMeat && isNonVeg) warnings.push(`${id}: tagged non-vegetarian but no recognized meat ingredient`);

 for (const ing of r.ingredients ?? []) {
 if (!aisleNorms.has(normalizeName(ing.name))) warnings.push(`${id}:"${ing.name}"→ aisle Other (unmapped)`);
 }
 }

 console.log(`\nRecipes: ${recipes.length} (veg/egg: ${veg}, non-veg: ${nonVeg})`);
 console.log("By cuisine:", Object.fromEntries([...byCuisine.entries()].sort()));
 if (warnings.length) {
 console.log(`\n⚠ ${warnings.length} warning(s):`);
 for (const w of warnings.slice(0, 30)) console.log("-", w);
 if (warnings.length > 30) console.log(`…and ${warnings.length - 30} more`);
 }
 if (errors.length) {
 console.error(`\n✗ ${errors.length} ERROR(S):`);
 for (const e of errors.slice(0, 50)) console.error("-", e);
 process.exit(1);
 }
 if (recipes.length < TARGET) console.log(`\n(note: ${recipes.length}/${TARGET} target — generate more with \`npm run generate\`)`);
 console.log("\n✓ Validation passed.");
}

main();
