import type { SupabaseClient } from"@supabase/supabase-js";
import { retrieveRecipes } from"@/lib/rag/retrieve";
import { generateJSON } from"@/lib/llm/provider";
import { constraintParsePrompt, planAssemblyPrompt } from"@/lib/llm/prompts";
import { ParsedConstraints, PlanAssembly } from"@/lib/llm/schemas";
import { validatePlanEntries } from"@/lib/domain/plan";

export interface GeneratePlanOpts {
 householdId: string;
 constraints?: string;
 weekStart: string;
 origin?:"user"|"cron";
 lite?: boolean; // use the lighter LLM for batch/cron paths
}

export interface GeneratePlanResult {
 planId: string;
 entryCount: number;
 weekStart: string;
}

// The full RAG pipeline, reusable by the API route (user) and cron (batch).
// Throws"NO_RECIPES"or"EMPTY_PLAN"for the caller to translate.
export async function generatePlanForHousehold(
 supabase: SupabaseClient,
 opts: GeneratePlanOpts,
): Promise<GeneratePlanResult> {
 const constraints = opts.constraints ??"";

 // 1. constraints → structured filters (PII-scrubbed + injection-guarded in the prompt)
 const cp = constraintParsePrompt(constraints);
 const filters = await generateJSON({
 system: cp.system,
 prompt: cp.prompt,
 schema: ParsedConstraints,
 lite: opts.lite,
 });

 // 2. retrieve grounding recipes (pgvector, tag-filtered, allergen-excluded)
 const query = [constraints, filters.cuisines.join(""), filters.includeTags.join(""), filters.notes]
 .filter(Boolean)
 .join(".");
 const recipes = await retrieveRecipes(supabase, query ||"balanced weekly meals", {
 includeTags: filters.includeTags,
 excludeIngredients: filters.excludeIngredients,
 k: 24,
 });
 if (recipes.length === 0) throw new Error("NO_RECIPES");

 // 3. assemble grounded plan
 const ap = planAssemblyPrompt(recipes, filters);
 const assembly = await generateJSON({ system: ap.system, prompt: ap.prompt, schema: PlanAssembly, lite: opts.lite });

 // 4. validate against retrieved set (anti-hallucination)
 const entries = validatePlanEntries(assembly, recipes);
 if (entries.length === 0) throw new Error("EMPTY_PLAN");

 // 5. persist
 const { data: plan, error: planErr } = await supabase
 .from("meal_plans")
 .insert({
 household_id: opts.householdId,
 week_start: opts.weekStart,
 constraints_text: constraints,
 generated_by: opts.origin ??"user",
 })
 .select("id")
 .single();
 if (planErr) throw planErr;

 const { error: entriesErr } = await supabase
 .from("meal_plan_entries")
 .insert(entries.map((e) => ({ ...e, meal_plan_id: plan.id })));
 if (entriesErr) throw entriesErr;

 return { planId: plan.id, entryCount: entries.length, weekStart: opts.weekStart };
}

export function upcomingSunday(): string {
 const now = new Date();
 const day = now.getUTCDay();
 const add = (7 - day) % 7 || 7;
 const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + add));
 return d.toISOString().slice(0, 10);
}
