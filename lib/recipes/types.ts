// Shared types for the public recipe-maker (cook-from / detail / recommend).

export type Diet ="veg"|"non-veg"|"any";

export interface RecipeCardData {
 recipe_id: string;
 title: string;
 cuisine: string | null;
 dietary_tags: string[];
 servings: number;
 summary: string | null;
 coverage: number; // 0..1
 have?: number; // ingredients the user has (match context)
 total?: number; // total ingredients in the recipe (match context)
}

export interface AlmostThereCard extends RecipeCardData {
 missing: string[]; // ingredient display names the user lacks
}

export interface CookFromResponse {
 full: RecipeCardData[]; // missing_count === 0 (make now)
 almost: AlmostThereCard[]; // 1..maxMissing items short
}

export interface ScaledIngredient {
 name: string;
 quantity: number | null;
 unit: string | null;
 aisle: string | null;
}

export interface RecipeDetailResponse {
 recipe: {
 id: string;
 title: string;
 summary: string | null;
 cuisine: string | null;
 dietary_tags: string[];
 instructions: string | null;
 };
 baseServings: number;
 servings: number;
 ingredients: ScaledIngredient[];
}

export interface RecommendBucket {
 cuisine: string;
 recipes: RecipeCardData[];
}

export interface RecommendResponse {
 makeNow: RecipeCardData[];
 almost: AlmostThereCard[];
 byCuisine: RecommendBucket[];
}
