import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import type { RecipeCardData } from "@/lib/recipes/types";

export const revalidate = 86400;
export const dynamicParams = true;

const TOP_INGREDIENTS = [
  "paneer", "tomato", "onion", "potato", "rice", "dal", "chicken", "egg",
  "garlic", "ginger", "spinach", "mushroom", "pasta", "cheese", "lentil",
  "chickpea", "carrot", "cauliflower", "peas", "tofu",
];

export async function generateStaticParams() {
  return TOP_INGREDIENTS.map((ingredient) => ({ ingredient }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ingredient: string }>;
}): Promise<Metadata> {
  const { ingredient } = await params;
  const name = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
  return {
    title: `${name} Recipes | MealMind`,
    description: `Find ${name.toLowerCase()} recipes you can make with ingredients already in your kitchen. Veg, non-veg, Indian, Italian and more — on MealMind.`,
    openGraph: {
      title: `${name} Recipes | MealMind`,
      images: [{ url: `/api/og?title=${encodeURIComponent(name + " Recipes")}&cuisine=`, width: 1200, height: 630 }],
    },
  };
}

async function getRecipesWithIngredient(ingredient: string): Promise<RecipeCardData[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);

  // Step 1: Find ingredient IDs matching the name
  const { data: ingRows } = await supabase
    .from("ingredients")
    .select("id")
    .ilike("name", `%${ingredient}%`);

  const ingIds = (ingRows ?? []).map((r: { id: string }) => r.id);

  if (ingIds.length > 0) {
    // Step 2: Find recipe IDs that use those ingredients
    const { data: riRows } = await supabase
      .from("recipe_ingredients")
      .select("recipe_id")
      .in("ingredient_id", ingIds);

    const recipeIds = [...new Set((riRows ?? []).map((r: { recipe_id: string }) => r.recipe_id))];

    if (recipeIds.length > 0) {
      // Step 3: Fetch recipe details
      const { data: recipes } = await supabase
        .from("recipes")
        .select("id, title, cuisine, dietary_tags, servings, summary")
        .in("id", recipeIds)
        .order("title")
        .limit(48);

      return (recipes ?? []).map((r: any) => ({
        recipe_id: r.id,
        title: r.title,
        cuisine: r.cuisine,
        dietary_tags: r.dietary_tags ?? [],
        servings: r.servings ?? 2,
        summary: r.summary,
        coverage: 1,
      }));
    }
  }

  // Fallback: search recipe titles
  const { data: fallback } = await supabase
    .from("recipes")
    .select("id, title, cuisine, dietary_tags, servings, summary")
    .ilike("title", `%${ingredient}%`)
    .order("title")
    .limit(24);

  return (fallback ?? []).map((r: any) => ({
    recipe_id: r.id,
    title: r.title,
    cuisine: r.cuisine,
    dietary_tags: r.dietary_tags ?? [],
    servings: r.servings ?? 2,
    summary: r.summary,
    coverage: 1,
  }));
}

export default async function IngredientPage({
  params,
}: {
  params: Promise<{ ingredient: string }>;
}) {
  const { ingredient } = await params;
  const name = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
  const recipes = await getRecipesWithIngredient(ingredient);

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="section py-12">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">
            Ingredient recipes
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink-900">
            {name} recipes
          </h1>
          <p className="mt-3 max-w-xl text-ink-700/70">
            {recipes.length > 0
              ? `${recipes.length} recipe${recipes.length !== 1 ? "s" : ""} using ${name.toLowerCase()} — cook with what you already have.`
              : `No recipes found for ${name.toLowerCase()} yet. Try the recipe maker instead.`}
          </p>
        </div>

        {recipes.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recipes.map((r) => (
                <RecipeCard key={r.recipe_id} recipe={r} showMatch={false} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <a href="/recipes/browse" className="btn-ghost">
                Browse all recipes &rarr;
              </a>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-ink-900/[0.08] bg-white p-12 text-center">
            <p className="text-4xl">🥘</p>
            <p className="mt-3 font-semibold text-ink-900">No recipes found</p>
            <p className="mt-1 text-sm text-ink-700/70">
              Try the recipe maker — enter your ingredients and find what you can cook right now.
            </p>
            <a href="/recipes" className="btn-primary mt-4 inline-flex">
              Open recipe maker
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
