import type { PlanAssembly } from"@/lib/llm/schemas";
import type { PromptRecipe } from"@/lib/llm/prompts";

export interface ValidatedEntry {
 day_of_week: number;
 meal_type: string;
 recipe_id: string;
 servings: number;
}

// The anti-hallucination gate: drop any entry whose recipe_id isn't one we
// actually retrieved, enforce one recipe per (day, meal) slot, and cap repeats.
// This is what guarantees plans cite real recipes with real quantities.
export function validatePlanEntries(
 plan: PlanAssembly,
 retrieved: PromptRecipe[],
 maxRepeats = 2,
): ValidatedEntry[] {
 const allowed = new Set(retrieved.map((r) => r.id));
 const counts = new Map<string, number>();
 const filledSlots = new Set<string>();
 const out: ValidatedEntry[] = [];

 for (const e of plan.entries) {
 if (!allowed.has(e.recipe_id)) continue; // hallucinated → reject
 const slot =`${e.day_of_week}:${e.meal_type}`;
 if (filledSlots.has(slot)) continue;
 const used = counts.get(e.recipe_id) ?? 0;
 if (used >= maxRepeats) continue;

 counts.set(e.recipe_id, used + 1);
 filledSlots.add(slot);
 out.push({
 day_of_week: e.day_of_week,
 meal_type: e.meal_type,
 recipe_id: e.recipe_id,
 servings: e.servings,
 });
 }

 return out;
}
