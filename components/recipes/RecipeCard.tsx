"use client";

import Link from"next/link";
import type { AlmostThereCard, RecipeCardData } from"@/lib/recipes/types";
import { FavoriteButton } from"./FavoriteButton";
import { RecipeArt } from"./RecipeArt";

function dietBadge(tags: string[]): { label: string; cls: string } {
 if (tags.includes("non-vegetarian")) return { label:"Non-veg", cls:"bg-accent-50 text-accent-700 ring-accent-600/20"};
 if (tags.includes("vegan")) return { label:"Vegan", cls:"bg-brand-50 text-brand-700 ring-brand-600/20"};
 if (tags.includes("egg")) return { label:"Egg", cls:"bg-amber-50 text-amber-700 ring-amber-600/20"};
 return { label:"Veg", cls:"bg-brand-50 text-brand-700 ring-brand-600/20"};
}

export function RecipeCard({
 recipe,
 showMatch = true,
}: {
 recipe: RecipeCardData | AlmostThereCard;
 showMatch?: boolean;
}) {
 const missing ="missing"in recipe ? recipe.missing : [];
 const badge = dietBadge(recipe.dietary_tags);
 const fav = {
 recipe_id: recipe.recipe_id,
 title: recipe.title,
 cuisine: recipe.cuisine,
 dietary_tags: recipe.dietary_tags,
 servings: recipe.servings,
 summary: recipe.summary,
 };

 return (
 <Link href={`/recipes/${recipe.recipe_id}`} className="group block h-full">
 <article className="flex h-full flex-col overflow-hidden rounded-xl border border-ink-900/[0.08] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
 {/* Illustrated banner */}
 <div className="relative overflow-hidden">
 <RecipeArt recipe={{ id: recipe.recipe_id, title: recipe.title, cuisine: recipe.cuisine }} className="h-32 w-full transition-transform duration-500 group-hover:scale-[1.05]"/>
 <div className="absolute left-3 top-3">
 <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badge.cls}`}>
 {badge.label}
 </span>
 </div>
 <div className="absolute right-3 top-3">
 <FavoriteButton recipe={fav} size="sm"/>
 </div>
 </div>

 <div className="flex flex-1 flex-col gap-3 p-4">
 <div>
 <h3 className="text-lg font-semibold leading-tight text-ink-900">{recipe.title}</h3>
 {recipe.summary && (
 <p className="mt-1 line-clamp-2 text-sm text-ink-700/80">{recipe.summary}</p>
 )}
 </div>

 <div className="mt-auto space-y-2">
 <div className="flex flex-wrap items-center gap-1.5">
 {recipe.cuisine && <span className="tag">{recipe.cuisine}</span>}
 <span className="tag">serves {recipe.servings}</span>
 </div>
 {showMatch &&
 (missing.length === 0 ? (
 <div className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
 ✓ You have everything — ready to cook
 </div>
 ) : (
 <div className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
 <span className="font-semibold">You have {recipe.have ?? 0} of {recipe.total ?? 0}.</span>{""}
 Add: {missing.join(",")}
 </div>
 ))}
 </div>
 </div>
 </article>
 </Link>
 );
}

export function RecipeCardSkeleton() {
 return <div className="skeleton h-64 w-full"/>;
}
