import { round } from"@/lib/domain/normalize";

export interface RecipeIngredientLine {
 normalized_name: string;
 name: string;
 ingredient_id: string | null;
 quantity: number | null;
 unit: string | null;
 aisle: string | null;
}

export interface PlanRecipeForGrocery {
 recipe_id: string;
 servings: number; // planned servings
 baseServings: number; // recipe's native servings
 ingredients: RecipeIngredientLine[];
}

export interface PantryLine {
 normalized_name: string;
 quantity: number;
}

export interface GroceryItem {
 ingredient_id: string | null;
 normalized_name: string;
 name: string;
 quantity: number | null;
 unit: string | null;
 aisle: string;
}

// Aggregate every ingredient the plan needs (scaled by servings), subtract what's
// already in the pantry, and return only the shortfall — grouped/sorted by aisle.
//
// Simplification: quantities are matched by ingredient name; unit reconciliation
// (litres vs ml) is intentionally out of scope for v1 and noted for follow-up.
export function computeGroceryList(
 planRecipes: PlanRecipeForGrocery[],
 pantry: PantryLine[],
): GroceryItem[] {
 const needed = new Map<string, GroceryItem>();

 for (const pr of planRecipes) {
 const scale = pr.baseServings > 0 ? pr.servings / pr.baseServings : 1;
 for (const ing of pr.ingredients) {
 const key =`${ing.normalized_name}|${ing.unit ??""}`;
 const scaled = ing.quantity != null ? ing.quantity * scale : null;
 const existing = needed.get(key);
 if (existing) {
 existing.quantity =
 existing.quantity != null && scaled != null
 ? existing.quantity + scaled
 : (existing.quantity ?? scaled);
 } else {
 needed.set(key, {
 ingredient_id: ing.ingredient_id,
 normalized_name: ing.normalized_name,
 name: ing.name,
 unit: ing.unit,
 aisle: ing.aisle ??"Other",
 quantity: scaled,
 });
 }
 }
 }

 const pantryByName = new Map<string, number>();
 for (const p of pantry) {
 pantryByName.set(p.normalized_name, (pantryByName.get(p.normalized_name) ?? 0) + (p.quantity ?? 0));
 }

 const result: GroceryItem[] = [];
 for (const item of needed.values()) {
 const have = pantryByName.get(item.normalized_name) ?? 0;
 if (item.quantity != null) {
 const short = item.quantity - have;
 if (short <= 0) continue; // pantry covers it
 result.push({ ...item, quantity: round(short) });
 } else {
 if (have > 0) continue; // unknown qty, but we have some → assume covered
 result.push({ ...item, quantity: null });
 }
 }

 result.sort((a, b) => a.aisle.localeCompare(b.aisle) || a.name.localeCompare(b.name));
 return result;
}
