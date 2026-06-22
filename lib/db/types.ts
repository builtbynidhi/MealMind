// Hand-written row types mirroring supabase/migrations/0001_init.sql.
// (You can later replace these with`supabase gen types typescript`output.)

export type HouseholdRole ="owner"|"member";
export type PlanOrigin ="user"|"cron";
export type MealType ="breakfast"|"lunch"|"dinner"|"snack";

export interface Profile {
 id: string;
 display_name: string | null;
 created_at: string;
}

export interface Household {
 id: string;
 name: string;
 created_by: string;
 created_at: string;
}

export interface HouseholdMember {
 household_id: string;
 user_id: string;
 role: HouseholdRole;
 joined_at: string;
}

export interface PantryItem {
 id: string;
 household_id: string;
 name: string;
 normalized_name: string;
 quantity: number;
 unit: string | null;
 low_stock_threshold: number | null;
 updated_at: string;
}

export interface Ingredient {
 id: string;
 name: string;
 normalized_name: string;
 aisle: string | null;
}

export interface Recipe {
 id: string;
 title: string;
 summary: string | null;
 cuisine: string | null;
 dietary_tags: string[];
 servings: number;
 instructions: string | null;
 source: string | null;
 created_at: string;
}

export interface RecipeIngredient {
 recipe_id: string;
 ingredient_id: string;
 quantity: number | null;
 unit: string | null;
}

export interface MealPlan {
 id: string;
 household_id: string;
 week_start: string;
 constraints_text: string | null;
 generated_by: PlanOrigin;
 status: string;
 created_at: string;
}

export interface MealPlanEntry {
 id: string;
 meal_plan_id: string;
 day_of_week: number; // 0 = Sunday … 6 = Saturday
 meal_type: string;
 recipe_id: string | null;
 servings: number;
}

export interface GroceryList {
 id: string;
 meal_plan_id: string;
 household_id: string;
 generated_at: string;
}

export interface GroceryListItem {
 id: string;
 grocery_list_id: string;
 ingredient_id: string | null;
 name: string;
 quantity: number | null;
 unit: string | null;
 aisle: string | null;
 is_checked: boolean;
}

export interface Notification {
 id: string;
 household_id: string;
 type: string;
 body: string;
 read: boolean;
 created_at: string;
}
