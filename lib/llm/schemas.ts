import { z } from"zod";

// Structured I/O contracts for the LLM. Validated on every call so a bad/΅hallucinated
// response is caught at the boundary rather than corrupting data downstream.

export const ParsedConstraints = z.object({
 includeTags: z.array(z.string()).default([]), // dietary tags to prefer, e.g. ["vegetarian","high-protein"]
 excludeIngredients: z.array(z.string()).default([]), // normalized ingredient names to avoid (allergens/dislikes)
 cuisines: z.array(z.string()).default([]),
 mealsPerDay: z.array(z.string()).default(["breakfast","lunch","dinner"]),
 notes: z.string().default(""),
});
export type ParsedConstraints = z.infer<typeof ParsedConstraints>;

export const PlanAssembly = z.object({
 entries: z
 .array(
 z.object({
 day_of_week: z.number().int().min(0).max(6),
 meal_type: z.string(),
 recipe_id: z.string(), // MUST be one of the retrieved recipe IDs (validated in domain)
 servings: z.number().int().min(1).max(12).default(2),
 }),
 )
 .min(1),
});
export type PlanAssembly = z.infer<typeof PlanAssembly>;

export const PantryCommandSet = z.object({
 commands: z
 .array(
 z.object({
 action: z.enum(["add","remove","set"]),
 item: z.string(),
 quantity: z.number().nullable().default(null),
 unit: z.string().nullable().default(null),
 }),
 )
 .default([]),
});
export type PantryCommandSet = z.infer<typeof PantryCommandSet>;
