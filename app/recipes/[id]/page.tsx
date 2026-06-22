import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient as createBrowserClient } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";
import type { RecipeCardData, RecipeDetailResponse } from "@/lib/recipes/types";

// ISR: cache each recipe page for 24 hours, re-generate in background after
export const revalidate = 86400;
// New recipe IDs not in generateStaticParams are rendered on first visit then cached
export const dynamicParams = true;

// Pre-render all 394 recipes at build time using the public anon key
export async function generateStaticParams() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase.from("recipes").select("id");
  return (data ?? []).map((r: { id: string }) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase
    .from("recipes")
    .select("title, summary, cuisine")
    .eq("id", id)
    .single();

  if (!data) return { title: "Recipe | MealMind" };

  const ogUrl = `/api/og?title=${encodeURIComponent(data.title)}&cuisine=${encodeURIComponent(data.cuisine ?? "")}`;

  return {
    title: `${data.title} Recipe | MealMind`,
    description:
      data.summary ??
      `Cook ${data.title} with ingredients you already have. Find the full recipe, portions, and step-by-step instructions on MealMind.`,
    openGraph: {
      title: `${data.title} Recipe`,
      description: data.summary ?? `Cook ${data.title} on MealMind`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: data.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.title} Recipe | MealMind`,
      images: [ogUrl],
    },
  };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, title, summary, cuisine, dietary_tags, servings, instructions")
    .eq("id", id)
    .single();
  if (!recipe) notFound();

  const { data: ris } = await supabase
    .from("recipe_ingredients")
    .select("quantity, unit, ingredients(name, aisle)")
    .eq("recipe_id", recipe.id);

  // Average rating
  const { data: ratingData } = await supabase
    .from("recipe_ratings")
    .select("rating")
    .eq("recipe_id", recipe.id);
  const ratings = (ratingData ?? []).map((r: { rating: number }) => r.rating);
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  const data: RecipeDetailResponse = {
    recipe: {
      id: recipe.id,
      title: recipe.title,
      summary: recipe.summary,
      cuisine: recipe.cuisine,
      dietary_tags: recipe.dietary_tags ?? [],
      instructions: recipe.instructions,
    },
    baseServings: recipe.servings ?? 2,
    servings: recipe.servings ?? 2,
    ingredients: (ris ?? []).map((row: any) => ({
      name: row.ingredients?.name ?? "item",
      quantity: row.quantity,
      unit: row.unit,
      aisle: row.ingredients?.aisle ?? null,
    })),
  };

  // Related recipes from the same cuisine
  let related: RecipeCardData[] = [];
  if (recipe.cuisine) {
    const { data: rel } = await supabase
      .from("recipes")
      .select("id, title, cuisine, dietary_tags, servings, summary")
      .eq("cuisine", recipe.cuisine)
      .neq("id", recipe.id)
      .limit(4);
    related = (rel ?? []).map((r: any) => ({
      recipe_id: r.id,
      title: r.title,
      cuisine: r.cuisine,
      dietary_tags: r.dietary_tags ?? [],
      servings: r.servings ?? 2,
      summary: r.summary,
      coverage: 1,
    }));
  }

  // JSON-LD structured data for Google rich results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.summary ?? undefined,
    recipeCuisine: recipe.cuisine ?? undefined,
    recipeYield: `${recipe.servings ?? 2} servings`,
    recipeIngredient: data.ingredients.map(
      (i) => `${i.quantity ?? ""} ${i.unit ?? ""} ${i.name}`.trim(),
    ),
    recipeInstructions: recipe.instructions
      ? [{ "@type": "HowToStep", text: recipe.instructions }]
      : [],
    ...(avgRating && ratings.length >= 3
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount: ratings.length,
          },
        }
      : {}),
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <div className="section py-10">
        <Link
          href="/recipes"
          className="mb-6 inline-block text-sm font-medium text-brand-700 hover:underline"
        >
          &larr; Back to recipe maker
        </Link>
        <RecipeDetail
          data={data}
          related={related}
          recipeId={recipe.id}
          avgRating={avgRating}
          ratingCount={ratings.length}
        />
      </div>
    </main>
  );
}
