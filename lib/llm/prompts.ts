import { INJECTION_GUARD_RULES, safeConstraints } from"@/lib/llm/safety";
import type { ParsedConstraints } from"@/lib/llm/schemas";

// Prompt builders. Each returns { system, prompt }. Untrusted free text is always
// passed through safeConstraints() (scrub PII + wrap against injection).

export function constraintParsePrompt(constraints: string) {
 return {
 system:`You convert a household's free-text dietary description into structured recipe-search filters. ${INJECTION_GUARD_RULES}`,
 prompt:`Extract dietary filters from the constraints.
Return JSON: {"includeTags": string[],"excludeIngredients": string[],"cuisines": string[],"mealsPerDay": string[],"notes": string }
- includeTags: lowercase dietary tags to prefer (e.g."vegetarian","vegan","high-protein","low-carb","gluten-free","dairy-free","halal").
- excludeIngredients: lowercase singular ingredient names to avoid (allergies/dislikes), e.g."peanut","shellfish".
- cuisines: preferred cuisines, if mentioned.
- mealsPerDay: subset of ["breakfast","lunch","dinner","snack"]; default ["breakfast","lunch","dinner"].
- notes: one short sentence capturing anything else relevant.

${safeConstraints(constraints)}`,
 };
}

export interface PromptRecipe {
 id: string;
 title: string;
 cuisine: string | null;
 dietary_tags: string[];
 servings: number;
 ingredients: string[];
}

export function planAssemblyPrompt(recipes: PromptRecipe[], parsed: ParsedConstraints) {
 const catalog = recipes
 .map(
 (r) =>
`- id=${r.id} | ${r.title} | cuisine=${r.cuisine ??"any"} | tags=[${r.dietary_tags.join(",")}] | serves ${r.servings} | ingredients: ${r.ingredients.join(",")}`,
 )
 .join("\n");

 return {
 system:`You are a meal planner. Assemble a 7-day plan using ONLY recipes from the provided catalog. ${INJECTION_GUARD_RULES}`,
 prompt:`Build a 7-day meal plan. day_of_week is 0=Sunday … 6=Saturday. Cover these meals each day: ${parsed.mealsPerDay.join(",")}.
Rules:
- Use ONLY recipe_id values that appear in the catalog. NEVER invent an id.
- Prefer recipes matching these tags: ${parsed.includeTags.join(",") ||"no specific tags"}.
- The catalog is already filtered to exclude: ${parsed.excludeIngredients.join(",") ||"nothing"} — still avoid anything matching.
- Vary meals across the week; do not use the same recipe more than twice.
- Default servings to 2.
Notes: ${parsed.notes ||"none"}

CATALOG:
${catalog}

Return JSON: {"entries": [ {"day_of_week": 0,"meal_type":"breakfast","recipe_id":"<id from catalog>","servings": 2 } ] }`,
 };
}

export function pantryCommandPrompt(transcript: string) {
 return {
 system:`You convert a spoken pantry update into structured commands. ${INJECTION_GUARD_RULES}`,
 prompt:`Extract pantry update commands from the transcribed speech below.
Return JSON: {"commands": [ {"action":"add|remove|set","item":"milk","quantity": 2,"unit":"litre"} ] }
-"add 2 litres of milk"→ { action:"add", item:"milk", quantity:2, unit:"litre"}
-"we're out of eggs"→ { action:"set", item:"eggs", quantity:0, unit:null }
-"remove the rice"→ { action:"remove", item:"rice", quantity:null, unit:null }
- item: a simple, singular, lowercase grocery name. quantity/unit null if unspecified.

${safeConstraints(transcript)}`,
 };
}
