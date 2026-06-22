import { NextResponse, type NextRequest } from"next/server";
import { z } from"zod";
import { createClient } from"@/lib/supabase/server";
import { requireRole } from"@/lib/db/queries";
import { computeGroceryList, type PlanRecipeForGrocery, type RecipeIngredientLine } from"@/lib/domain/grocery";

export const runtime ="nodejs";

const Body = z.object({ mealPlanId: z.string().uuid() });

export async function POST(request: NextRequest) {
 const supabase = await createClient();
 const {
 data: { user },
 } = await supabase.auth.getUser();
 if (!user) return NextResponse.json({ error:"Unauthorized"}, { status: 401 });

 const parsed = Body.safeParse(await request.json().catch(() => null));
 if (!parsed.success) return NextResponse.json({ error:"Invalid body"}, { status: 400 });

 try {
 const { data: plan, error: planErr } = await supabase
 .from("meal_plans")
 .select("id, household_id")
 .eq("id", parsed.data.mealPlanId)
 .single();
 if (planErr || !plan) return NextResponse.json({ error:"Plan not found"}, { status: 404 });

 await requireRole(plan.household_id,"owner");

 const { data: entries } = await supabase
 .from("meal_plan_entries")
 .select("recipe_id, servings")
 .eq("meal_plan_id", plan.id);

 const recipeIds = [...new Set((entries ?? []).map((e: any) => e.recipe_id).filter(Boolean))];
 if (recipeIds.length === 0) return NextResponse.json({ error:"Plan has no recipes"}, { status: 422 });

 const [{ data: recipes }, { data: ris }, { data: pantry }] = await Promise.all([
 supabase.from("recipes").select("id, servings").in("id", recipeIds),
 supabase
 .from("recipe_ingredients")
 .select("recipe_id, quantity, unit, ingredients(id, name, normalized_name, aisle)")
 .in("recipe_id", recipeIds),
 supabase.from("pantry_items").select("normalized_name, quantity").eq("household_id", plan.household_id),
 ]);

 const baseServings = new Map((recipes ?? []).map((r: any) => [r.id, r.servings ?? 2]));
 const linesByRecipe = new Map<string, RecipeIngredientLine[]>();
 for (const row of (ris ?? []) as any[]) {
 const list = linesByRecipe.get(row.recipe_id) ?? [];
 list.push({
 ingredient_id: row.ingredients?.id ?? null,
 name: row.ingredients?.name ??"item",
 normalized_name: row.ingredients?.normalized_name ??"item",
 quantity: row.quantity,
 unit: row.unit,
 aisle: row.ingredients?.aisle ?? null,
 });
 linesByRecipe.set(row.recipe_id, list);
 }

 const planRecipes: PlanRecipeForGrocery[] = (entries ?? [])
 .filter((e: any) => e.recipe_id)
 .map((e: any) => ({
 recipe_id: e.recipe_id,
 servings: e.servings ?? 2,
 baseServings: baseServings.get(e.recipe_id) ?? 2,
 ingredients: linesByRecipe.get(e.recipe_id) ?? [],
 }));

 const items = computeGroceryList(
 planRecipes,
 (pantry ?? []).map((p: any) => ({ normalized_name: p.normalized_name, quantity: p.quantity ?? 0 })),
 );

 // Replace any prior list for this plan, then persist the fresh one.
 await supabase.from("grocery_lists").delete().eq("meal_plan_id", plan.id);
 const { data: list, error: listErr } = await supabase
 .from("grocery_lists")
 .insert({ meal_plan_id: plan.id, household_id: plan.household_id })
 .select("id")
 .single();
 if (listErr) throw listErr;

 if (items.length > 0) {
 const { error: itemsErr } = await supabase.from("grocery_list_items").insert(
 items.map((i) => ({
 grocery_list_id: list.id,
 ingredient_id: i.ingredient_id,
 name: i.name,
 quantity: i.quantity,
 unit: i.unit,
 aisle: i.aisle,
 })),
 );
 if (itemsErr) throw itemsErr;
 }

 return NextResponse.json({ groceryListId: list.id, items });
 } catch (err: any) {
 const msg = err?.message ??"Grocery generation failed";
 const status = /owner role required|not a member/i.test(msg) ? 403 : 500;
 return NextResponse.json({ error: msg }, { status });
 }
}
